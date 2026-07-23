require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await connection.query(schema);

  const passwordHash = await bcrypt.hash('admin123', 10);
  await connection.query(
    'UPDATE admin_users SET password_hash = ? WHERE email = ?',
    [passwordHash, 'admin@authenticholidayhomes.ae']
  );

  console.log('Database seeded successfully!');
  console.log('Admin login: admin@authenticholidayhomes.ae / admin123');
  await connection.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
