const nodemailer = require('nodemailer');
const pool = require('../config/db');
require('dotenv').config();

async function getSmtpConfig() {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE ?', ['smtp_%']);
    const config = {};
    rows.forEach(r => { config[r.setting_key] = r.setting_value; });
    return {
      host: config.smtp_host || process.env.SMTP_HOST,
      port: parseInt(config.smtp_port) || parseInt(process.env.SMTP_PORT) || 587,
      secure: config.smtp_secure === 'true' || parseInt(config.smtp_port) === 465,
      user: config.smtp_user || process.env.SMTP_USER,
      pass: config.smtp_password || process.env.SMTP_PASSWORD,
      from: config.smtp_from_email || process.env.SMTP_FROM_EMAIL || 'noreply@authenticholidayhomes.ae',
    };
  } catch {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
      from: process.env.SMTP_FROM_EMAIL || 'noreply@authenticholidayhomes.ae',
    };
  }
}

async function getContactEmail() {
  try {
    const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', ['contact_email']);
    return rows.length > 0 ? rows[0].setting_value : process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@authenticholidayhomes.ae';
  } catch {
    return process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@authenticholidayhomes.ae';
  }
}

async function createTransporter() {
  const config = await getSmtpConfig();
  if (!config.user || !config.pass) return null;
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
}

async function sendEmail({ subject, html, to }) {
  try {
    const transporter = await createTransporter();
    if (!transporter) {
      console.log('SMTP not configured, skipping email send');
      return false;
    }
    const config = await getSmtpConfig();
    const recipient = to || await getContactEmail();
    await transporter.sendMail({
      from: config.from,
      to: recipient,
      subject,
      html,
    });
    console.log('Email sent successfully:', subject);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return false;
  }
}

async function sendEmailToUser({ to, subject, html }) {
  return sendEmail({ to, subject, html });
}

module.exports = { sendEmail, sendEmailToUser };