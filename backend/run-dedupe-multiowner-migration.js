/**
 * Run the Dedupe-First Onboarding migration (Phase 1).
 * Idempotent — safe to run multiple times.
 *
 * Phase 1:
 *   1. Create the unit_landlords junction table (multi-owner support) and
 *      backfill it from existing units.landlord_id rows (INSERT IGNORE).
 *   2. Print a DUPLICATE REPORT (report-only — never modifies data) grouped by
 *      landlord identity_number, normalized building name, and (building_id,
 *      apartment_number).
 *   3. Attempt the 3 unique indexes, each wrapped in try/catch. If an index
 *      fails (existing duplicate rows), it is skipped with a warning — no data
 *      is modified to make indexes succeed.
 */
require('dotenv').config();
const pool = require('./config/db');

/**
 * Attempt to add a unique index unless it already exists.
 * On failure (duplicate rows present) it is skipped with a warning —
 * no data is modified to make the index succeed.
 */
async function addUniqueIndex(conn, { name, table, ddl }) {
  const [check] = await conn.query(
    "SELECT COUNT(*) as cnt FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?",
    [table, name]
  );
  if (check[0].cnt > 0) {
    console.log(`  ~ ${name} already exists`);
    return { name, status: 'exists' };
  }
  try {
    await conn.query(ddl);
    console.log(`  + ${name} index added`);
    return { name, status: 'added' };
  } catch (err) {
    console.log(`  ~ ${name} skipped — clean duplicates first, then re-run (fresh DB installs it cleanly)`);
    console.log(`    (reason: ${err.message})`);
    return { name, status: 'skipped', reason: err.message };
  }
}

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log('Running Dedupe-First Onboarding migration (Phase 1)...\n');

    // ── Step 1: unit_landlords junction table + backfill ──────────────────
    const [tableCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_landlords'"
    );
    if (tableCheck[0].cnt === 0) {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS unit_landlords (
          unit_id INT NOT NULL,
          landlord_id INT NOT NULL,
          is_primary TINYINT(1) NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (unit_id, landlord_id),
          CONSTRAINT fk_ul_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
          CONSTRAINT fk_ul_landlord FOREIGN KEY (landlord_id) REFERENCES landlords(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('  + unit_landlords table created');
    } else {
      console.log('  ~ unit_landlords table already exists');
    }

    // Backfill: existing single-owner units become the primary owner.
    // INSERT IGNORE is safe on re-runs (PK conflicts are skipped).
    const [backfill] = await conn.query(
      'INSERT IGNORE INTO unit_landlords (unit_id, landlord_id, is_primary) SELECT id, landlord_id, 1 FROM units WHERE landlord_id IS NOT NULL'
    );
    console.log(`  + unit_landlords backfilled from units.landlord_id (${backfill.affectedRows} rows inserted)`);

    // ── Step 2: Duplicate report (report-only — no data modified) ──────────
    console.log('\n── Duplicate Report (report-only — no data modified) ──');

    // Landlords by identity_number
    const [dupeLandlords] = await conn.query(
      `SELECT identity_number, COUNT(*) as cnt
       FROM landlords
       WHERE identity_number IS NOT NULL AND identity_number <> ''
       GROUP BY identity_number
       HAVING COUNT(*) > 1`
    );
    if (dupeLandlords.length === 0) {
      console.log('✓ No duplicate landlords');
    } else {
      console.log(`⚠ Duplicate landlords: ${dupeLandlords.length}`);
      for (const d of dupeLandlords) {
        const [ids] = await conn.query(
          'SELECT id FROM landlords WHERE identity_number = ? ORDER BY id',
          [d.identity_number]
        );
        console.log(`    identity_number '${d.identity_number}' → landlord IDs: ${ids.map(r => r.id).join(', ')}`);
      }
    }

    // Buildings by normalized name (LOWER + TRIM)
    const [dupeBuildings] = await conn.query(
      `SELECT LOWER(TRIM(name)) AS normalized_name, COUNT(*) as cnt
       FROM buildings
       WHERE name IS NOT NULL AND TRIM(name) <> ''
       GROUP BY LOWER(TRIM(name))
       HAVING COUNT(*) > 1`
    );
    if (dupeBuildings.length === 0) {
      console.log('✓ No duplicate buildings');
    } else {
      console.log(`⚠ Duplicate buildings: ${dupeBuildings.length}`);
      for (const d of dupeBuildings) {
        const [ids] = await conn.query(
          'SELECT id, name FROM buildings WHERE LOWER(TRIM(name)) = ? ORDER BY id',
          [d.normalized_name]
        );
        console.log(`    '${d.normalized_name}' → building IDs: ${ids.map(r => `${r.id} ("${r.name}")`).join(', ')}`);
      }
    }

    // Units by (building_id, apartment_number)
    const [dupeUnits] = await conn.query(
      `SELECT building_id, apartment_number, COUNT(*) as cnt
       FROM units
       WHERE apartment_number IS NOT NULL AND apartment_number <> '' AND building_id IS NOT NULL
       GROUP BY building_id, apartment_number
       HAVING COUNT(*) > 1`
    );
    if (dupeUnits.length === 0) {
      console.log('✓ No duplicate units');
    } else {
      console.log(`⚠ Duplicate units: ${dupeUnits.length}`);
      for (const d of dupeUnits) {
        const [ids] = await conn.query(
          'SELECT id FROM units WHERE building_id = ? AND apartment_number = ? ORDER BY id',
          [d.building_id, d.apartment_number]
        );
        console.log(`    building_id ${d.building_id} / apartment '${d.apartment_number}' → unit IDs: ${ids.map(r => r.id).join(', ')}`);
      }
    }

    // ── Step 3: Attempt unique indexes (each wrapped in try/catch) ─────────
    console.log('\n── Unique Indexes ──');
    const indexResults = [];
    indexResults.push(await addUniqueIndex(conn, {
      name: 'uq_landlords_identity',
      table: 'landlords',
      ddl: 'ALTER TABLE landlords ADD UNIQUE INDEX uq_landlords_identity (identity_number)'
    }));
    indexResults.push(await addUniqueIndex(conn, {
      name: 'uq_buildings_name',
      table: 'buildings',
      ddl: 'ALTER TABLE buildings ADD UNIQUE INDEX uq_buildings_name (name)'
    }));
    indexResults.push(await addUniqueIndex(conn, {
      name: 'uq_units_building_apartment',
      table: 'units',
      ddl: 'ALTER TABLE units ADD UNIQUE INDEX uq_units_building_apartment (building_id, apartment_number)'
    }));

    // ── Summary ──
    const added = indexResults.filter(r => r.status === 'added').length;
    const existed = indexResults.filter(r => r.status === 'exists').length;
    const skipped = indexResults.filter(r => r.status === 'skipped').length;
    const dupeGroups = dupeLandlords.length + dupeBuildings.length + dupeUnits.length;

    console.log('\n── Summary ──');
    console.log('  unit_landlords: present (junction table + backfill)');
    console.log(`  unique indexes: ${added} added, ${existed} already existed, ${skipped} skipped (duplicates present)`);
    if (dupeGroups > 0) {
      console.log(`  ⚠ ${dupeGroups} duplicate group(s) found above — resolve them, then re-run to install skipped indexes`);
    } else {
      console.log('  ✓ no duplicates found — all indexes should install cleanly');
    }
    console.log('\n✅ Dedupe-First Onboarding migration (Phase 1) complete!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

run();
