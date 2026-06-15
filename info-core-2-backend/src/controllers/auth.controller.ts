import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z
    .enum(["dispatch", "officer", "supervisor", "command_staff"])
    .optional(),
  employeeId: z.number().optional(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, role, employeeId } = registerSchema.parse(
      req.body
    );

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // If employeeId is provided, verify it exists in employees table
    if (employeeId) {
      const { employees } = await import("../db/schema");
      const [employee] = await db
        .select()
        .from(employees)
        .where(eq(employees.enumber, employeeId));
      
      if (!employee) {
        return res.status(400).json({ 
          message: `Employee with ID ${employeeId} does not exist. Please create the employee first or register without an employee ID.` 
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        passwordHash,
        role: role || "officer",
        employeeId: employeeId || null,
      })
      .returning();

    res
      .status(201)
      .json({ message: "User created successfully", userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};
