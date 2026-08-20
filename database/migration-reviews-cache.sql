CREATE TABLE IF NOT EXISTS reviews_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cache_key VARCHAR(50) UNIQUE NOT NULL DEFAULT 'google',
  data JSON,
  refresh_token TEXT,
  account_name VARCHAR(255),
  location_name VARCHAR(255),
  rating DECIMAL(2,1),
  total_ratings INT,
  fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO reviews_cache (cache_key, data, rating, total_ratings, fetched_at)
VALUES ('google', '[]', 0, 0, '2000-01-01 00:00:00')
ON DUPLICATE KEY UPDATE cache_key = cache_key;
