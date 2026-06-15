import { config } from "dotenv";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

config();

const demoUsers = [
  {
    username: "demo.command",
    password: "InfoCore123!",
    role: "command_staff",
  },
  {
    username: "demo.supervisor",
    password: "InfoCore123!",
    role: "supervisor",
  },
  {
    username: "demo.dispatch",
    password: "InfoCore123!",
    role: "dispatch",
  },
  {
    username: "demo.officer",
    password: "InfoCore123!",
    role: "officer",
  },
] as const;

async function seedDemoUsers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Seeding demo users...");

    for (const demoUser of demoUsers) {
      const passwordHash = await bcrypt.hash(demoUser.password, 10);

      await pool.query(
        `
          INSERT INTO users (username, password_hash, role)
          VALUES ($1, $2, $3)
          ON CONFLICT (username)
          DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role
        `,
        [demoUser.username, passwordHash, demoUser.role],
      );
    }

    console.log("Demo users ready:");
    for (const demoUser of demoUsers) {
      console.log(
        `- ${demoUser.role}: ${demoUser.username} / ${demoUser.password}`,
      );
    }
  } catch (error) {
    console.error("Error seeding demo users:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedDemoUsers();
