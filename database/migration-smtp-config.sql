-- Migration: Configure SMTP email settings
-- Sets up mail.authenticholidayhomes.ae for all public form notifications

-- SMTP credentials (stored in DB — overrides .env fallback)
INSERT INTO settings (setting_key, setting_value) VALUES
  ('smtp_host', 'mail.authenticholidayhomes.ae'),
  ('smtp_port', '465'),
  ('smtp_user', 'website@authenticholidayhomes.ae'),
  ('smtp_password', 'Website@AHH@321.#'),
  ('smtp_from_email', 'website@authenticholidayhomes.ae'),
  ('smtp_secure', 'true')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Admin notification recipient (where form submissions go)
INSERT INTO settings (setting_key, setting_value) VALUES
  ('contact_email', 'it@authenticholidayhomes.ae')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
