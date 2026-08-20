const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res, next) => {
  try {
    const { search, role, is_active, page: pageQ, limit: limitQ } = req.query;
    const page = parseInt(pageQ) || 1;
    const limit = parseInt(limitQ) || 25;
    const offset = (page - 1) * limit;

    let where = '';
    const params = [];
    const conditions = [];
    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    if (is_active !== undefined && is_active !== '') {
      conditions.push('is_active = ?');
      params.push(parseInt(is_active));
    }
    if (conditions.length > 0) {
      where = ' WHERE ' + conditions.join(' AND ');
    }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM admin_users${where}`, params);
    const total = countResult[0].total;

    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_active, created_at FROM admin_users${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role || 'admin']
    );
    res.status(201).json({ id: result.insertId, name, email, role: role || 'admin' });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, email, role, is_active } = req.body;
    await pool.query(
      'UPDATE admin_users SET name=?, email=?, role=?, is_active=? WHERE id=?',
      [name, email, role, is_active, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    await pool.query('UPDATE admin_users SET password_hash=? WHERE id=?', [hash, req.params.id]);
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await pool.query('DELETE FROM admin_users WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};