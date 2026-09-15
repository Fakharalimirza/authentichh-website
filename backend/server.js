require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const amenityRoutes = require('./routes/amenities');
const landlordRoutes = require('./routes/landlord');
const enquiryRoutes = require('./routes/enquiries');
const contactRoutes = require('./routes/contact');
const dashboardRoutes = require('./routes/dashboard');
const adminUsersRoutes = require('./routes/adminUsers');
const settingsRoutes = require('./routes/settings');
const communitiesRoutes = require('./routes/communities');
const articlesRoutes = require('./routes/articles');
const buildingsRoutes = require('./routes/buildings');
const landlordsRoutes = require('./routes/landlords');
const unitsRoutes = require('./routes/units');
const listingsRoutes = require('./routes/listings');
const ocrRoutes = require('./routes/ocr');
const sitemapRoutes = require('./routes/sitemap');

const app = express();
const PORT = process.env.PORT || 5000;

// Behind cPanel/Apache proxy — trust X-Forwarded-* headers so
// express-rate-limit sees real client IPs (silences ERR_ERL_UNEXPECTED_X_FORWARDED_FOR).
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://maps.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com', 'https://*.googleapis.com', 'https://*.gstatic.com', 'https://*.ggpht.com'],
      connectSrc: ["'self'", 'https://maps.googleapis.com', 'https://*.googleapis.com', 'https://*.gstatic.com'],
      frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://*.googleapis.com', 'https://*.gstatic.com'],
      fontSrc: ["'self'", 'https:', 'data:'],
    },
  },
}));
app.use(cors({ origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://10.255.253.84:5173', 'http://172.24.16.1:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/admin', authRoutes);
app.use('/api/admin/properties', propertyRoutes);
app.use('/api/admin/amenities', amenityRoutes);
app.use('/api/admin/landlord-requests', landlordRoutes);
app.use('/api/admin/property-enquiries', enquiryRoutes);
app.use('/api/admin/contact-messages', contactRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/admin-users', adminUsersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/communities', communitiesRoutes);
app.use('/api/admin/buildings', buildingsRoutes);
app.use('/api/buildings', buildingsRoutes);
app.use('/api/admin/landlords', landlordsRoutes);
app.use('/api/admin/units', unitsRoutes);
app.use('/api/admin/listings', listingsRoutes);
app.use('/api/admin/ocr', ocrRoutes);
app.use('/api/admin/onboarding', require('./routes/onboarding'));
app.use('/api/communities', communitiesRoutes);
app.use('/api/admin/articles', articlesRoutes);
app.use('/api/articles', articlesRoutes);

app.use('/api/properties', propertyRoutes);
app.use('/api/listings', require('./routes/listings'));
app.use('/api/amenities', amenityRoutes);
app.use('/api/landlord-requests', landlordRoutes);
app.use('/api/property-enquiries', enquiryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/config', require('./routes/config'));
app.use('/api/reviews', require('./routes/reviews'));
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dynamic XML sitemap — public pages + published properties + published area articles.
// Served at both /sitemap.xml (crawler-facing) and /api/sitemap.xml (internal/legacy).
app.use('/', sitemapRoutes);
app.use('/api', sitemapRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }
  if (err.message && err.message.includes('Only')) {
    return res.status(400).json({ message: err.message });
  }
  if (err.message && err.message.includes('OCR.space')) {
    return res.status(502).json({ message: 'Document scanning service is temporarily unavailable. Please try again in a few minutes.' });
  }
  if (err.message && err.message.includes('Gemini')) {
    return res.status(502).json({ message: 'AI extraction service is temporarily unavailable. Please try again.' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
