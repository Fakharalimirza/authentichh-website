const pool = require('../config/db');
const { sendEmail, sendEmailToUser } = require('../utils/email');
const { enquiryAdminTemplate, enquiryUserTemplate } = require('../utils/emailTemplates');

exports.submit = async (req, res) => {
  try {
    const { property_id, name, email, phone, check_in, check_out, guests, message } = req.body;

    if (!name || !phone || !property_id) {
      return res.status(400).json({ message: 'Required fields: name, phone, property_id' });
    }

    const enquiryEmail = email || `guest-${phone.replace(/\D/g, '').slice(-6)}@inquiry.ae`;

    const [result] = await pool.query(
      `INSERT INTO property_enquiries (property_id, name, email, phone, check_in, check_out, guests, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [property_id, name, enquiryEmail, phone, check_in || null, check_out || null, guests || 0, message || '']
    );

    const [properties] = await pool.query('SELECT title FROM units WHERE id = ?', [property_id]);
    const propertyName = properties.length > 0 ? properties[0].title : 'Unknown Property';

    const adminHtml = enquiryAdminTemplate({
      name, email: enquiryEmail, phone, propertyName,
      checkIn: check_in || 'N/A', checkOut: check_out || 'N/A',
      guests: guests || 0, message: message || '',
    });
    sendEmail({ subject: `New Enquiry - ${propertyName}`, html: adminHtml });

    if (email) {
      const userHtml = enquiryUserTemplate({ name, propertyName, checkIn: check_in, checkOut: check_out });
      sendEmailToUser({ to: email, subject: 'Thank You for Your Enquiry - Authentic Holiday Homes', html: userHtml });
    }

    res.status(201).json({ message: 'Thank you for your enquiry. We will contact you shortly.' });
  } catch (error) {
    console.error('Enquiry submit error:', error);
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
    if (req.query.status) { whereClause += ' AND e.status = ?'; params.push(req.query.status); }
    if (req.query.q) { whereClause += ' AND (e.name LIKE ? OR e.email LIKE ? OR e.phone LIKE ?)'; params.push(`%${req.query.q}%`, `%${req.query.q}%`, `%${req.query.q}%`); }
    if (req.query.from) { whereClause += ' AND e.created_at >= ?'; params.push(req.query.from); }
    if (req.query.to) { whereClause += ' AND e.created_at <= ?'; params.push(req.query.to + ' 23:59:59'); }

    const countQuery = `SELECT COUNT(*) as total FROM property_enquiries e ${whereClause}`;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    let query = `SELECT e.*, p.title as property_name 
       FROM property_enquiries e 
       LEFT JOIN units p ON e.property_id = p.id 
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`;
    const queryParams = [...params, limit, offset];
    const [enquiries] = await pool.query(query, queryParams);

    res.json({ data: enquiries, pagination: { page, limit, total, totalPages } });
  } catch (error) {
    console.error('Get enquiries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE property_enquiries SET status = ? WHERE id = ?', [status, id]);
    const [enquiry] = await pool.query(
      `SELECT e.*, p.title as property_name 
       FROM property_enquiries e 
       LEFT JOIN units p ON e.property_id = p.id 
       WHERE e.id = ?`, [id]
    );
    res.json(enquiry[0]);
  } catch (error) {
    console.error('Update enquiry status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
