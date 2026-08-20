/**
 * Run the Smart Scan Onboarding migration.
 * Idempotent — safe to run multiple times.
 */
require('dotenv').config();
const pool = require('./config/db');

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log('Running Smart Scan Onboarding migration...\n');

    // 1. Add bank_account_currency column to landlords
    const [bankCurrencyCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'landlords' AND COLUMN_NAME = 'bank_account_currency'"
    );
    if (bankCurrencyCheck[0].cnt === 0) {
      await conn.query("ALTER TABLE landlords ADD COLUMN bank_account_currency VARCHAR(50) DEFAULT ''");
      console.log('  + landlords.bank_account_currency column added');
    } else {
      console.log('  ~ landlords.bank_account_currency already exists');
    }

    // 2. Add bank_address column to landlords
    const [bankAddressCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'landlords' AND COLUMN_NAME = 'bank_address'"
    );
    if (bankAddressCheck[0].cnt === 0) {
      await conn.query("ALTER TABLE landlords ADD COLUMN bank_address VARCHAR(500) DEFAULT ''");
      console.log('  + landlords.bank_address column added');
    } else {
      console.log('  ~ landlords.bank_address already exists');
    }

    // 3. Add size_sqm column to units
    const [sizeSqmCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'units' AND COLUMN_NAME = 'size_sqm'"
    );
    if (sizeSqmCheck[0].cnt === 0) {
      await conn.query('ALTER TABLE units ADD COLUMN size_sqm DECIMAL(10,2) DEFAULT NULL');
      console.log('  + units.size_sqm column added');
    } else {
      console.log('  ~ units.size_sqm already exists');
    }

    // 4. Add floor column to units
    const [floorCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'units' AND COLUMN_NAME = 'floor'"
    );
    if (floorCheck[0].cnt === 0) {
      await conn.query("ALTER TABLE units ADD COLUMN floor VARCHAR(20) DEFAULT ''");
      console.log('  + units.floor column added');
    } else {
      console.log('  ~ units.floor already exists');
    }

    // 5. Add dewa_account_number column to units
    //    (distinct from dewa_premises_number — both are kept)
    const [dewaAcctCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'units' AND COLUMN_NAME = 'dewa_account_number'"
    );
    if (dewaAcctCheck[0].cnt === 0) {
      await conn.query("ALTER TABLE units ADD COLUMN dewa_account_number VARCHAR(100) DEFAULT ''");
      console.log('  + units.dewa_account_number column added');
    } else {
      console.log('  ~ units.dewa_account_number already exists');
    }

    // 6. Add utility_bills_paid_by column to units
    const [utilityBillsCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'units' AND COLUMN_NAME = 'utility_bills_paid_by'"
    );
    if (utilityBillsCheck[0].cnt === 0) {
      await conn.query("ALTER TABLE units ADD COLUMN utility_bills_paid_by ENUM('management','owner') DEFAULT 'management'");
      console.log('  + units.utility_bills_paid_by column added');
    } else {
      console.log('  ~ units.utility_bills_paid_by already exists');
    }

    // 7. Add plot_number column to buildings
    const [plotNumberCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'buildings' AND COLUMN_NAME = 'plot_number'"
    );
    if (plotNumberCheck[0].cnt === 0) {
      await conn.query("ALTER TABLE buildings ADD COLUMN plot_number VARCHAR(50) DEFAULT ''");
      console.log('  + buildings.plot_number column added');
    } else {
      console.log('  ~ buildings.plot_number already exists');
    }

    // 8. Add contract_start column to unit_documents
    const [contractStartCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'contract_start'"
    );
    if (contractStartCheck[0].cnt === 0) {
      await conn.query('ALTER TABLE unit_documents ADD COLUMN contract_start DATE NULL');
      console.log('  + unit_documents.contract_start column added');
    } else {
      console.log('  ~ unit_documents.contract_start already exists');
    }

    // 9. Add contract_end column to unit_documents
    const [contractEndCheck] = await conn.query(
      "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'contract_end'"
    );
    if (contractEndCheck[0].cnt === 0) {
      await conn.query('ALTER TABLE unit_documents ADD COLUMN contract_end DATE NULL');
      console.log('  + unit_documents.contract_end column added');
    } else {
      console.log('  ~ unit_documents.contract_end already exists');
    }

    // Verify
    console.log('\nVerification:');
    const [landlordCols] = await conn.query('SHOW COLUMNS FROM landlords');
    const [unitsCols] = await conn.query('SHOW COLUMNS FROM units');
    const [buildingCols] = await conn.query('SHOW COLUMNS FROM buildings');
    const [docCols] = await conn.query('SHOW COLUMNS FROM unit_documents');
    console.log('  landlords:', landlordCols.map(c => c.Field).join(', '));
    console.log('  units:', unitsCols.map(c => c.Field).join(', '));
    console.log('  buildings:', buildingCols.map(c => c.Field).join(', '));
    console.log('  unit_documents:', docCols.map(c => c.Field).join(', '));

    console.log('\n✅ Smart Scan Onboarding migration complete!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

run();