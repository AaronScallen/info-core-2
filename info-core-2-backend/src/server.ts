import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { register, login } from "./controllers/auth.controller";
import { db } from "./db";
import { users } from "./db/schema";
import apiRoutes from "./routes/index";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Auth Routes
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

// API Routes (all protected endpoints)
app.use("/api", apiRoutes);

// Setup server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Auth endpoints available:`);
  console.log(`  POST http://localhost:${PORT}/api/auth/register`);
  console.log(`  POST http://localhost:${PORT}/api/auth/login`);

  // Test database connection
  try {
    await db.select().from(users).limit(1);
    console.log("✓ Database connected successfully");
  } catch (error) {
    console.error("✗ Database connection failed:", error);
  }
});
