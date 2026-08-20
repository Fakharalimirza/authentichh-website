/**
 * Migration: Add full_name_ar to landlords (from migration-landlord-full-name-ar.sql)
 * Idempotent — safe to run multiple times.
 */
require('dotenv').config();
const pool = require('./config/db');

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log('Running landlord full_name_ar migration...\n');

    const [check] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'landlords' AND COLUMN_NAME = 'full_name_ar'"
    );
    if (check[0].cnt === 0) {
      await conn.query("ALTER TABLE landlords ADD COLUMN full_name_ar VARCHAR(255) DEFAULT '' AFTER full_name");
      console.log('  + full_name_ar column added to landlords');
    } else {
      console.log('  ~ full_name_ar already exists');
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