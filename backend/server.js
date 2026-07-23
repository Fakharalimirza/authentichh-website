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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
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

app.use('/api/properties', propertyRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/landlord-requests', landlordRoutes);
app.use('/api/property-enquiries', enquiryRoutes);
app.use('/api/contact', contactRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }
  if (err.message && err.message.includes('Only')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
