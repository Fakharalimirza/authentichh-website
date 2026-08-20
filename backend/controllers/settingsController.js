const pool = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  } catch (err) { next(err); }
};

exports.getPublic = async (req, res, next) => {
  try {
    const keys = ['site_name', 'contact_email', 'contact_phone', 'address', 'locations', 'facebook_url', 'instagram_url', 'rms_login_url'];
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings WHERE setting_key IN (?)', [keys]);
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    if (settings.locations) {
      try { settings.locations = JSON.parse(settings.locations); } catch { settings.locations = []; }
    }
    res.json(settings);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
      );
    }
    res.json({ message: 'Settings updated' });
  } catch (err) { next(err); }
};