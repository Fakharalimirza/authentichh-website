const pool = require('../config/db');
const csv = require('csv-parser');
const { plusCodeToLatLng } = require('../utils/plusCode');

exports.getAll = async (req, res, next) => {
  try {
    const { search, city, page = 1, limit = 25 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 25));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = '';
    const params = [];
    const conditions = [];
    if (search) {
      conditions.push(`(b.name LIKE ? OR b.name_ar LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`);
    }
    if (city) {
      conditions.push('b.city = ?');
      params.push(city);
    }
    if (conditions.length > 0) {
      whereClause = ' WHERE ' + conditions.join(' AND ');
    }

    const countQuery = `SELECT COUNT(*) as total FROM buildings b${whereClause}`;
    const [[{ total }]] = await pool.query(countQuery, params);

    let query = `SELECT b.*, (SELECT COUNT(*) FROM units u WHERE u.building_id = b.id) as unit_count FROM buildings b${whereClause} ORDER BY b.name ASC LIMIT ? OFFSET ?`;
    const [buildings] = await pool.query(query, [...params, limitNum, offset]);

    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    res.json({ data: buildings, pagination: { page: pageNum, limit: limitNum, total, totalPages } });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const [buildings] = await pool.query(
      `SELECT b.*, (SELECT COUNT(*) FROM units u WHERE u.building_id = b.id) as unit_count FROM buildings b WHERE b.id = ?`,
      [req.params.id]
    );
    if (buildings.length === 0) return res.status(404).json({ message: 'Building not found' });
    res.json(buildings[0]);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const {
      name, name_ar, management_email, makani, contact_number, floors,
      address, city, security_contact, gas_company_name, gas_company_number,
      plus_code, latitude, longitude, plot_number
    } = req.body;

    if (!name) return res.status(400).json({ message: 'Building name is required' });

    const [result] = await pool.query(
      `INSERT INTO buildings (name, name_ar, management_email, makani, contact_number, floors,
        address, city, security_contact, gas_company_name, gas_company_number, plus_code, latitude, longitude, plot_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, name_ar || '', management_email || '', makani || '', contact_number || '',
       floors || 0, address || '', city || 'Dubai', security_contact || '',
       gas_company_name || '', gas_company_number || '', plus_code || null,
       latitude || null, longitude || null, plot_number || '']
    );

    const [building] = await pool.query('SELECT * FROM buildings WHERE id = ?', [result.insertId]);
    res.status(201).json(building[0]);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const {
      name, name_ar, management_email, makani, contact_number, floors,
      address, city, security_contact, gas_company_name, gas_company_number,
      plus_code, latitude, longitude, plot_number
    } = req.body;

    await pool.query(
      `UPDATE buildings SET
        name = COALESCE(?, name),
        name_ar = COALESCE(?, name_ar),
        management_email = COALESCE(?, management_email),
        makani = COALESCE(?, makani),
        contact_number = COALESCE(?, contact_number),
        floors = COALESCE(?, floors),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        security_contact = COALESCE(?, security_contact),
        gas_company_name = COALESCE(?, gas_company_name),
        gas_company_number = COALESCE(?, gas_company_number),
        plus_code = COALESCE(?, plus_code),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        plot_number = COALESCE(?, plot_number)
       WHERE id = ?`,
      [name ?? null, name_ar ?? null, management_email ?? null, makani ?? null, contact_number ?? null,
       floors ?? null, address ?? null, city ?? null, security_contact ?? null,
       gas_company_name ?? null, gas_company_number ?? null, plus_code ?? null,
       latitude ?? null, longitude ?? null, plot_number ?? null, req.params.id]
    );

    const [building] = await pool.query('SELECT * FROM buildings WHERE id = ?', [req.params.id]);
    res.json(building[0]);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const [units] = await pool.query('SELECT COUNT(*) as cnt FROM units WHERE building_id = ?', [req.params.id]);
    if (units[0].cnt > 0) {
      return res.status(400).json({ message: 'Cannot delete building with assigned units' });
    }
    await pool.query('DELETE FROM buildings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Building deleted' });
  } catch (err) { next(err); }
};

exports.bulkImport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    const rows = [];
    const errors = [];
    let rowNum = 0;

    await new Promise((resolve, reject) => {
      const stream = require('stream');
      const readable = new stream.Readable();
      readable.push(req.file.buffer);
      readable.push(null);
      
      readable
        .pipe(csv())
        .on('data', (row) => {
          rowNum++;
          const name = (row.name || '').trim();
          if (!name) {
            errors.push({ row: rowNum + 1, message: 'Building name is required' });
            return;
          }
          rows.push({
            name,
            name_ar: (row.name_ar || '').trim(),
            management_email: (row.management_email || '').trim(),
            makani: (row.makani || '').trim(),
            contact_number: (row.contact_number || '').trim(),
            floors: parseInt(row.floors) || 0,
            address: (row.address || '').trim(),
            city: (row.city || 'Dubai').trim(),
            security_contact: (row.security_contact || '').trim(),
            gas_company_name: (row.gas_company_name || '').trim(),
            gas_company_number: (row.gas_company_number || '').trim(),
            plus_code: (row.plus_code || '').trim() || null,
            plot_number: (row.plot_number || '').trim(),
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Check for duplicate names in DB
    if (rows.length > 0) {
      const names = rows.map(r => r.name);
      const [existing] = await pool.query(
        'SELECT name FROM buildings WHERE name IN (?)',
        [names]
      );
      const existingNames = new Set(existing.map(e => e.name));
      
      const toInsert = [];
      const skipped = [];
      for (const row of rows) {
        if (existingNames.has(row.name)) {
          skipped.push({ row: row.name, message: `Building "${row.name}" already exists` });
        } else {
          toInsert.push(row);
          existingNames.add(row.name); // prevent dupes within the CSV itself
        }
      }

      // Batch insert
      let imported = 0;
      for (const row of toInsert) {
        try {
          await pool.query(
            `INSERT INTO buildings (name, name_ar, management_email, makani, contact_number, floors,
              address, city, security_contact, gas_company_name, gas_company_number, plus_code, plot_number)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [row.name, row.name_ar, row.management_email, row.makani, row.contact_number,
             row.floors, row.address, row.city, row.security_contact,
             row.gas_company_name, row.gas_company_number, row.plus_code, row.plot_number]
          );
          imported++;
        } catch (e) {
          errors.push({ row: row.name, message: e.message });
        }
      }

      return res.json({
        message: `Imported ${imported} buildings` + (skipped.length ? `, ${skipped.length} skipped` : '') + (errors.length ? `, ${errors.length} errors` : ''),
        imported,
        skipped: skipped.length,
        errors: [...skipped, ...errors],
      });
    }

    res.json({ message: 'No valid rows to import', imported: 0, skipped: 0, errors });
  } catch (err) { next(err); }
};

/**
 * GET /api/buildings/map-data (public)
 * Returns all buildings with coordinates + unit list for the map page.
 * Auto-decodes plus_code to lat/lng when coordinates are missing.
 */
exports.getMapData = async (req, res, next) => {
  try {
    const [buildings] = await pool.query(
      `SELECT b.id, b.name, b.name_ar, b.address, b.city, b.plus_code,
              b.latitude, b.longitude,
              (SELECT COUNT(*) FROM units u WHERE u.building_id = b.id) as unit_count
       FROM buildings b
       ORDER BY b.name ASC`
    );

    // Resolve coordinates: use lat/lng if present, otherwise decode plus_code
    const resolved = [];
    for (const b of buildings) {
      let lat = b.latitude ? Number(b.latitude) : null;
      let lng = b.longitude ? Number(b.longitude) : null;

      if ((!lat || !lng) && b.plus_code) {
        const decoded = plusCodeToLatLng(b.plus_code);
        if (decoded) {
          lat = decoded.latitude;
          lng = decoded.longitude;
        }
      }

      if (!lat || !lng) continue; // skip buildings with no usable coordinates

      // Fetch units for this building
      const [units] = await pool.query(
        `SELECT apartment_number, house_type, status FROM units WHERE building_id = ? ORDER BY apartment_number ASC`,
        [b.id]
      );

      resolved.push({
        id: b.id,
        name: b.name,
        name_ar: b.name_ar,
        address: b.address,
        city: b.city,
        plus_code: b.plus_code,
        latitude: lat,
        longitude: lng,
        unit_count: b.unit_count,
        units: units.map(u => ({
          apartment_number: u.apartment_number,
          house_type: u.house_type,
          status: u.status,
        })),
      });
    }

    res.json(resolved);
  } catch (err) { next(err); }
};
