const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [amenities] = await pool.query('SELECT * FROM amenities WHERE is_active = 1 ORDER BY name ASC');
    res.json(amenities);
  } catch (error) {
    console.error('Get amenities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const [amenities] = await pool.query('SELECT * FROM amenities ORDER BY name ASC');
    res.json(amenities);
  } catch (error) {
    console.error('Get amenities admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO amenities (name, icon, description) VALUES (?, ?, ?)',
      [name, icon || '', description || '']
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
    const { name, icon, description, is_active } = req.body;
    await pool.query(
      'UPDATE amenities SET name = ?, icon = ?, description = ?, is_active = ? WHERE id = ?',
      [name, icon, description, is_active, id]
    );
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
