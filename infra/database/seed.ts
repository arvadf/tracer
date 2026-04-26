import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../apps/api/.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tracer';

const pool = new Pool({
  connectionString: dbUrl,
});

async function run() {
  try {
    console.log('Testing Database Connection...');
    const now = await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL:', now.rows[0].now);

    console.log('Applying Schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
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
    console.error('Error during DB validation/seeding:', err);
  } finally {
    pool.end();
  }
}

run();
