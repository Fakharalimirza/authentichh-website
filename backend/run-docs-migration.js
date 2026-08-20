/**
 * Run the documents migration.
 * Idempotent — safe to run multiple times.
 */
require('dotenv').config();
const pool = require('./config/db');

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log('Running documents migration...\n');

    // 1. Add landlord_id column
    const [colCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'landlord_id'"
    );
    if (colCheck[0].cnt === 0) {
      await conn.query('ALTER TABLE unit_documents ADD COLUMN landlord_id INT DEFAULT NULL AFTER property_id');
      console.log('  + landlord_id column added');
    } else {
      console.log('  ~ landlord_id already exists');
    }

    // 2. Make property_id nullable
    const [nullableCheck] = await conn.query(
      "SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'property_id'"
    );
    if (nullableCheck[0] && nullableCheck[0].IS_NULLABLE === 'NO') {
      await conn.query('ALTER TABLE unit_documents MODIFY property_id INT DEFAULT NULL');
      console.log('  + property_id made nullable');
    } else {
      console.log('  ~ property_id already nullable');
    }

    // 3. Expand ENUM
    const [enumCheck] = await conn.query(
      "SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'document_type'"
    );
    if (enumCheck[0] && !enumCheck[0].COLUMN_TYPE.includes('id_passport')) {
      await conn.query("ALTER TABLE unit_documents MODIFY document_type ENUM('title_deed','permit','id_passport','contract') NOT NULL");
      console.log('  + document_type ENUM expanded');
    } else {
      console.log('  ~ document_type already expanded');
    }

    // 4. Add FK for landlord_id
    const [fkCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'landlord_id' AND REFERENCED_TABLE_NAME IS NOT NULL"
    );
    if (fkCheck[0].cnt === 0) {
      try {
        await conn.query('ALTER TABLE unit_documents ADD CONSTRAINT fk_ud_landlord FOREIGN KEY (landlord_id) REFERENCES landlords(id) ON DELETE CASCADE');
        console.log('  + landlord FK added');
      } catch (e) {
        console.log('  ! FK add failed: ' + e.message);
      }
    } else {
      console.log('  ~ landlord FK already exists');
    }

    // Verify
    console.log('\nVerification:');
    const [cols] = await conn.query("SHOW COLUMNS FROM unit_documents");
    console.log('  Columns:', cols.map(c => c.Field).join(', '));

    console.log('\n✅ Documents migration complete!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

run();
