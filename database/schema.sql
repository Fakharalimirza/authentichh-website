CREATE DATABASE IF NOT EXISTS authentic_holiday_homes;
USE authentic_holiday_homes;

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'superadmin') DEFAULT 'admin',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  property_type VARCHAR(100) DEFAULT '',
  building_name VARCHAR(255) DEFAULT '',
  location VARCHAR(255) DEFAULT '',
  address TEXT,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  max_guests INT DEFAULT 0,
  parking_spots INT DEFAULT 0,
  size_sqft INT DEFAULT NULL,
  price_per_night DECIMAL(10,2) DEFAULT 0.00,
  short_description TEXT,
  description TEXT,
  map_url TEXT,
  plus_code VARCHAR(50) DEFAULT NULL,
  latitude DECIMAL(10,8) DEFAULT NULL,
  longitude DECIMAL(11,8) DEFAULT NULL,
  status ENUM('draft', 'published', 'unpublished') DEFAULT 'draft',
  is_featured TINYINT(1) DEFAULT 0,
  meta_title VARCHAR(255) DEFAULT '',
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Property Images
CREATE TABLE IF NOT EXISTS property_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_cover TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Amenities
CREATE TABLE IF NOT EXISTS amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT '',
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property Amenities (pivot)
CREATE TABLE IF NOT EXISTS property_amenities (
  property_id INT NOT NULL,
  amenity_id INT NOT NULL,
  PRIMARY KEY (property_id, amenity_id),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- Property Enquiries
CREATE TABLE IF NOT EXISTS property_enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  check_in DATE DEFAULT NULL,
  check_out DATE DEFAULT NULL,
  guests INT DEFAULT 0,
  message TEXT,
  status ENUM('new', 'contacted', 'closed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Landlord Requests
CREATE TABLE IF NOT EXISTS landlord_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  property_location VARCHAR(255) NOT NULL,
  building_name VARCHAR(255) DEFAULT '',
  unit_number VARCHAR(50) DEFAULT '',
  property_type VARCHAR(100) NOT NULL,
  bedrooms INT DEFAULT 0,
  furnishing_status VARCHAR(50) DEFAULT 'furnished',
  description TEXT,
  message TEXT,
  status ENUM('new', 'contacted', 'in_discussion', 'approved', 'rejected', 'converted_to_listing') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(50) DEFAULT '',
  subject VARCHAR(255) DEFAULT '',
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'closed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default amenities
INSERT INTO amenities (name, icon, description) VALUES
('Wi-Fi', 'wifi', 'High-speed wireless internet access'),
('Swimming Pool', 'pool', 'Access to swimming pool'),
('Gym', 'gym', 'Fully equipped fitness center'),
('Parking', 'parking', 'Reserved parking space'),
('Smart Lock', 'smartlock', 'Keyless smart lock entry'),
('Air Conditioning', 'ac', 'Central air conditioning'),
('TV', 'tv', 'Flat-screen television'),
('Washing Machine', 'washer', 'In-unit washing machine'),
('Equipped Kitchen', 'kitchen', 'Fully equipped modern kitchen'),
('Balcony', 'balcony', 'Private balcony'),
('Security', 'security', '24-hour building security'),
('Safe', 'safe', 'In-room safety deposit box'),
('Coffee Maker', 'coffee', 'Coffee maker machine'),
('Hair Dryer', 'hair', 'Hair dryer provided');

-- Default admin user (password: admin123) - hash will be set by seed script
INSERT IGNORE INTO admin_users (name, email, password_hash, role) VALUES
('Admin', 'admin@authenticholidayhomes.ae', '', 'superadmin');
