const pool = require('../config/db');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { slugify } = require('../utils/slugify');

const BASE_SELECT = `
  SELECT
    u.id, u.building_id, u.community_id, u.landlord_id,
    u.apartment_number, u.property_type, u.house_type,
    u.internet_provider, u.internet_account_number, u.dewa_premises_number,
    u.commission_percent, u.bedrooms, u.bathrooms, u.parking_spots,
    u.parking_spot_numbers, u.wifi_username, u.wifi_password,
    u.max_guests, u.size_sqft, u.size_sqm, u.floor, u.dewa_account_number, u.utility_bills_paid_by,
    u.description,
    u.title, u.slug, u.location, u.building_name, u.created_at, u.updated_at,
    b.name AS building_name,
    b.name_ar AS building_name_ar,
    l.full_name AS landlord_name,
    l.email AS landlord_email,
    l.phone AS landlord_phone,
    lst.id AS listing_id,
    lst.title AS listing_title,
    lst.slug AS listing_slug,
    lst.status AS listing_status
  FROM units u
  LEFT JOIN buildings b ON u.building_id = b.id
  LEFT JOIN landlords l ON u.landlord_id = l.id
  LEFT JOIN listings lst ON lst.unit_id = u.id
`;

exports.getAll = async (req, res, next) => {
  try {
    const {
      search,
      building_id,
      landlord_id,
      property_type,
      has_listing,
      page: pageQ,
      limit: limitQ
    } = req.query;

    const page = parseInt(pageQ) || 1;
    const limit = parseInt(limitQ) || 20;
    const offset = (page - 1) * limit;

    let where = ' WHERE 1=1';
    const params = [];

    if (search) {
      where += `
        AND (
          u.apartment_number LIKE ?
          OR b.name LIKE ?
          OR l.full_name LIKE ?
        )
      `;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (building_id) {
      where += ' AND u.building_id = ?';
      params.push(building_id);
    }

    if (landlord_id) {
      where += ' AND u.landlord_id = ?';
      params.push(landlord_id);
    }

    if (property_type) {
      where += ' AND u.property_type = ?';
      params.push(property_type);
    }

    if (has_listing === 'yes') {
      where += ' AND lst.id IS NOT NULL';
    } else if (has_listing === 'no') {
      where += ' AND lst.id IS NULL';
    }

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM units u
       LEFT JOIN buildings b ON u.building_id = b.id
       LEFT JOIN landlords l ON u.landlord_id = l.id
       LEFT JOIN listings lst ON lst.unit_id = u.id
       ${where}`,
      params
    );
    const total = countRows[0].total;

    const [units] = await pool.execute(
      `${BASE_SELECT} ${where}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      data: units,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `${BASE_SELECT} WHERE u.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    res.json({ unit: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      building_id,
      community_id,
      landlord_id,
      apartment_number,
      property_type,
      house_type,
      internet_provider,
      internet_account_number,
      dewa_premises_number,
      commission_percent,
      bedrooms,
      bathrooms,
      parking_spots,
      parking_spot_numbers,
      wifi_username,
      wifi_password,
      max_guests,
      size_sqft,
      size_sqm,
      floor,
      dewa_account_number,
      utility_bills_paid_by,
      description,
      title,
      location,
      location_ar
    } = req.body;

    // Resolve building name for title generation
    let buildingName = '';
    let buildingNameAr = '';
    if (building_id) {
      const [bRows] = await pool.execute(
        'SELECT name, name_ar FROM buildings WHERE id = ?',
        [building_id]
      );
      if (bRows.length > 0) {
        buildingName = bRows[0].name;
        buildingNameAr = bRows[0].name_ar;
      }
    }

    const autoTitle =
      title ||
      [buildingName, apartment_number ? `Apartment ${apartment_number}` : 'Unit']
        .filter(Boolean)
        .join(' - ');

    const slug = slugify(autoTitle);

    const [insertResult] = await pool.execute(
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
        building_id ?? null,
        community_id ?? null,
        landlord_id ?? null,
        apartment_number ?? '',
        property_type ?? '',
        house_type ?? '',
        internet_provider ?? '',
        internet_account_number ?? '',
        dewa_premises_number ?? '',
        commission_percent ?? 0,
        bedrooms ?? 0,
        bathrooms ?? 0,
        parking_spots ?? 0,
        parking_spot_numbers ?? '',
        wifi_username ?? '',
        wifi_password ?? '',
        max_guests ?? 0,
        size_sqft ?? null,
        size_sqm ?? null,
        floor ?? '',
        dewa_account_number ?? '',
        utility_bills_paid_by ?? 'management',
        description ?? '',
        autoTitle,
        slug,
        buildingName,
        location ?? buildingName,
        location_ar ?? buildingNameAr ?? ''
      ]
    );
    const unitId = insertResult.insertId;

    // Auto-create a draft listing linked to this unit
    const listingTitle = autoTitle;
    const [listingResult] = await pool.execute(
      `INSERT INTO listings (
        unit_id, title, slug, property_type, building_name, location, location_ar,
        max_guests, size_sqft, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        unitId,
        listingTitle,
        slug,
        property_type ?? '',
        buildingName,
        location ?? buildingName,
        location_ar ?? buildingNameAr ?? '',
        max_guests ?? 0,
        size_sqft ?? null,
        description ?? '',
        'draft'
      ]
    );

    const unit = await this.getUnitById(unitId);
    const [listingRows] = await pool.execute(
      'SELECT * FROM listings WHERE id = ?',
      [listingResult.insertId]
    );

    res.status(201).json({
      message: 'Unit and draft listing created',
      unit: unit || { id: unitId },
      listing: listingRows[0] || { id: listingResult.insertId }
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      building_id,
      community_id,
      landlord_id,
      apartment_number,
      property_type,
      house_type,
      internet_provider,
      internet_account_number,
      dewa_premises_number,
      commission_percent,
      bedrooms,
      bathrooms,
      parking_spots,
      parking_spot_numbers,
      wifi_username,
      wifi_password,
      max_guests,
      size_sqft,
      size_sqm,
      floor,
      dewa_account_number,
      utility_bills_paid_by,
      description,
      location,
      location_ar
    } = req.body;

    const [existing] = await pool.execute('SELECT * FROM units WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    await pool.execute(
      `UPDATE units SET
        building_id = COALESCE(?, building_id),
        community_id = COALESCE(?, community_id),
        landlord_id = COALESCE(?, landlord_id),
        apartment_number = COALESCE(?, apartment_number),
        property_type = COALESCE(?, property_type),
        house_type = COALESCE(?, house_type),
        internet_provider = COALESCE(?, internet_provider),
        internet_account_number = COALESCE(?, internet_account_number),
        dewa_premises_number = COALESCE(?, dewa_premises_number),
        commission_percent = COALESCE(?, commission_percent),
        bedrooms = COALESCE(?, bedrooms),
        bathrooms = COALESCE(?, bathrooms),
        parking_spots = COALESCE(?, parking_spots),
        parking_spot_numbers = COALESCE(?, parking_spot_numbers),
        wifi_username = COALESCE(?, wifi_username),
        wifi_password = COALESCE(?, wifi_password),
        max_guests = COALESCE(?, max_guests),
        size_sqft = COALESCE(?, size_sqft),
        size_sqm = COALESCE(?, size_sqm),
        floor = COALESCE(?, floor),
        dewa_account_number = COALESCE(?, dewa_account_number),
        utility_bills_paid_by = COALESCE(?, utility_bills_paid_by),
        description = COALESCE(?, description),
        location = COALESCE(?, location),
        location_ar = COALESCE(?, location_ar)
      WHERE id = ?`,
      [
        building_id ?? null,
        community_id ?? null,
        landlord_id ?? null,
        apartment_number ?? null,
        property_type ?? null,
        house_type ?? null,
        internet_provider ?? null,
        internet_account_number ?? null,
        dewa_premises_number ?? null,
        commission_percent ?? null,
        bedrooms ?? null,
        bathrooms ?? null,
        parking_spots ?? null,
        parking_spot_numbers ?? null,
        wifi_username ?? null,
        wifi_password ?? null,
        max_guests ?? null,
        size_sqft ?? null,
        size_sqm ?? null,
        floor ?? null,
        dewa_account_number ?? null,
        utility_bills_paid_by ?? null,
        description ?? null,
        location ?? null,
        location_ar ?? null,
        id
      ]
    );

    // If a linked listing exists, sync all common fields from the unit
    const [listingRows] = await pool.execute(
      'SELECT id FROM listings WHERE unit_id = ? AND id IS NOT NULL LIMIT 1',
      [id]
    );

    if (listingRows.length > 0) {
      const targetBuildingId = building_id ?? existing[0].building_id;
      let buildingName = existing[0].building_name || '';
      if (targetBuildingId) {
        const [bRows] = await pool.execute(
          'SELECT name FROM buildings WHERE id = ?',
          [targetBuildingId]
        );
        if (bRows.length > 0) buildingName = bRows[0].name;
      }

      await pool.execute(
        `UPDATE listings SET
          bedrooms = COALESCE(?, bedrooms),
          bathrooms = COALESCE(?, bathrooms),
          parking_spots = COALESCE(?, parking_spots),
          max_guests = COALESCE(?, max_guests),
          size_sqft = COALESCE(?, size_sqft),
          description = COALESCE(?, description),
          property_type = COALESCE(?, property_type),
          building_name = COALESCE(?, building_name),
          building_name_ar = COALESCE(?, building_name_ar),
          location = COALESCE(?, location),
          location_ar = COALESCE(?, location_ar)
         WHERE id = ?`,
        [
          bedrooms ?? null,
          bathrooms ?? null,
          parking_spots ?? null,
          max_guests ?? null,
          size_sqft ?? null,
          description ?? null,
          property_type ?? null,
          buildingName,
          existing[0].building_name_ar || '',
          location ?? null,
          existing[0].location_ar || '',
          listingRows[0].id
        ]
      );
    }

    const [unit] = await pool.execute(`${BASE_SELECT} WHERE u.id = ?`, [id]);

    res.json({
      message: 'Unit updated',
      unit: unit[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT id FROM units WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    await pool.execute('DELETE FROM units WHERE id = ?', [id]);

    res.json({ message: 'Unit deleted. Linked listing unit_id set to null.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/units/bulk-import
 * CSV columns: building_name (required), apartment_number (required),
 * landlord_name, property_type, house_type, internet_provider,
 * internet_account_number, dewa_premises_number,
 * parking_spot_numbers, wifi_username, wifi_password,
 * bedrooms, bathrooms, parking_spots,
 * commission_percent, max_guests, size_sqft, description
 */
exports.bulkImport = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const stream = require('stream');
    const rows = [];
    const errors = [];
    let rowNum = 0;

    await new Promise((resolve, reject) => {
      const readable = new stream.Readable();
      readable.push(req.file.buffer);
      readable.push(null);

      readable
        .pipe(csv())
        .on('data', (row) => {
          rowNum++;
          const buildingName = (row.building_name || '').trim();
          const aptNumber = (row.apartment_number || '').trim();

          if (!buildingName) {
            errors.push({ row: rowNum + 1, message: 'building_name is required' });
            return;
          }
          if (!aptNumber) {
            errors.push({ row: rowNum + 1, message: 'apartment_number is required' });
            return;
          }

          rows.push({
            building_name: buildingName,
            apartment_number: aptNumber,
            landlord_name: (row.landlord_name || '').trim(),
            property_type: (row.property_type || 'Apartment').trim(),
            house_type: (row.house_type || 'Standard').trim(),
            internet_provider: (row.internet_provider || 'Etisalat').trim(),
            internet_account_number: (row.internet_account_number || '').trim(),
            dewa_premises_number: (row.dewa_premises_number || '').trim(),
            parking_spot_numbers: (row.parking_spot_numbers || '').trim(),
            wifi_username: (row.wifi_username || '').trim(),
            wifi_password: (row.wifi_password || '').trim(),
            bedrooms: parseInt(row.bedrooms) || 0,
            bathrooms: parseInt(row.bathrooms) || 0,
            parking_spots: parseInt(row.parking_spots) || 0,
            commission_percent: parseFloat(row.commission_percent) || 0,
            max_guests: parseInt(row.max_guests) || 0,
            size_sqft: parseInt(row.size_sqft) || null,
            size_sqm: parseFloat(row.size_sqm) || null,
            floor: (row.floor || '').trim(),
            dewa_account_number: (row.dewa_account_number || '').trim(),
            utility_bills_paid_by: ['management', 'owner'].includes((row.utility_bills_paid_by || '').trim().toLowerCase()) ? (row.utility_bills_paid_by || '').trim().toLowerCase() : 'management',
            description: (row.description || '').trim(),
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (rows.length === 0 && errors.length === 0) {
      return res.json({ message: 'CSV is empty', imported: 0, skipped: 0, errors });
    }

    // Resolve building names → IDs
    const buildingNames = [...new Set(rows.map(r => r.building_name))];
    const [buildingRows] = await pool.query(
      'SELECT id, name FROM buildings WHERE name IN (?)',
      [buildingNames]
    );
    const buildingMap = {};
    buildingRows.forEach(b => { buildingMap[b.name] = b.id; });

    // Warn about unknown buildings
    for (const name of buildingNames) {
      if (!buildingMap[name]) {
        const affected = rows.filter(r => r.building_name === name);
        affected.forEach((r, i) => {
          errors.push({ row: `Row ${rows.indexOf(r) + 2}`, message: `Building "${name}" not found` });
        });
      }
    }

    // Resolve landlord names → IDs
    const landlordNames = [...new Set(rows.filter(r => r.landlord_name).map(r => r.landlord_name))];
    const landlordMap = {};
    if (landlordNames.length > 0) {
      const [landlordRows] = await pool.query(
        'SELECT id, full_name FROM landlords WHERE full_name IN (?)',
        [landlordNames]
      );
      landlordRows.forEach(l => { landlordMap[l.full_name] = l.id; });
    }

    // Check for duplicate apartment_number within same building (in DB)
    const aptPairs = rows.map(r => ({ building_id: buildingMap[r.building_name], apartment_number: r.apartment_number }));
    const validPairs = aptPairs.filter(p => p.building_id);
    const existingUnits = [];
    if (validPairs.length > 0) {
      for (const pair of validPairs) {
        const [dupes] = await pool.query(
          'SELECT id FROM units WHERE building_id = ? AND apartment_number = ? LIMIT 1',
          [pair.building_id, pair.apartment_number]
        );
        if (dupes.length > 0) existingUnits.push(`${pair.building_id}:${pair.apartment_number}`);
      }
    }
    const existingSet = new Set(existingUnits);

    // Batch insert
    let imported = 0;
    const skipped = [];
    const seenPairs = new Set();

    for (const row of rows) {
      const buildingId = buildingMap[row.building_name];
      if (!buildingId) continue;

      const pairKey = `${buildingId}:${row.apartment_number}`;
      if (existingSet.has(pairKey)) {
        skipped.push({ row: row.apartment_number, message: `Apartment ${row.apartment_number} at ${row.building_name} already exists` });
        continue;
      }
      if (seenPairs.has(pairKey)) {
        skipped.push({ row: row.apartment_number, message: `Duplicate: Apartment ${row.apartment_number} at ${row.building_name} in CSV` });
        continue;
      }
      seenPairs.add(pairKey);

      const landlordId = row.landlord_name ? (landlordMap[row.landlord_name] || null) : null;

      try {
        const autoTitle = [row.building_name, `Apartment ${row.apartment_number}`].filter(Boolean).join(' - ');
        const slug = slugify(autoTitle);

        const [result] = await pool.execute(
          `INSERT INTO units (
            building_id, landlord_id, apartment_number, property_type, house_type,
            internet_provider, internet_account_number, dewa_premises_number,
            parking_spot_numbers, wifi_username, wifi_password,
            bedrooms, bathrooms, parking_spots, commission_percent, max_guests,
            size_sqft, size_sqm, floor, dewa_account_number, utility_bills_paid_by,
            description, title, slug, building_name, location
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            buildingId, landlordId, row.apartment_number, row.property_type, row.house_type,
            row.internet_provider, row.internet_account_number, row.dewa_premises_number,
            row.parking_spot_numbers, row.wifi_username, row.wifi_password,
            row.bedrooms, row.bathrooms, row.parking_spots, row.commission_percent,
            row.max_guests, row.size_sqft, row.size_sqm, row.floor, row.dewa_account_number,
            row.utility_bills_paid_by, row.description,
            autoTitle, slug, row.building_name, row.building_name
          ]
        );

        // Auto-create a draft listing
        await pool.execute(
          `INSERT INTO listings (
            unit_id, title, slug, property_type, building_name, location,
            max_guests, size_sqft, description, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            result.insertId, autoTitle, slug, row.property_type,
            row.building_name, row.building_name,
            row.max_guests, row.size_sqft, row.description, 'draft'
          ]
        );

        imported++;
      } catch (e) {
        errors.push({ row: row.apartment_number, message: e.message });
      }
    }

    return res.json({
      message: `Imported ${imported} units` + (skipped.length ? `, ${skipped.length} skipped` : '') + (errors.length ? `, ${errors.length} errors` : ''),
      imported,
      skipped: skipped.length,
      errors: [...skipped, ...errors],
    });
  } catch (err) { next(err); }
};

// internal helper — returns a single unit row with joins
exports.getUnitById = async (id) => {
  const [rows] = await pool.execute(`${BASE_SELECT} WHERE u.id = ?`, [id]);
  return rows[0];
};

// ── Document endpoints ──────────────────────────────────────────

exports.getDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Get the listing_id linked to this unit
    const [listing] = await pool.query('SELECT id FROM listings WHERE unit_id = ? LIMIT 1', [id]);
    if (listing.length === 0) return res.json([]);

    const [docs] = await pool.query(
      `SELECT id, document_type, document_url, permit_number, expiry_date, document_number, created_at
       FROM unit_documents WHERE property_id = ? ORDER BY created_at DESC`,
      [listing[0].id]
    );
    res.json(docs);
  } catch (err) { next(err); }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, permit_number, expiry_date, contract_start, contract_end, document_number } = req.body;

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    if (!type || !['title_deed', 'permit', 'contract'].includes(type)) {
      return res.status(400).json({ message: 'type must be title_deed, permit or contract' });
    }

    // Get the listing_id linked to this unit
    const [listing] = await pool.query('SELECT id FROM listings WHERE unit_id = ? LIMIT 1', [id]);
    if (listing.length === 0) return res.status(400).json({ message: 'No listing linked to this unit yet' });

    // Delete existing doc of the same type for this listing
    const [existing] = await pool.query(
      'SELECT id, document_url FROM unit_documents WHERE property_id = ? AND document_type = ?',
      [listing[0].id, type]
    );
    for (const doc of existing) {
      if (doc.document_url) {
        const filePath = path.join(__dirname, '..', doc.document_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await pool.query('DELETE FROM unit_documents WHERE id = ?', [doc.id]);
    }

    const fileUrl = `uploads/documents/${req.file.filename}`;
    const [result] = await pool.query(
      `INSERT INTO unit_documents (property_id, document_type, document_url, permit_number, expiry_date, contract_start, contract_end, document_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [listing[0].id, type, fileUrl, permit_number || null, expiry_date || null, contract_start || null, contract_end || null, document_number || null]
    );

    res.status(201).json({
      message: 'Document uploaded',
      document: { id: result.insertId, document_type: type, document_url: fileUrl, permit_number: permit_number || null, expiry_date: expiry_date || null, contract_start: contract_start || null, contract_end: contract_end || null, document_number: document_number || null }
    });
  } catch (err) { next(err); }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;

    const [docs] = await pool.query(
      `SELECT ud.id, ud.document_url FROM unit_documents ud
       JOIN listings l ON ud.property_id = l.id
       WHERE ud.id = ? AND l.unit_id = ?`,
      [docId, id]
    );
    if (docs.length === 0) return res.status(404).json({ message: 'Document not found' });

    // Delete file from disk
    if (docs[0].document_url) {
      const filePath = path.join(__dirname, '..', docs[0].document_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM unit_documents WHERE id = ?', [docId]);
    res.json({ message: 'Document deleted' });
  } catch (err) { next(err); }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;
    const { expiry_date, permit_number, contract_start, contract_end, document_number } = req.body;

    const [docs] = await pool.query(
      `SELECT ud.id FROM unit_documents ud
       JOIN listings l ON ud.property_id = l.id
       WHERE ud.id = ? AND l.unit_id = ?`,
      [docId, id]
    );
    if (docs.length === 0) return res.status(404).json({ message: 'Document not found' });

    await pool.query(
      'UPDATE unit_documents SET expiry_date = COALESCE(?, expiry_date), permit_number = COALESCE(?, permit_number), contract_start = COALESCE(?, contract_start), contract_end = COALESCE(?, contract_end), document_number = COALESCE(?, document_number) WHERE id = ?',
      [expiry_date !== undefined ? expiry_date : null, permit_number !== undefined ? permit_number : null, contract_start !== undefined ? contract_start : null, contract_end !== undefined ? contract_end : null, document_number !== undefined ? document_number : null, docId]
    );

    res.json({ message: 'Document updated' });
  } catch (err) { next(err); }
};