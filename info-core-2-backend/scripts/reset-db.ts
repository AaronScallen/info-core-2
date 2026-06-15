import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetDatabase() {
  try {
    console.log("Dropping all tables...");

    // Drop all tables in the correct order (respecting foreign keys)
    await pool.query("DROP TABLE IF EXISTS absences CASCADE;");
    await pool.query("DROP TABLE IF EXISTS users CASCADE;");
    await pool.query("DROP TABLE IF EXISTS employees CASCADE;");
    await pool.query("DROP TABLE IF EXISTS assignments CASCADE;");
    await pool.query("DROP TABLE IF EXISTS bodycams CASCADE;");
    await pool.query("DROP TABLE IF EXISTS police_vehicles CASCADE;");
    await pool.query("DROP TABLE IF EXISTS cell_phones CASCADE;");

    // Drop the enum type
    await pool.query("DROP TYPE IF EXISTS role CASCADE;");

    console.log("✓ All tables dropped successfully");
    console.log("\nNow run: npx drizzle-kit push");

    await pool.end();
  } catch (error) {
    console.error("Error resetting database:", error);
    await pool.end();
    process.exit(1);
  }
}

resetDatabase();
