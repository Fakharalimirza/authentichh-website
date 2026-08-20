const pool = require('../config/db');

exports.getSummary = async (req, res) => {
  try {
    const [totalProperties] = await pool.query('SELECT COUNT(*) as count FROM units');
    const [publishedProperties] = await pool.query("SELECT COUNT(*) as count FROM units WHERE status = 'published'");
    const [draftProperties] = await pool.query("SELECT COUNT(*) as count FROM units WHERE status = 'draft'");
    const [totalEnquiries] = await pool.query('SELECT COUNT(*) as count FROM property_enquiries');
    const [newEnquiries] = await pool.query("SELECT COUNT(*) as count FROM property_enquiries WHERE status = 'new'");
    const [landlordRequests] = await pool.query('SELECT COUNT(*) as count FROM landlord_requests');
    const [newLandlordRequests] = await pool.query("SELECT COUNT(*) as count FROM landlord_requests WHERE status = 'new'");
    const [contactMessages] = await pool.query('SELECT COUNT(*) as count FROM contact_messages');
    const [newContactMessages] = await pool.query("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'new'");

    res.json({
      totalProperties: totalProperties[0].count,
      publishedProperties: publishedProperties[0].count,
      draftProperties: draftProperties[0].count,
      totalEnquiries: totalEnquiries[0].count,
      newEnquiries: newEnquiries[0].count,
      landlordRequests: landlordRequests[0].count,
      newLandlordRequests: newLandlordRequests[0].count,
      contactMessages: contactMessages[0].count,
      newContactMessages: newContactMessages[0].count
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
