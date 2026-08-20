const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [amenities] = await pool.query('SELECT * FROM amenities WHERE is_active = 1 ORDER BY sort_order ASC, name ASC');
    res.json(amenities);
  } catch (error) {
    console.error('Get amenities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const { search, category, is_active, page: pageQ, limit: limitQ } = req.query;
    const page = parseInt(pageQ) || 1;
    const limit = parseInt(limitQ) || 25;
    const offset = (page - 1) * limit;

    let where = '';
    const params = [];
    const conditions = [];
    if (search) {
      conditions.push('(name LIKE ? OR category LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (is_active !== undefined && is_active !== '') {
      conditions.push('is_active = ?');
      params.push(parseInt(is_active));
    }
    if (conditions.length > 0) {
      where = ' WHERE ' + conditions.join(' AND ');
    }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM amenities${where}`, params);
    const total = countResult[0].total;

    const [amenities] = await pool.query(
      `SELECT * FROM amenities${where} ORDER BY sort_order ASC, name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: amenities, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get amenities admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, icon, description, category, sort_order } = req.body;
    const [result] = await pool.query(
      'INSERT INTO amenities (name, icon, description, category, sort_order) VALUES (?, ?, ?, ?, ?)',
      [name, icon || '', description || '', category || '', sort_order ?? 0]
    );
    const [amenity] = await pool.query('SELECT * FROM amenities WHERE id = ?', [result.insertId]);
    res.status(201).json(amenity[0]);
  } catch (error) {
    console.error('Create amenity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['name', 'icon', 'description', 'is_active', 'category', 'sort_order'];
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(req.body)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    values.push(id);
    await pool.query(`UPDATE amenities SET ${fields.join(', ')} WHERE id = ?`, values);
    const [amenity] = await pool.query('SELECT * FROM amenities WHERE id = ?', [id]);
    res.json(amenity[0]);
  } catch (error) {
    console.error('Update amenity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM property_amenities WHERE amenity_id = ?', [id]);
    await pool.query('DELETE FROM amenities WHERE id = ?', [id]);
    res.json({ message: 'Amenity deleted' });
  } catch (error) {
    console.error('Delete amenity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
