import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:arvadamar@localhost:5432/tracer',
});

async function run() {
  try {
    await pool.query('ALTER TABLE alumni ADD COLUMN email VARCHAR(255) UNIQUE;');
    console.log('Column email added');
  } catch (err: any) {
    if (err.code === '42701') {
      console.log('Column already exists');
    } else {
      console.error(err);
    }
  } finally {
    await pool.end();
  }
}

run();
