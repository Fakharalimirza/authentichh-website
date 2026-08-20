const pool = require('../config/db');
const { sendEmail, sendEmailToUser } = require('../utils/email');
const { contactAdminTemplate, contactUserTemplate } = require('../utils/emailTemplates');

exports.submit = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Required fields: name, email, message' });
    }

    const [result] = await pool.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || '', subject || '', message, 'new']
    );

    const adminHtml = contactAdminTemplate({ name, email, phone: phone || '', subject: subject || '', message });
    sendEmail({ subject: `New Contact Message - ${subject || 'No Subject'}`, html: adminHtml });

    const userHtml = contactUserTemplate({ name });
    sendEmailToUser({ to: email, subject: 'Thank You for Contacting Us - Authentic Holiday Homes', html: userHtml });

    res.status(201).json({ message: 'Thank you for your message. We will get back to you soon.' });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 25));
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    if (req.query.status) { whereClause += ' AND status = ?'; params.push(req.query.status); }
    if (req.query.q) { whereClause += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${req.query.q}%`, `%${req.query.q}%`); }
    if (req.query.from) { whereClause += ' AND created_at >= ?'; params.push(req.query.from); }
    if (req.query.to) { whereClause += ' AND created_at <= ?'; params.push(req.query.to + ' 23:59:59'); }

    const countQuery = `SELECT COUNT(*) as total FROM contact_messages ${whereClause}`;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    let query = `SELECT * FROM contact_messages ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const queryParams = [...params, limit, offset];
    const [messages] = await pool.query(query, queryParams);

    res.json({ data: messages, pagination: { page, limit, total, totalPages } });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
    const [message] = await pool.query('SELECT * FROM contact_messages WHERE id = ?', [id]);
    res.json(message[0]);
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
