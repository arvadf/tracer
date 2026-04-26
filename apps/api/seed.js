const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dbUrl = 'postgresql://postgres:arvadamar@localhost:5432/tracer';

const pool = new Pool({
  connectionString: dbUrl,
});

async function run() {
  try {
    console.log('Testing Database Connection...');
    const now = await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL:', now.rows[0].now);

    console.log('Dropping existing tables and types...');
    await pool.query(`
      DROP TABLE IF EXISTS surveys CASCADE;
      DROP TABLE IF EXISTS alumni CASCADE;
      DROP TABLE IF EXISTS admins CASCADE;
      DROP TYPE IF EXISTS status_pekerjaan_enum CASCADE;
    `);

    console.log('Applying Schema...');
    const schemaPath = path.join(__dirname, '../../infra/database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('Schema applied successfully.');
    } else {
      console.log('schema.sql not found at', schemaPath);
    }

    console.log('Seeding Data (1 Admin, 3 Dummy Alumni)...');
    
    // Seed Admin
    const passHash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO admins (username, password_hash, nama) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (username) DO NOTHING`,
      ['admin', passHash, 'Administrator Master']
    );

    // Seed Alumni
    await pool.query(
      `INSERT INTO alumni (nama_lengkap, nim, tahun_lulus) 
       VALUES 
       ('Ahmad Budi', 'A71010001', 2020),
       ('Siti Aminah', 'A71010002', 2021),
       ('Joko Susilo', 'A71010003', 2019)
       ON CONFLICT (nim) DO NOTHING`
    );

    console.log('Seeding Complete.');
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
       console.error('PostgreSQL Connection Refused. Make sure it is running on port 5432 with correct password.');
    } else {
       console.error('Error during DB validation/seeding:', err);
    }
  } finally {
    pool.end();
  }
}

run();
