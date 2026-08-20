const path = require('path');
const backendModules = path.join(__dirname, '..', 'backend', 'node_modules');
const req = require('module').createRequire(path.join(backendModules, 'package.json'));
req('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const mysql = req('mysql2/promise');
const bcrypt = req('bcryptjs');
const fs = require('fs');

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
