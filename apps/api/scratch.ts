import { pool } from './src/db/pool';

async function run() {
  try {
    console.log("=== Migration: Add tanggal_lahir to alumni ===");
    
    // Add tanggal_lahir column (nullable DATE)
    await pool.query(`
      ALTER TABLE alumni ADD COLUMN IF NOT EXISTS tanggal_lahir DATE;
    `);
    console.log("✅ Column tanggal_lahir added (or already exists).");

    // Run ANALYZE to refresh query planner statistics
    await pool.query(`ANALYZE alumni;`);
    console.log("✅ ANALYZE alumni completed.");

    console.log("\n=== Migration complete ===");
  } catch (err) {
    console.error("Error executing migration:", err);
  } finally {
    pool.end();
  }
}

run();
