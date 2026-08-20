/**
 * Run the units/listings split migration.
 * Idempotent — safe to run multiple times.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../config/db');

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log('Connected to database. Starting migration...\n');

    // 1. Check if listings table already exists
    const [tables] = await conn.query("SHOW TABLES LIKE 'listings'");
    if (tables.length > 0) {
      console.log('listings table already exists — checking data...');
      const [count] = await conn.query('SELECT COUNT(*) as cnt FROM listings');
      console.log(`  listings has ${count[0].cnt} rows.`);
      console.log('Migration already run. Skipping.');
      return;
    }

    // 2. Create listings table
    console.log('Creating listings table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unit_id INT DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        title_ar VARCHAR(255) DEFAULT '',
        slug VARCHAR(255) NOT NULL UNIQUE,
        property_type VARCHAR(100) DEFAULT '',
        building_name VARCHAR(255) DEFAULT '',
        building_name_ar VARCHAR(255) DEFAULT '',
        location VARCHAR(255) DEFAULT '',
        location_ar VARCHAR(255) DEFAULT '',
        address TEXT,
        address_ar TEXT,
        bedrooms INT DEFAULT 0,
        bathrooms INT DEFAULT 0,
        max_guests INT DEFAULT 0,
        parking_spots INT DEFAULT 0,
        size_sqft INT DEFAULT NULL,
        price_per_night DECIMAL(10,2) DEFAULT 0.00,
        short_description TEXT,
        short_description_ar TEXT,
        description TEXT,
        description_ar TEXT,
        map_url TEXT,
        plus_code VARCHAR(50) DEFAULT NULL,
        latitude DECIMAL(10,8) DEFAULT NULL,
        longitude DECIMAL(11,8) DEFAULT NULL,
        status ENUM('draft','published','unpublished') DEFAULT 'draft',
        is_featured TINYINT(1) DEFAULT 0,
        meta_title VARCHAR(255) DEFAULT '',
        meta_title_ar VARCHAR(255) DEFAULT '',
        meta_description TEXT,
        meta_description_ar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
      )
    `);
    console.log('  ✓ listings table created');

    // 3. Migrate data from units → listings
    console.log('Migrating data from units → listings...');
    const [result] = await conn.query(`
      INSERT INTO listings (
        unit_id, title, title_ar, slug, property_type,
        building_name, building_name_ar, location, location_ar,
        address, address_ar,
        bedrooms, bathrooms, max_guests, parking_spots, size_sqft, price_per_night,
        short_description, short_description_ar, description, description_ar,
        map_url, plus_code, latitude, longitude,
        status, is_featured,
        meta_title, meta_title_ar, meta_description, meta_description_ar,
        created_at, updated_at
      )
      SELECT
        id, title, title_ar, slug, property_type,
        building_name, building_name_ar, location, location_ar,
        address, address_ar,
        bedrooms, bathrooms, max_guests, parking_spots, size_sqft, price_per_night,
        short_description, short_description_ar, description, description_ar,
        map_url, plus_code, latitude, longitude,
        status, is_featured,
        meta_title, meta_title_ar, meta_description, meta_description_ar,
        created_at, updated_at
      FROM units
    `);
    console.log(`  ✓ Copied ${result.affectedRows} rows to listings`);

    // 4. Drop old FK constraints and re-add pointing to listings
    console.log('Updating foreign key constraints...');

    // Helper to drop FK by constraint name or column
    async function safeDropFK(table, constraintName) {
      try {
        await conn.query(`ALTER TABLE ${table} DROP FOREIGN KEY \`${constraintName}\``);
        console.log(`  ✓ Dropped FK ${constraintName} from ${table}`);
      } catch (e) {
        // FK might not exist or have different name — try to find it
        if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY' || e.errno === 1091) {
          console.log(`  ⚠ FK ${constraintName} not found on ${table}, trying alternative...`);
          // Try to find any FK on property_id column
          try {
            const [fks] = await conn.query(`
              SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
              WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${table}'
              AND COLUMN_NAME = 'property_id' AND REFERENCED_TABLE_NAME IS NOT NULL
            `);
            for (const fk of fks) {
              await conn.query(`ALTER TABLE ${table} DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
              console.log(`  ✓ Dropped FK ${fk.CONSTRAINT_NAME} from ${table}`);
            }
          } catch (e2) {
            console.log(`  ⚠ Could not drop FKs on ${table}: ${e2.message}`);
          }
        }
      }
    }

    // Drop existing FKs
    await safeDropFK('property_images', 'property_images_ibfk_1');
    await safeDropFK('property_images', 'fk_pi_listing');
    await safeDropFK('property_amenities', 'property_amenities_ibfk_1');
    await safeDropFK('property_amenities', 'fk_pa_listing');
    await safeDropFK('property_enquiries', 'property_enquiries_ibfk_1');
    await safeDropFK('property_enquiries', 'fk_pe_listing');
    await safeDropFK('unit_documents', 'unit_documents_ibfk_1');
    await safeDropFK('unit_documents', 'fk_ud_listing');

    // Re-add FKs pointing to listings
    console.log('Adding new FK constraints pointing to listings...');
    try {
      await conn.query('ALTER TABLE property_images ADD CONSTRAINT fk_pi_listing FOREIGN KEY (property_id) REFERENCES listings(id) ON DELETE CASCADE');
      console.log('  ✓ property_images → listings');
    } catch (e) {
      console.log(`  ⚠ property_images FK: ${e.message}`);
    }
    try {
      await conn.query('ALTER TABLE property_amenities ADD CONSTRAINT fk_pa_listing FOREIGN KEY (property_id) REFERENCES listings(id) ON DELETE CASCADE');
      console.log('  ✓ property_amenities → listings');
    } catch (e) {
      console.log(`  ⚠ property_amenities FK: ${e.message}`);
    }
    try {
      await conn.query('ALTER TABLE property_enquiries ADD CONSTRAINT fk_pe_listing FOREIGN KEY (property_id) REFERENCES listings(id) ON DELETE CASCADE');
      console.log('  ✓ property_enquiries → listings');
    } catch (e) {
      console.log(`  ⚠ property_enquiries FK: ${e.message}`);
    }
    try {
      await conn.query('ALTER TABLE unit_documents ADD CONSTRAINT fk_ud_listing FOREIGN KEY (property_id) REFERENCES listings(id) ON DELETE CASCADE');
      console.log('  ✓ unit_documents → listings');
    } catch (e) {
      console.log(`  ⚠ unit_documents FK: ${e.message}`);
    }

    // 5. Verify
    console.log('\nVerification:');
    const [listingCount] = await conn.query('SELECT COUNT(*) as cnt FROM listings');
    const [unitCount] = await conn.query('SELECT COUNT(*) as cnt FROM units');
    console.log(`  units: ${unitCount[0].cnt} rows`);
    console.log(`  listings: ${listingCount[0].cnt} rows`);

    // Check FKs
    const [fks] = await conn.query(`
      SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME = 'listings'
    `);
    console.log(`  FKs pointing to listings: ${fks.length}`);
    fks.forEach(fk => console.log(`    ${fk.TABLE_NAME}.${fk.CONSTRAINT_NAME} → listings`));

    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

run();
