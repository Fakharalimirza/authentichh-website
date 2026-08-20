const pool = require('../config/db');
const { slugify } = require('../utils/slugify');

/** Check whether a column exists on a table (for schema-conditional writes). */
async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].cnt > 0;
}

/** Check whether a table exists (guards schema-conditional writes like unit_landlords). */
async function tableExists(conn, table) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return rows[0].cnt > 0;
}

/** Normalize text for fuzzy matching: trim, uppercase, collapse whitespace, strip punctuation. */
function normalizeText(s) {
  if (s === undefined || s === null) return '';
  return String(s)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
}

/** Levenshtein edit distance — used as the last-resort fuzzy name matcher. */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Find a landlord — dedupe-first engine. Resolution order:
 *   identity_number (exact) → passport_number (exact) → phone (exact) →
 *   email (exact) → full_name (exact).
 * Returns { row, matchedBy } or null.
 */
async function findLandlord(conn, landlord) {
  const candidates = [
    ['identity_number', 'identity_number'],
    ['passport_number', 'passport_number'],
    ['phone', 'phone'],
    ['email', 'email'],
    ['full_name', 'full_name'],
  ];
  for (const [key, column] of candidates) {
    const value = landlord[key];
    if (!value) continue;
    const [rows] = await conn.query(
      `SELECT * FROM landlords WHERE \`${column}\` = ? LIMIT 1`,
      [value]
    );
    if (rows.length) return { row: rows[0], matchedBy: column };
  }
  return null;
}

/**
 * Find a building by fuzzy name. Resolution order:
 *   normalized exact → LIKE (substring containment) → Levenshtein (threshold ≈ 3).
 * Returns { row, matchedBy } or null.
 */
async function fuzzyBuildingSearch(conn, name) {
  const target = normalizeText(name);
  if (!target) return null;

  const [rows] = await conn.query('SELECT * FROM buildings');

  // 1. Normalized exact match
  for (const row of rows) {
    if (normalizeText(row.name) === target) {
      return { row, matchedBy: 'exact' };
    }
  }

  // 2. LIKE — substring containment either direction (normalized)
  for (const row of rows) {
    const normalized = normalizeText(row.name);
    if (normalized && (normalized.includes(target) || target.includes(normalized))) {
      return { row, matchedBy: 'like' };
    }
  }

  // 3. Levenshtein edit distance (threshold ≈ 3)
  let best = null;
  let bestDist = Infinity;
  for (const row of rows) {
    const dist = levenshtein(normalizeText(row.name), target);
    if (dist < bestDist) {
      bestDist = dist;
      best = row;
    }
  }
  if (best && bestDist <= 3) return { row: best, matchedBy: 'levenshtein' };

  return null;
}

/** Unit apartment_number normalization = trim + uppercase. */
function normalizeApartment(s) {
  if (s === undefined || s === null) return '';
  return String(s).trim().toUpperCase();
}

/** Find a unit by (building_id, normalized apartment_number). */
async function findUnit(conn, buildingId, apartmentNumber) {
  const normalized = normalizeApartment(apartmentNumber);
  if (!buildingId || !normalized) return null;
  const [rows] = await conn.query(
    'SELECT * FROM units WHERE building_id = ? AND UPPER(TRIM(apartment_number)) = ? LIMIT 1',
    [buildingId, normalized]
  );
  return rows.length ? rows[0] : null;
}

/**
 * Fill empty fields on an existing row from incoming values — never overwrites
 * existing non-empty fields. Uses COALESCE(NULLIF(existing, ''), ?) so an empty
 * incoming value is ignored and a populated existing value wins.
 */
async function fillEmptyFields(conn, table, id, incoming, fields) {
  const sets = [];
  const params = [];
  for (const field of fields) {
    const value = incoming[field];
    if (value === undefined || value === null) continue;
    sets.push(`\`${field}\` = COALESCE(NULLIF(\`${field}\`, ''), ?)`);
    params.push(value);
  }
  if (sets.length === 0) return;
  await conn.query(
    `UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`,
    [...params, id]
  );
}

/**
 * Link an array of owner ids to a unit via the unit_landlords junction table.
 * The table may not exist yet (migration pending) — in that case we silently
 * skip so the rest of the flow still works (units.landlord_id carries the
 * primary link either way).
 */
async function linkOwnersToUnit(conn, unitId, ownerIds, primaryOwnerId) {
  const hasJunction = await tableExists(conn, 'unit_landlords');
  if (!hasJunction) return;
  try {
    for (const landlordId of ownerIds) {
      await conn.query(
        'INSERT IGNORE INTO unit_landlords (unit_id, landlord_id, is_primary) VALUES (?, ?, ?)',
        [unitId, landlordId, landlordId === primaryOwnerId ? 1 : 0]
      );
    }
  } catch (err) {
    // Junction table write failed — units.landlord_id already covers the link.
  }
}

// Fields that scans may enrich on an existing landlord (never overwrites non-empty).
const LANDLORD_FIELDS = [
  'full_name', 'full_name_ar', 'email', 'phone', 'identity_number',
  'passport_number', 'nationality', 'date_of_birth',
  'bank_name', 'bank_account_holder', 'bank_account_number',
  'iban', 'swift_code', 'bank_branch', 'bank_account_currency', 'bank_address',
];

// Fields a scan may enrich on an existing unit during RENEWAL mode.
const UNIT_FIELDS = [
  'apartment_number', 'property_type', 'house_type', 'internet_provider',
  'internet_account_number', 'dewa_premises_number', 'commission_percent',
  'bedrooms', 'bathrooms', 'parking_spots', 'parking_spot_numbers',
  'wifi_username', 'wifi_password', 'max_guests', 'size_sqft', 'size_sqm',
  'floor', 'dewa_account_number', 'utility_bills_paid_by', 'description',
];

/** parking_spot_numbers arrives as an array from the frontend — normalize it. */
function normalizeUnitData(unit) {
  const parkingSpotNumbers = Array.isArray(unit.parking_spot_numbers) ? unit.parking_spot_numbers : null;
  const parkingSpots = parkingSpotNumbers && parkingSpotNumbers.length > 0
    ? (unit.parking_spots ?? parkingSpotNumbers.length)
    : (unit.parking_spots ?? 0);
  const parkingSpotNumbersStr = parkingSpotNumbers
    ? parkingSpotNumbers.join(', ')
    : (unit.parking_spot_numbers ?? '');
  return { ...unit, parking_spots: parkingSpots, parking_spot_numbers: parkingSpotNumbersStr };
}

/**
 * Dedupe-first landlord resolution: find (enrich empties) or INSERT.
 * Returns { id, created, matchedBy }.
 */
async function resolveOrCreateLandlord(conn, landlordData) {
  const hasFullNameAr = await columnExists(conn, 'landlords', 'full_name_ar');
  const fields = hasFullNameAr
    ? LANDLORD_FIELDS
    : LANDLORD_FIELDS.filter(f => f !== 'full_name_ar');

  const match = await findLandlord(conn, landlordData);
  if (match) {
    await fillEmptyFields(conn, 'landlords', match.row.id, landlordData, fields);
    return { id: match.row.id, created: false, matchedBy: match.matchedBy };
  }

  const placeholders = fields.map(() => '?').join(', ');
  const values = fields.map(f => {
    const v = landlordData[f];
    if (f === 'date_of_birth') return v ? v : null;
    return v ?? '';
  });
  const [result] = await conn.query(
    `INSERT INTO landlords (${fields.map(f => `\`${f}\``).join(', ')})
     VALUES (${placeholders})`,
    values
  );
  return { id: result.insertId, created: true, matchedBy: null };
}

/**
 * Smart Scan Onboarding — resolve-first ("dedupe-first") engine.
 * One transaction: resolve community + building (fuzzy) + owner(s), then
 * resolve the unit by (building_id, apartment_number).
 *   - NOT FOUND → CREATE unit + auto-draft listing, link all owners.
 *   - FOUND    → RENEWAL: enrich empty unit fields, link owners, sync primary.
 *
 * Body: { landlord, building, community, unit, owners, primaryOwnerIndex }
 * Responds 201 with the resolved/created record ids.
 */
exports.createOnboarding = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const {
      landlord = {},
      building = {},
      community = {},
      unit = {},
      owners: ownersInput,
      primaryOwnerIndex,
    } = req.body;

    await conn.beginTransaction();

    // ── 1. Resolve community (case-insensitive exact name) ────────────────
    let communityId = null;
    let communityCreated = false;
    if (community.name) {
      const [existing] = await conn.query(
        'SELECT id FROM communities WHERE LOWER(name) = LOWER(?) LIMIT 1',
        [community.name]
      );
      if (existing.length) {
        communityId = existing[0].id;
      } else {
        const code = slugify(community.name) || `comm-${Date.now()}`;
        const [result] = await conn.query(
          `INSERT INTO communities (name, arabic_name, code, sector_number, sector, city)
           VALUES (?, ?, ?, 1, 'Sector 1', 'Dubai')`,
          [community.name, community.arabic_name || '', code]
        );
        communityId = result.insertId;
        communityCreated = true;
      }
    }

    // ── 2. Resolve building (fuzzy) ────────────────────────────────────────
    let buildingRes = null;
    if (building.building_id) {
      const [rows] = await conn.query(
        'SELECT * FROM buildings WHERE id = ?',
        [building.building_id]
      );
      if (!rows.length) {
        throw Object.assign(new Error('Building not found for the provided building_id'), { status: 400 });
      }
      buildingRes = { id: rows[0].id, created: false, matchedBy: 'id', row: rows[0] };
    } else if (building.name) {
      const found = await fuzzyBuildingSearch(conn, building.name);
      if (found) {
        await fillEmptyFields(conn, 'buildings', found.row.id, building, ['name_ar', 'plot_number', 'plus_code']);
        buildingRes = { id: found.row.id, created: false, matchedBy: found.matchedBy, row: found.row };
      } else {
        const [result] = await conn.query(
          `INSERT INTO buildings (name, name_ar, plot_number, plus_code, city)
           VALUES (?, ?, ?, ?, 'Dubai')`,
          [building.name, building.name_ar || '', building.plot_number || '', building.plus_code || '']
        );
        buildingRes = {
          id: result.insertId,
          created: true,
          matchedBy: null,
          row: { id: result.insertId, name: building.name, name_ar: building.name_ar || '' },
        };
      }
    }

    // unit.building_id overrides the resolved building id (after verifying it exists)
    if (unit.building_id) {
      const [rows] = await conn.query(
        'SELECT * FROM buildings WHERE id = ?',
        [unit.building_id]
      );
      if (!rows.length) {
        throw Object.assign(new Error('Building not found for the provided unit.building_id'), { status: 400 });
      }
      buildingRes = { id: rows[0].id, created: false, matchedBy: 'id', row: rows[0] };
    }

    if (!buildingRes) {
      throw Object.assign(new Error('A building name or building_id is required'), { status: 400 });
    }
    const buildingId = buildingRes.id;
    const buildingName = buildingRes.row.name;
    const buildingNameAr = buildingRes.row.name_ar || '';

    // ── 3. Resolve owner(s) — dedupe-first ─────────────────────────────────
    // If `owners` is provided use it (ALL owners INCLUDING the primary),
    // otherwise the single `landlord` object is the only owner.
    const owners = Array.isArray(ownersInput) && ownersInput.length > 0
      ? ownersInput
      : [landlord];
    const primaryIdx = (Number.isInteger(primaryOwnerIndex) && primaryOwnerIndex >= 0 && primaryOwnerIndex < owners.length)
      ? primaryOwnerIndex
      : 0;

    const ownerResults = [];
    for (const owner of owners) {
      ownerResults.push(await resolveOrCreateLandlord(conn, owner));
    }
    const primaryOwner = ownerResults[primaryIdx];
    const primaryOwnerId = primaryOwner.id;
    const allOwnerIds = ownerResults.map(o => o.id);

    // ── 4. Resolve unit by (building_id, normalized apartment_number) ───────
    const apartmentNumber = (unit.apartment_number || '').toString().trim();
    const normalizedApartment = normalizeApartment(unit.apartment_number);
    if (!buildingId || !normalizedApartment) {
      throw Object.assign(new Error('building_id and apartment_number are required'), { status: 400 });
    }

    const existingUnit = await findUnit(conn, buildingId, normalizedApartment);
    const unitData = normalizeUnitData(unit);

    let unitId;
    let unitCreated;
    let mode;
    let listingId = null;
    let listingCreated = false;

    if (existingUnit) {
      // ── RENEWAL — enrich the existing unit, never create a new one ──────
      unitId = existingUnit.id;
      unitCreated = false;
      mode = 'renewal';

      await fillEmptyFields(conn, 'units', unitId, unitData, UNIT_FIELDS);
      await linkOwnersToUnit(conn, unitId, allOwnerIds, primaryOwnerId);
      await conn.query('UPDATE units SET landlord_id = ? WHERE id = ?', [primaryOwnerId, unitId]);
    } else {
      // ── CREATE — new unit + auto-draft listing ──────────────────────────
      mode = 'new';
      unitCreated = true;

      const autoTitle = [
        buildingName,
        apartmentNumber ? `Apartment ${apartmentNumber}` : 'Unit',
      ].filter(Boolean).join(' - ');

      let slug = slugify(autoTitle);
      const [dupeUnits] = await conn.query('SELECT id FROM units WHERE slug = ? LIMIT 1', [slug]);
      const [dupeListings] = await conn.query('SELECT id FROM listings WHERE slug = ? LIMIT 1', [slug]);
      if (dupeUnits.length || dupeListings.length) {
        slug = `${slug}-${Date.now()}`;
      }

      const location = unit.location || buildingName;

      const [unitResult] = await conn.query(
        `INSERT INTO units (
          building_id, community_id, landlord_id, apartment_number,
          property_type, house_type, internet_provider, internet_account_number,
          dewa_premises_number, commission_percent, bedrooms, bathrooms, parking_spots,
          parking_spot_numbers, wifi_username, wifi_password,
          max_guests, size_sqft, size_sqm, floor, dewa_account_number, utility_bills_paid_by,
          description, title, slug, building_name,
          location, location_ar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          buildingId,
          communityId ?? null,
          primaryOwnerId ?? null,
          apartmentNumber,
          unit.property_type ?? '',
          unit.house_type ?? '',
          unit.internet_provider ?? '',
          unit.internet_account_number ?? '',
          unit.dewa_premises_number ?? '',
          unit.commission_percent ?? 0,
          unit.bedrooms ?? 0,
          unit.bathrooms ?? 0,
          unitData.parking_spots,
          unitData.parking_spot_numbers,
          unit.wifi_username ?? '',
          unit.wifi_password ?? '',
          unit.max_guests ?? 0,
          unit.size_sqft ?? null,
          unit.size_sqm ?? null,
          unit.floor ?? '',
          unit.dewa_account_number ?? '',
          unit.utility_bills_paid_by ?? 'management',
          unit.description ?? '',
          autoTitle,
          slug,
          buildingName,
          location,
          unit.location_ar ?? buildingNameAr ?? ''
        ]
      );
      unitId = unitResult.insertId;

      const [listingResult] = await conn.query(
        `INSERT INTO listings (
          unit_id, title, slug, property_type, building_name, location, location_ar,
          max_guests, size_sqft, description, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          unitId,
          autoTitle,
          slug,
          unit.property_type ?? '',
          buildingName,
          location,
          unit.location_ar ?? buildingNameAr ?? '',
          unit.max_guests ?? 0,
          unit.size_sqft ?? null,
          unit.description ?? '',
          'draft'
        ]
      );
      listingId = listingResult.insertId;
      listingCreated = true;

      await linkOwnersToUnit(conn, unitId, allOwnerIds, primaryOwnerId);
    }

    await conn.commit();

    res.status(201).json({
      landlord: { id: primaryOwnerId, created: primaryOwner.created, matchedBy: primaryOwner.matchedBy },
      owners: ownerResults.map(o => ({ id: o.id, created: o.created, matchedBy: o.matchedBy })),
      building: { id: buildingId, created: buildingRes.created, matchedBy: buildingRes.matchedBy },
      community: { id: communityId, created: communityCreated },
      unit: { id: unitId, created: unitCreated, mode },
      listing: listingId ? { id: listingId, created: listingCreated } : null,
    });
  } catch (err) {
    await conn.rollback();
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  } finally {
    conn.release();
  }
};

/**
 * Preview — RESOLVE ONLY. Zero writes, no transaction.
 * Reports whether landlord / building / community / unit already exist and
 * the unit mode ('renewal' when found, 'new' when resolvable but not found).
 * Never throws — falls back to the empty shape on any resolution error.
 *
 * Body: same as createOnboarding (landlord, building, community, unit; owners optional)
 */
exports.previewOnboarding = async (req, res, next) => {
  try {
    const { landlord = {}, building = {}, community = {}, unit = {} } = req.body;

    // ── Community ─────────────────────────────────────────────────────────
    let communityExists = false;
    let communityId = null;
    if (community.name) {
      const [rows] = await pool.query(
        'SELECT id FROM communities WHERE LOWER(name) = LOWER(?) LIMIT 1',
        [community.name]
      );
      if (rows.length) {
        communityExists = true;
        communityId = rows[0].id;
      }
    }

    // ── Landlord ──────────────────────────────────────────────────────────
    let landlordExists = false;
    let landlordId = null;
    let landlordMatchedBy = null;
    let landlordName = null;
    const landlordMatch = await findLandlord(pool, landlord);
    if (landlordMatch) {
      landlordExists = true;
      landlordId = landlordMatch.row.id;
      landlordMatchedBy = landlordMatch.matchedBy;
      landlordName = landlordMatch.row.full_name || null;
    }

    // ── Building ──────────────────────────────────────────────────────────
    let buildingExists = false;
    let buildingId = null;
    let buildingMatchedBy = null;
    let buildingName = null;

    const tryBuildingId = async (id) => {
      if (!id || buildingId) return;
      const [rows] = await pool.query('SELECT id, name FROM buildings WHERE id = ?', [id]);
      if (rows.length) {
        buildingExists = true;
        buildingId = rows[0].id;
        buildingMatchedBy = 'id';
        buildingName = rows[0].name;
      }
    };

    await tryBuildingId(building.building_id);
    await tryBuildingId(unit.building_id);
    if (!buildingId && building.name) {
      const found = await fuzzyBuildingSearch(pool, building.name);
      if (found) {
        buildingExists = true;
        buildingId = found.row.id;
        buildingMatchedBy = found.matchedBy;
        buildingName = found.row.name;
      }
    }

    // ── Unit ──────────────────────────────────────────────────────────────
    let unitExists = null;
    let unitId = null;
    let unitMode = null;
    const normalizedApartment = normalizeApartment(unit.apartment_number);
    if (buildingId && normalizedApartment) {
      const existing = await findUnit(pool, buildingId, normalizedApartment);
      if (existing) {
        unitExists = true;
        unitId = existing.id;
        unitMode = 'renewal';
      } else {
        unitExists = false;
        unitId = null;
        unitMode = 'new';
      }
    }

    res.json({
      landlord: { exists: landlordExists, id: landlordId, matchedBy: landlordMatchedBy, name: landlordName },
      building: { exists: buildingExists, id: buildingId, matchedBy: buildingMatchedBy, name: buildingName },
      community: { exists: communityExists, id: communityId },
      unit: { exists: unitExists, id: unitId, mode: unitMode },
    });
  } catch (err) {
    // Preview never throws — return the empty shape on any resolution error.
    res.json({
      landlord: { exists: false, id: null, matchedBy: null, name: null },
      building: { exists: false, id: null, matchedBy: null, name: null },
      community: { exists: false, id: null },
      unit: { exists: null, id: null, mode: null },
    });
  }
};
