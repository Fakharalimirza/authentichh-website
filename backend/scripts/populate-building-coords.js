/**
 * Populate building latitude/longitude from plus_code (Open Location Code).
 * Only updates buildings where lat/lng are NULL but plus_code is available.
 */

const pool = require('../config/db');
const { plusCodeToLatLng } = require('../utils/plusCode');

(async () => {
  const [buildings] = await pool.query(
    'SELECT id, name, plus_code FROM buildings WHERE plus_code IS NOT NULL AND plus_code != "" AND (latitude IS NULL OR longitude IS NULL)'
  );

  console.log(`Found ${buildings.length} buildings with plus_code but no coordinates`);

  let updated = 0;
  let failed = 0;

  for (const b of buildings) {
    const coords = plusCodeToLatLng(b.plus_code);
    if (coords) {
      await pool.query(
        'UPDATE buildings SET latitude = ?, longitude = ? WHERE id = ?',
        [coords.latitude, coords.longitude, b.id]
      );
      updated++;
      console.log(`  ✓ ${b.name} → ${coords.latitude}, ${coords.longitude}`);
    } else {
      failed++;
      console.log(`  ✗ ${b.name} — could not decode "${b.plus_code}"`);
    }
  }

  console.log(`\nDone: ${updated} updated, ${failed} failed`);
  process.exit(0);
})();
