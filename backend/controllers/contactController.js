const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

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

    const emailSubject = `New Contact Message - ${subject || 'No Subject'}`;
    const html = `
      <h2>New Contact Message</h2>
      <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;max-width:600px">
        <tr><td><strong>Name</strong></td><td>${name}</td></tr>
        <tr><td><strong>Email</strong></td><td>${email}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${phone || 'N/A'}</td></tr>
        <tr><td><strong>Subject</strong></td><td>${subject || 'N/A'}</td></tr>
        <tr><td><strong>Message</strong></td><td>${message}</td></tr>
      </table>
    `;

    sendEmail({ subject: emailSubject, html });

    res.status(201).json({ message: 'Thank you for your message. We will get back to you soon.' });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const [messages] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(messages);
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
