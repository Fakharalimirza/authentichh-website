/**
 * Run the Document Number migration.
 * Idempotent — safe to run multiple times.
 */
require('dotenv').config();
const pool = require('./config/db');

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log('Running Document Number migration...\n');

    // 1. Add document_number column to unit_documents
    const [docNumberCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'document_number'"
    );
    if (docNumberCheck[0].cnt === 0) {
      await conn.query('ALTER TABLE unit_documents ADD COLUMN document_number VARCHAR(100) DEFAULT NULL AFTER permit_number');
      console.log('  + unit_documents.document_number column added');
    } else {
      console.log('  ~ unit_documents.document_number already exists');
    }

    // Verify
    console.log('\nVerification:');
    const [docCols] = await conn.query('SHOW COLUMNS FROM unit_documents');
    console.log('  unit_documents:', docCols.map(c => c.Field).join(', '));

    console.log('\n✅ Document Number migration complete!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

run();
