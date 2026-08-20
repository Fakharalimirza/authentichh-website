/**
 * Auto-fill listing latitude/longitude/plus_code/address from linked building.
 * Uses the fillLocationFromBuilding logic — only fills where listing fields are empty.
 */

const pool = require('../config/db');
const { plusCodeToLatLng } = require('../utils/plusCode');

(async () => {
  const [listings] = await pool.query(
    `SELECT p.id, p.title, p.unit_id,
       u.building_id, u.community_id
     FROM listings p
     LEFT JOIN units u ON p.unit_id = u.id
     WHERE p.latitude IS NULL AND u.building_id IS NOT NULL`
  );

  console.log(`Found ${listings.length} listings with null lat/lng and a linked unit`);

  let updated = 0;
  for (const l of listings) {
    const [buildings] = await pool.query(
      'SELECT latitude, longitude, plus_code, address FROM buildings WHERE id = ?', [l.building_id]
    );
    if (buildings.length === 0 || !buildings[0].latitude) continue;
    const b = buildings[0];

    let lat = b.latitude;
    let lng = b.longitude;
    let plus_code = b.plus_code || '';

    await pool.query(
      `UPDATE listings SET latitude = ?, longitude = ?, plus_code = NULLIF(?, ''), address = NULLIF(COALESCE(NULLIF(address, ''), ?, ''), '') WHERE id = ?`,
      [lat, lng, plus_code, b.address || '', l.id]
    );
    updated++;
  }

  console.log(`Updated ${updated} listings with building coordinates`);
  process.exit(0);
})();
