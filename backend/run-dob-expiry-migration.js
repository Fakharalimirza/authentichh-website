/**
 * Migration: Add date_of_birth to landlords, expiry_date to unit_documents
 * Idempotent — safe to run multiple times.
 */
require('dotenv').config();
const pool = require('./config/db');

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log('Running DOB + expiry migration...\n');

    // 1. Add date_of_birth to landlords
    const [dobCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'landlords' AND COLUMN_NAME = 'date_of_birth'"
    );
    if (dobCheck[0].cnt === 0) {
      await conn.query('ALTER TABLE landlords ADD COLUMN date_of_birth DATE DEFAULT NULL');
      console.log('  + date_of_birth column added to landlords');
    } else {
      console.log('  ~ date_of_birth already exists');
    }

    // 2. Add expiry_date to unit_documents
    const [expCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'expiry_date'"
    );
    if (expCheck[0].cnt === 0) {
      await conn.query('ALTER TABLE unit_documents ADD COLUMN expiry_date DATE DEFAULT NULL');
      console.log('  + expiry_date column added to unit_documents');
    } else {
      console.log('  ~ expiry_date already exists');
    }

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
