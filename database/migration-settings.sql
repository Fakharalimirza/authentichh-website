CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
('site_name', 'Authentic Holiday Homes'),
('contact_email', 'info@authenticholidayhomes.ae'),
('contact_phone', '+971 4 123 4567'),
('address', 'Dubai, UAE'),
('facebook_url', ''),
('instagram_url', ''),
('rms_login_url', 'https://rms.authenticholidayhomes.ae'),
('smtp_host', 'smtp.gmail.com'),
('smtp_port', '587'),
('smtp_user', ''),
('smtp_password', ''),
('smtp_from_email', 'noreply@authenticholidayhomes.ae'),
('smtp_secure', 'false'),
('locations', '["Dubai Marina","Downtown Dubai","Palm Jumeirah","JBR","Business Bay"]');
