const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

exports.submit = async (req, res) => {
  try {
    const {
      full_name, phone, email, property_location, building_name,
      unit_number, property_type, bedrooms, furnishing_status, description, message
    } = req.body;

    if (!full_name || !phone || !email || !property_location || !property_type) {
      return res.status(400).json({ message: 'Required fields: full_name, phone, email, property_location, property_type' });
    }

    const [result] = await pool.query(
      `INSERT INTO landlord_requests (full_name, phone, email, property_location, building_name,
        unit_number, property_type, bedrooms, furnishing_status, description, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [full_name, phone, email, property_location, building_name || '',
       unit_number || '', property_type, bedrooms || 0, furnishing_status || 'furnished',
       description || '', message || '']
    );

    const subject = `New Landlord Property Listing Request - ${property_location}`;
    const html = `
      <h2>New Landlord Property Listing Request</h2>
      <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td><strong>Name</strong></td><td>${full_name}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
        <tr><td><strong>Email</strong></td><td>${email}</td></tr>
        <tr><td><strong>Property Location</strong></td><td>${property_location}</td></tr>
        <tr><td><strong>Building Name</strong></td><td>${building_name || 'N/A'}</td></tr>
        <tr><td><strong>Unit Number</strong></td><td>${unit_number || 'N/A'}</td></tr>
        <tr><td><strong>Property Type</strong></td><td>${property_type}</td></tr>
        <tr><td><strong>Bedrooms</strong></td><td>${bedrooms || 0}</td></tr>
        <tr><td><strong>Furnishing</strong></td><td>${furnishing_status || 'N/A'}</td></tr>
        <tr><td><strong>Description</strong></td><td>${description || 'N/A'}</td></tr>
        <tr><td><strong>Message</strong></td><td>${message || 'N/A'}</td></tr>
      </table>
    `;

    sendEmail({ subject, html });

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
    const [requests] = await pool.query('SELECT * FROM landlord_requests ORDER BY created_at DESC');
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
