const pool = require('../config/db');

async function run() {
  try {
    await pool.query('ALTER TABLE amenities ADD COLUMN category VARCHAR(50) DEFAULT \'\'');
    console.log('Column "category" added');
  } catch(e) {
    console.log('category:', e.message);
  }
  try {
    await pool.query('ALTER TABLE amenities ADD COLUMN sort_order INT DEFAULT 0');
    console.log('Column "sort_order" added');
  } catch(e) {
    console.log('sort_order:', e.message);
  }
  process.exit();
}
run();
