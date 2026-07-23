const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendEmail({ subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('SMTP not configured, skipping email send');
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || 'noreply@authenticholidayhomes.ae',
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
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

module.exports = { sendEmail };
