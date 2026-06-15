import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runIndexes = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("📊 Adding database indexes for optimization...");

    const sqlPath = path.join(__dirname, "../add-indexes.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Split by semicolon and filter out empty statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      try {
        await pool.query(statement);
        if (statement.toLowerCase().includes("create index")) {
          successCount++;
          console.log(`✅ Created index`);
        } else if (statement.toLowerCase().includes("vacuum")) {
          console.log(`✅ Analyzed table`);
        }
      } catch (err: any) {
        if (err.message.includes("already exists")) {
          skipCount++;
          console.log(`⏭️  Index already exists (skipped)`);
        } else {
          console.error(`❌ Error:`, err.message);
        }
      }
    }

    console.log("\n📈 Summary:");
    console.log(`   ✅ Created: ${successCount} indexes`);
    console.log(`   ⏭️  Skipped: ${skipCount} existing indexes`);
    console.log("\n🎉 Database optimization complete!");
    console.log(
      "   Your queries should now be faster and more cost-effective.",
    );

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error running indexes:", error);
    await pool.end();
    process.exit(1);
  }
};

runIndexes();
