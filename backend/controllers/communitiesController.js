const pool = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const { search, city, page: pageQ, limit: limitQ } = req.query;
    const page = parseInt(pageQ) || 1;
    const limit = parseInt(limitQ) || 25;
    const offset = (page - 1) * limit;

    let where = '';
    const params = [];
    const conditions = [];
    if (search) {
      conditions.push('(name LIKE ? OR code LIKE ? OR city LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (city) {
      conditions.push('city = ?');
      params.push(city);
    }
    if (conditions.length > 0) {
      where = ' WHERE ' + conditions.join(' AND ');
    }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM communities${where}`, params);
    const total = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT id, code, name, arabic_name, sector_number, sector, management_email, makani, contact_number, address, city, security_contact, gas_company_name, gas_company_number, plus_code, latitude, longitude, updated_at
       FROM communities${where} ORDER BY sector_number, name LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getPublic = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT name FROM communities ORDER BY sector_number, name');
    res.json(rows.map(r => r.name));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const {
      code, name, arabic_name, sector_number,
      management_email, makani, contact_number, address, city,
      security_contact, gas_company_name, gas_company_number,
      plus_code, latitude, longitude
    } = req.body;
    if (!code || !name) return res.status(400).json({ message: 'Code and name are required' });
    const sector = `Sector ${sector_number || 1}`;
    const lat = (latitude !== undefined && latitude !== null && latitude !== '') ? latitude : null;
    const lng = (longitude !== undefined && longitude !== null && longitude !== '') ? longitude : null;
    await pool.query(
      `INSERT INTO communities
        (code, name, arabic_name, sector_number, sector, management_email, makani, contact_number, address, city, security_contact, gas_company_name, gas_company_number, plus_code, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, name, arabic_name || '', sector_number || 1, sector,
        management_email || '', makani || '', contact_number || '', address || '', city || 'Dubai',
        security_contact || '', gas_company_name || '', gas_company_number || '',
        plus_code || null, lat, lng
      ]
    );
    res.status(201).json({ message: 'Community created' });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      code, name, arabic_name, sector_number,
      management_email, makani, contact_number, address, city,
      security_contact, gas_company_name, gas_company_number,
      plus_code, latitude, longitude
    } = req.body;
    const sector = sector_number ? `Sector ${sector_number}` : undefined;
    const lat = (latitude !== undefined && latitude !== null && latitude !== '') ? latitude : null;
    const lng = (longitude !== undefined && longitude !== null && longitude !== '') ? longitude : null;
    await pool.query(
      `UPDATE communities SET
        code = COALESCE(?, code),
        name = COALESCE(?, name),
        arabic_name = COALESCE(?, arabic_name),
        sector_number = COALESCE(?, sector_number),
        sector = COALESCE(?, sector),
        management_email = COALESCE(?, management_email),
        makani = COALESCE(?, makani),
        contact_number = COALESCE(?, contact_number),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        security_contact = COALESCE(?, security_contact),
        gas_company_name = COALESCE(?, gas_company_name),
        gas_company_number = COALESCE(?, gas_company_number),
        plus_code = COALESCE(?, plus_code),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude)
       WHERE id = ?`,
      [
        code, name, arabic_name, sector_number, sector,
        management_email, makani, contact_number, address, city,
        security_contact, gas_company_name, gas_company_number,
        plus_code, lat, lng, id
      ]
    );
    res.json({ message: 'Community updated' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM communities WHERE id = ?', [req.params.id]);
    res.json({ message: 'Community deleted' });
  } catch (err) { next(err); }
};
