function baseTemplate({ title, content }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: 'Inter', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #1a1a1a 0%, #E31E24 100%); padding: 40px 30px; text-align: center; }
    .header-logo { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 700; color: #C9A96E; letter-spacing: 2px; }
    .header-logo span { color: #ffffff; }
    .header-tagline { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 4px; letter-spacing: 3px; text-transform: uppercase; }
    .content { padding: 30px; color: #333333; font-size: 14px; line-height: 1.7; }
    .content h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #1a1a1a; margin: 0 0 20px; }
    .table-wrap { background: #fafafa; border-radius: 8px; overflow: hidden; margin: 20px 0; }
    table.data { width: 100%; border-collapse: collapse; }
    table.data td { padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 13px; }
    table.data td.label { font-weight: 600; color: #888; width: 120px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    table.data td.value { color: #333; }
    table.data tr:last-child td { border-bottom: none; }
    .footer { background: #1a1a1a; padding: 30px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.5); font-size: 12px; margin: 4px 0; }
    .footer a { color: #C9A96E; text-decoration: none; }
    .btn { display: inline-block; padding: 12px 24px; background: #E31E24; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; margin: 10px 0; }
    .divider { height: 1px; background: #eee; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo"><span>Authentic</span> Holiday Homes</div>
      <div class="header-tagline">Dubai's Premier Holiday Home Management</div>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>Authentic Holiday Homes</p>
      <p>Dubai, United Arab Emirates</p>
      <p><a href="https://authenticholidayhomes.ae">authenticholidayhomes.ae</a></p>
      <p style="margin-top:12px; color:rgba(255,255,255,0.3); font-size:11px;">This is an automated notification. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

function enquiryAdminTemplate({ name, email, phone, propertyName, checkIn, checkOut, guests, message }) {
  const title = `New Enquiry — ${propertyName}`;
  const content = `
    <p>A new property enquiry has been submitted.</p>
    <div class="table-wrap">
      <table class="data">
        <tr><td class="label">Property</td><td class="value">${propertyName}</td></tr>
        <tr><td class="label">Name</td><td class="value">${name}</td></tr>
        <tr><td class="label">Email</td><td class="value">${email}</td></tr>
        <tr><td class="label">Phone</td><td class="value">${phone}</td></tr>
        <tr><td class="label">Check-in</td><td class="value">${checkIn}</td></tr>
        <tr><td class="label">Check-out</td><td class="value">${checkOut}</td></tr>
        <tr><td class="label">Guests</td><td class="value">${guests}</td></tr>
        ${message ? `<tr><td class="label">Message</td><td class="value">${message}</td></tr>` : ''}
      </table>
    </div>
    <div style="text-align:center">
      <a href="https://authenticholidayhomes.ae/admin/enquiries" class="btn">View in Dashboard</a>
    </div>
  `;
  return baseTemplate({ title, content });
}

function enquiryUserTemplate({ name, propertyName, checkIn, checkOut }) {
  const title = 'Thank You for Your Enquiry';
  const content = `
    <p>Dear ${name},</p>
    <p>Thank you for your interest in <strong>${propertyName}</strong>. We have received your enquiry and one of our team members will contact you shortly to confirm availability and assist with your booking.</p>
    ${checkIn ? `<p><strong>Requested Stay:</strong> ${checkIn} — ${checkOut || 'Flexible'}</p>` : ''}
    <p>If you have any urgent questions, please call us at <a href="tel:+97141234567" style="color:#E31E24;text-decoration:none;font-weight:600;">+971 4 123 4567</a>.</p>
    <div class="divider"></div>
    <p style="font-size:13px;color:#888;">Warm regards,<br><strong>The Authentic Holiday Homes Team</strong></p>
  `;
  return baseTemplate({ title, content });
}

function landlordAdminTemplate({ fullName, email, phone, propertyLocation, buildingName, unitNumber, propertyType, bedrooms, furnishingStatus, description, userMessage }) {
  const title = 'New Landlord Listing Request';
  const content = `
    <p>A new landlord has submitted a property listing request.</p>
    <div class="table-wrap">
      <table class="data">
        <tr><td class="label">Name</td><td class="value">${fullName}</td></tr>
        <tr><td class="label">Email</td><td class="value">${email}</td></tr>
        <tr><td class="label">Phone</td><td class="value">${phone}</td></tr>
        <tr><td class="label">Location</td><td class="value">${propertyLocation}</td></tr>
        ${buildingName ? `<tr><td class="label">Building</td><td class="value">${buildingName}</td></tr>` : ''}
        ${unitNumber ? `<tr><td class="label">Unit</td><td class="value">${unitNumber}</td></tr>` : ''}
        <tr><td class="label">Type</td><td class="value">${propertyType}</td></tr>
        <tr><td class="label">Bedrooms</td><td class="value">${bedrooms}</td></tr>
        <tr><td class="label">Furnishing</td><td class="value">${furnishingStatus}</td></tr>
        ${description ? `<tr><td class="label">Description</td><td class="value">${description}</td></tr>` : ''}
        ${userMessage ? `<tr><td class="label">Message</td><td class="value">${userMessage}</td></tr>` : ''}
      </table>
    </div>
    <div style="text-align:center">
      <a href="https://authenticholidayhomes.ae/admin/landlord-requests" class="btn">View in Dashboard</a>
    </div>
  `;
  return baseTemplate({ title, content });
}

function landlordUserTemplate({ fullName }) {
  const title = 'Thank You for Your Submission';
  const content = `
    <p>Dear ${fullName},</p>
    <p>Thank you for your interest in listing your property with Authentic Holiday Homes.</p>
    <p>Our team has received your request and will review the details. A member of our partnerships team will contact you within 24 hours to discuss next steps and answer any questions you may have.</p>
    <p>If you have any urgent questions, please call us at <a href="tel:+97141234567" style="color:#E31E24;text-decoration:none;font-weight:600;">+971 4 123 4567</a>.</p>
    <div class="divider"></div>
    <p style="font-size:13px;color:#888;">Warm regards,<br><strong>The Authentic Holiday Homes Team</strong></p>
  `;
  return baseTemplate({ title, content });
}

function contactAdminTemplate({ name, email, phone, subject, message }) {
  const title = `New Contact Message — ${subject || 'No Subject'}`;
  const content = `
    <p>A new contact form message has been submitted.</p>
    <div class="table-wrap">
      <table class="data">
        <tr><td class="label">Name</td><td class="value">${name}</td></tr>
        <tr><td class="label">Email</td><td class="value">${email}</td></tr>
        ${phone ? `<tr><td class="label">Phone</td><td class="value">${phone}</td></tr>` : ''}
        ${subject ? `<tr><td class="label">Subject</td><td class="value">${subject}</td></tr>` : ''}
        <tr><td class="label">Message</td><td class="value">${message}</td></tr>
      </table>
    </div>
    <div style="text-align:center">
      <a href="https://authenticholidayhomes.ae/admin/contact-messages" class="btn">View in Dashboard</a>
    </div>
  `;
  return baseTemplate({ title, content });
}

function contactUserTemplate({ name }) {
  const title = 'Thank You for Contacting Us';
  const content = `
    <p>Dear ${name},</p>
    <p>Thank you for reaching out to Authentic Holiday Homes. We have received your message and will get back to you as soon as possible.</p>
    <p>Our team typically responds within 24 hours during business days.</p>
    <p>If you have an urgent enquiry, please call us directly at <a href="tel:+97141234567" style="color:#E31E24;text-decoration:none;font-weight:600;">+971 4 123 4567</a>.</p>
    <div class="divider"></div>
    <p style="font-size:13px;color:#888;">Warm regards,<br><strong>The Authentic Holiday Homes Team</strong></p>
  `;
  return baseTemplate({ title, content });
}

module.exports = {
  enquiryAdminTemplate,
  enquiryUserTemplate,
  landlordAdminTemplate,
  landlordUserTemplate,
  contactAdminTemplate,
  contactUserTemplate,
};