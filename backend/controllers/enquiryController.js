const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

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

    const [properties] = await pool.query('SELECT title FROM properties WHERE id = ?', [property_id]);
    const propertyName = properties.length > 0 ? properties[0].title : 'Unknown Property';

    const subject = `New Property Enquiry - ${propertyName}`;
    const html = `
      <h2>New Property Enquiry</h2>
      <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td><strong>Property</strong></td><td>${propertyName}</td></tr>
        <tr><td><strong>Name</strong></td><td>${name}</td></tr>
        <tr><td><strong>Email</strong></td><td>${email}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
        <tr><td><strong>Check-in</strong></td><td>${check_in || 'N/A'}</td></tr>
        <tr><td><strong>Check-out</strong></td><td>${check_out || 'N/A'}</td></tr>
        <tr><td><strong>Guests</strong></td><td>${guests || 0}</td></tr>
        <tr><td><strong>Message</strong></td><td>${message || 'N/A'}</td></tr>
      </table>
    `;

    sendEmail({ subject, html });

    res.status(201).json({ message: 'Thank you for your enquiry. We will contact you shortly.' });
  } catch (error) {
    console.error('Enquiry submit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const [enquiries] = await pool.query(
      `SELECT e.*, p.title as property_name 
       FROM property_enquiries e 
       LEFT JOIN properties p ON e.property_id = p.id 
       ORDER BY e.created_at DESC`
    );
    res.json(enquiries);
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
       LEFT JOIN properties p ON e.property_id = p.id 
       WHERE e.id = ?`, [id]
    );
    res.json(enquiry[0]);
  } catch (error) {
    console.error('Update enquiry status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
