const pool = require('../config/db');
const { sendEmail, sendEmailToUser } = require('../utils/email');
const { landlordAdminTemplate, landlordUserTemplate } = require('../utils/emailTemplates');

exports.submit = async (req, res) => {
  try {
    const { full_name, phone_email, message } = req.body;

    if (!full_name || !phone_email) {
      return res.status(400).json({ message: 'Required fields: full_name, phone_email' });
    }

    // Parse phone_email: determine if it's a phone or email
    const isEmail = phone_email.includes('@');
    const phone = isEmail ? null : phone_email;
    const email = isEmail ? phone_email : null;

    const [result] = await pool.query(
      `INSERT INTO landlord_requests (full_name, phone, email, property_location, building_name,
        unit_number, property_type, bedrooms, furnishing_status, description, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [full_name, phone, email, null, '',
       '', null, 0, 'furnished',
       '', message || '']
    );

    const adminHtml = landlordAdminTemplate({
      fullName: full_name, email: email || 'N/A', phone: phone || 'N/A', propertyLocation: 'Not specified',
      buildingName: '', unitNumber: '', propertyType: 'Not specified',
      bedrooms: 0, furnishingStatus: 'furnished',
      description: '', userMessage: message || '',
    });
    sendEmail({ subject: `New Landlord Request - ${full_name}`, html: adminHtml });

    if (email) {
      const userHtml = landlordUserTemplate({ fullName: full_name });
      sendEmailToUser({ to: email, subject: 'Thank You for Your Submission - Authentic Holiday Homes', html: userHtml });
    }

    res.status(201).json({
      message: 'Thank you for your interest in listing your property with Authentic Holiday Homes. Our team has received your request and will contact you to discuss the details.'
    });
  } catch (error) {
    console.error('Landlord submit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    let query = 'SELECT * FROM landlord_requests WHERE 1=1';
    const params = [];
    if (req.query.status) { query += ' AND status = ?'; params.push(req.query.status); }
    if (req.query.q) { query += ' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)'; params.push(`%${req.query.q}%`, `%${req.query.q}%`, `%${req.query.q}%`); }
    if (req.query.from) { query += ' AND created_at >= ?'; params.push(req.query.from); }
    if (req.query.to) { query += ' AND created_at <= ?'; params.push(req.query.to + ' 23:59:59'); }
    query += ' ORDER BY created_at DESC';
    const [requests] = await pool.query(query, params);
    res.json(requests);
  } catch (error) {
    console.error('Get landlord requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [requests] = await pool.query('SELECT * FROM landlord_requests WHERE id = ?', [req.params.id]);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(requests[0]);
  } catch (error) {
    console.error('Get landlord request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE landlord_requests SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
    const [request] = await pool.query('SELECT * FROM landlord_requests WHERE id = ?', [id]);
    res.json(request[0]);
  } catch (error) {
    console.error('Update landlord status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
