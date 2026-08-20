const pool = require('../config/db');

const catMap = {
  'Wi-Fi': 'Entertainment',
  'Swimming Pool': 'Fitness & Wellness',
  'Gym': 'Fitness & Wellness',
  'Parking': 'Convenience',
  'Smart Lock': 'Safety & Security',
  'Air Conditioning': 'Comfort',
  'TV': 'Entertainment',
  'Washing Machine': 'Convenience',
  'Equipped Kitchen': 'Kitchen',
  'Balcony': 'Outdoor',
  'Security': 'Safety & Security',
  'Safe': 'Safety & Security',
  'Coffee Maker': 'Kitchen',
  'Hair Dryer': 'Comfort',
};

async function run() {
  for (const [name, category] of Object.entries(catMap)) {
    try {
      await pool.query('UPDATE amenities SET category = ?, sort_order = 10 WHERE name = ?', [category, name]);
      console.log(`Updated: ${name} -> ${category}`);
    } catch (e) {
      console.log(`Error updating ${name}:`, e.message);
    }
  }
  process.exit();
}
run();
