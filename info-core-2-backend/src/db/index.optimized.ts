import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

/**
 * OPTIMIZED DATABASE CONNECTION POOL
 *
 * Key optimizations:
 * 1. Limited max connections (prevents Neon from creating too many connections)
 * 2. Connection timeout settings
 * 3. Idle connection management
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Limit max connections to reduce costs
  // Neon Free tier: max 20 connections
  // Adjust based on your Neon plan
  max: 10, // Maximum number of clients in the pool

  // Minimum number of clients to keep in the pool
  min: 2,

  // Maximum time (ms) a client can remain idle before being closed
  idleTimeoutMillis: 30000, // 30 seconds

  // Maximum time (ms) to wait for a connection from the pool
  connectionTimeoutMillis: 10000, // 10 seconds

  // Enable connection reuse
  allowExitOnIdle: false,
});

// Monitor pool events for debugging
pool.on("connect", () => {
  console.log("[DB] New client connected to pool");
});

pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err);
});

pool.on("remove", () => {
  console.log("[DB] Client removed from pool");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("[DB] Closing database pool...");
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("[DB] Closing database pool...");
  await pool.end();
  process.exit(0);
});

export const db = drizzle(pool, { schema });

/**
 * Helper function to check pool status
 */
export const getPoolStats = () => {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
};
