/**
 * Run the unit wifi/parking + landlord passport migration.
 * Idempotent — safe to run multiple times.
 */
require('dotenv').config();
const pool = require('./config/db');

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log('Running unit wifi/parking + landlord passport migration...\n');

    // 1. Add passport_number column to landlords
    const [passportCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'landlords' AND COLUMN_NAME = 'passport_number'"
    );
    if (passportCheck[0].cnt === 0) {
      await conn.query("ALTER TABLE landlords ADD COLUMN passport_number VARCHAR(100) DEFAULT ''");
      console.log('  + landlords.passport_number column added');
    } else {
      console.log('  ~ landlords.passport_number already exists');
    }

    // 2. Add parking_spot_numbers column to units
    const [parkingCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'units' AND COLUMN_NAME = 'parking_spot_numbers'"
    );
    if (parkingCheck[0].cnt === 0) {
      await conn.query('ALTER TABLE units ADD COLUMN parking_spot_numbers TEXT DEFAULT NULL');
      console.log('  + units.parking_spot_numbers column added');
    } else {
      console.log('  ~ units.parking_spot_numbers already exists');
    }

    // 3. Add wifi_username column to units
    const [wifiUserCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'units' AND COLUMN_NAME = 'wifi_username'"
    );
    if (wifiUserCheck[0].cnt === 0) {
      await conn.query("ALTER TABLE units ADD COLUMN wifi_username VARCHAR(100) DEFAULT ''");
      console.log('  + units.wifi_username column added');
    } else {
      console.log('  ~ units.wifi_username already exists');
    }

    // 4. Add wifi_password column to units
    const [wifiPassCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'units' AND COLUMN_NAME = 'wifi_password'"
    );
    if (wifiPassCheck[0].cnt === 0) {
      await conn.query("ALTER TABLE units ADD COLUMN wifi_password VARCHAR(100) DEFAULT ''");
      console.log('  + units.wifi_password column added');
    } else {
      console.log('  ~ units.wifi_password already exists');
    }

    // 5. Expand unit_documents.document_type ENUM
    const [enumCheck] = await conn.query(
      "SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'document_type'"
    );
    if (enumCheck[0] && !enumCheck[0].COLUMN_TYPE.includes('emirates_id')) {
      await conn.query("ALTER TABLE unit_documents MODIFY document_type ENUM('title_deed','permit','id_passport','contract','emirates_id','passport') NOT NULL");
      console.log('  + unit_documents.document_type ENUM expanded');
    } else {
      console.log('  ~ unit_documents.document_type already includes emirates_id');
    }

    // Verify
    console.log('\nVerification:');
    const [landlordCols] = await conn.query('SHOW COLUMNS FROM landlords');
    const [unitsCols] = await conn.query('SHOW COLUMNS FROM units');
    const [docCols] = await conn.query('SHOW COLUMNS FROM unit_documents');
    console.log('  landlords:', landlordCols.map(c => c.Field).join(', '));
    console.log('  units:', unitsCols.map(c => c.Field).join(', '));
    const docTypeCol = docCols.find(c => c.Field === 'document_type');
    console.log('  unit_documents.document_type:', docTypeCol ? docTypeCol.Type : 'MISSING');

    console.log('\n✅ Unit wifi/parking + landlord passport migration complete!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

run();
