import { Request, Response } from "express";
import { db } from "../db";
import { employees } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const employeeSchema = z.object({
  enumber: z.number(),
  badge: z.number().optional().nullable(),
  positionNumber: z.number().optional().nullable(),
  pid: z.number().optional().nullable(),
  dob: z.string().optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  firstName: z.string().max(100).optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  assignmentId: z.number().optional().nullable(),
  bwcId: z.number().optional().nullable(),
  vehId: z.number().optional().nullable(),
  cellphoneId: z.number().optional().nullable(),
});

const employeeUpdateSchema = employeeSchema.partial().omit({ enumber: true });

// GET all employees WITH PAGINATION
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Cap at 100
    const offset = (page - 1) * limit;

    // Optional: Only select needed fields
    const fields = req.query.fields as string;

    // Get total count (cached later)
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees);
    const count = countResult[0]?.count || 0;

    // Get paginated data
    const allEmployees = await db
      .select()
      .from(employees)
      .limit(limit)
      .offset(offset);

    res.json({
      data: allEmployees,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};

// GET single employee by enumber
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const enumber = parseInt(req.params.id!);
    if (isNaN(enumber)) {
      return res.status(400).json({ error: "Invalid employee number" });
    }

    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.enumber, enumber));

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(employee);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ error: "Failed to fetch employee" });
  }
};

// POST create new employee
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const validatedData = employeeSchema.parse(req.body);

    const [newEmployee] = await db
      .insert(employees)
      .values(validatedData)
      .returning();

    res.status(201).json(newEmployee);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error creating employee:", err);
    res.status(500).json({ error: "Failed to create employee" });
  }
};

// PATCH update employee
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const enumber = parseInt(req.params.id!);
    if (isNaN(enumber)) {
      return res.status(400).json({ error: "Invalid employee number" });
    }

    const validatedData = employeeUpdateSchema.parse(req.body);

    const [updatedEmployee] = await db
      .update(employees)
      .set(validatedData)
      .where(eq(employees.enumber, enumber))
      .returning();

    if (!updatedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(updatedEmployee);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error updating employee:", err);
    res.status(500).json({ error: "Failed to update employee" });
  }
};

// DELETE employee
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const enumber = parseInt(req.params.id!);
    if (isNaN(enumber)) {
      return res.status(400).json({ error: "Invalid employee number" });
    }

    const [deletedEmployee] = await db
      .delete(employees)
      .where(eq(employees.enumber, enumber))
      .returning();

    if (!deletedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ error: "Failed to delete employee" });
  }
};

// BULK operations to reduce multiple queries
export const bulkCreateEmployees = async (req: Request, res: Response) => {
  try {
    const employeesData = z.array(employeeSchema).parse(req.body);

    const newEmployees = await db
      .insert(employees)
      .values(employeesData)
      .returning();

    res.status(201).json(newEmployees);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error bulk creating employees:", err);
    res.status(500).json({ error: "Failed to bulk create employees" });
  }
};
