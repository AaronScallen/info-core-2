import { Request, Response } from "express";
import { db } from "../db";
import { shiftRoster, employees, assignments } from "../db/schema";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { z } from "zod";

const shiftRosterSchema = z.object({
  shift: z.enum(["A-Shift", "B-Shift", "C-Shift"]),
  rosterDate: z.string(), // ISO date string
  enumber: z.number().positive("Officer must be selected"),
  badgeNumber: z.number(),
  lastName: z.string().max(100),
  vehicleAssigned: z.number().optional().nullable(),
  patrolZone: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => val || null),
  keysInVehicle: z.boolean().default(false),
  passAlongNotes: z
    .string()
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => val || null),
  supervisorEnumber: z.number().positive("Supervisor must be selected"),
});

const shiftRosterUpdateSchema = shiftRosterSchema.partial();

// GET all shift rosters with optional filters
export const getAllShiftRosters = async (req: Request, res: Response) => {
  try {
    const { shift, startDate, endDate, supervisorEnumber } = req.query;

    let query = db.select().from(shiftRoster);

    // Apply filters if provided
    const conditions = [];
    if (shift) {
      conditions.push(eq(shiftRoster.shift, shift as any));
    }
    if (startDate) {
      conditions.push(gte(shiftRoster.rosterDate, startDate as string));
    }
    if (endDate) {
      conditions.push(lte(shiftRoster.rosterDate, endDate as string));
    }
    if (supervisorEnumber) {
      conditions.push(
        eq(
          shiftRoster.supervisorEnumber,
          parseInt(supervisorEnumber as string),
        ),
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const rosters = await query.orderBy(
      desc(shiftRoster.rosterDate),
      asc(shiftRoster.shift),
    );

    res.json(rosters);
  } catch (err) {
    console.error("Error fetching shift rosters:", err);
    res.status(500).json({ error: "Failed to fetch shift rosters" });
  }
};

// GET single shift roster by ID
export const getShiftRosterById = async (req: Request, res: Response) => {
  try {
    const rosterId = parseInt(req.params.id!);
    if (isNaN(rosterId)) {
      return res.status(400).json({ error: "Invalid roster ID" });
    }

    const [roster] = await db
      .select()
      .from(shiftRoster)
      .where(eq(shiftRoster.rosterId, rosterId));

    if (!roster) {
      return res.status(404).json({ error: "Shift roster not found" });
    }

    res.json(roster);
  } catch (err) {
    console.error("Error fetching shift roster:", err);
    res.status(500).json({ error: "Failed to fetch shift roster" });
  }
};

// GET rosters by date (day view)
export const getShiftRostersByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const rosters = await db
      .select()
      .from(shiftRoster)
      .where(eq(shiftRoster.rosterDate, date))
      .orderBy(asc(shiftRoster.shift));

    res.json(rosters);
  } catch (err) {
    console.error("Error fetching shift rosters by date:", err);
    res.status(500).json({ error: "Failed to fetch shift rosters" });
  }
};

// GET rosters by date range (week/month view)
export const getShiftRostersByDateRange = async (
  req: Request,
  res: Response,
) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const rosters = await db
      .select()
      .from(shiftRoster)
      .where(
        and(
          gte(shiftRoster.rosterDate, startDate as string),
          lte(shiftRoster.rosterDate, endDate as string),
        ),
      )
      .orderBy(asc(shiftRoster.rosterDate), asc(shiftRoster.shift));

    res.json(rosters);
  } catch (err) {
    console.error("Error fetching shift rosters by date range:", err);
    res.status(500).json({ error: "Failed to fetch shift rosters" });
  }
};

// GET patrol officers (employees with A-Shift, B-Shift, C-Shift assignments)
export const getPatrolOfficers = async (req: Request, res: Response) => {
  try {
    const patrolOfficers = await db
      .select({
        enumber: employees.enumber,
        badge: employees.badge,
        lastName: employees.lastName,
        firstName: employees.firstName,
        assignmentId: employees.assignmentId,
        locationName: assignments.locationName,
        vehId: employees.vehId,
      })
      .from(employees)
      .leftJoin(assignments, eq(employees.assignmentId, assignments.assnId))
      .where(
        sql`${assignments.locationName} IN ('A-Shift', 'B-Shift', 'C-Shift')`,
      );

    res.json(patrolOfficers);
  } catch (err) {
    console.error("Error fetching patrol officers:", err);
    res.status(500).json({ error: "Failed to fetch patrol officers" });
  }
};

// GET patrol supervisors (employees with Patrol Cpl. assignment)
export const getPatrolSupervisors = async (req: Request, res: Response) => {
  try {
    const supervisors = await db
      .select({
        enumber: employees.enumber,
        badge: employees.badge,
        lastName: employees.lastName,
        firstName: employees.firstName,
        assignmentId: employees.assignmentId,
        locationName: assignments.locationName,
      })
      .from(employees)
      .leftJoin(assignments, eq(employees.assignmentId, assignments.assnId))
      .where(
        sql`${assignments.locationName} ILIKE '%cpl%' OR ${assignments.locationName} ILIKE '%corporal%' OR ${assignments.locationName} ILIKE '%supervisor%' OR ${assignments.locationName} ILIKE '%sergeant%' OR ${assignments.locationName} ILIKE '%sgt%'`,
      );

    console.log(`Found ${supervisors.length} supervisors`);
    res.json(supervisors);
  } catch (err) {
    console.error("Error fetching patrol supervisors:", err);
    res.status(500).json({ error: "Failed to fetch patrol supervisors" });
  }
};

// POST create new shift roster entry
export const createShiftRoster = async (req: Request, res: Response) => {
  try {
    console.log("Received shift roster creation request:", req.body);
    const validatedData = shiftRosterSchema.parse(req.body);
    console.log("Validated data:", validatedData);

    const [newRoster] = await db
      .insert(shiftRoster)
      .values({
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("Created new roster:", newRoster);
    res.status(201).json(newRoster);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("Validation error:", err.issues);
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error creating shift roster:", err);
    res.status(500).json({ error: "Failed to create shift roster" });
  }
};

// PUT/PATCH update shift roster
export const updateShiftRoster = async (req: Request, res: Response) => {
  try {
    const rosterId = parseInt(req.params.id!);
    if (isNaN(rosterId)) {
      return res.status(400).json({ error: "Invalid roster ID" });
    }

    const validatedData = shiftRosterUpdateSchema.parse(req.body);

    const [updatedRoster] = await db
      .update(shiftRoster)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(shiftRoster.rosterId, rosterId))
      .returning();

    if (!updatedRoster) {
      return res.status(404).json({ error: "Shift roster not found" });
    }

    res.json(updatedRoster);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error updating shift roster:", err);
    res.status(500).json({ error: "Failed to update shift roster" });
  }
};

// DELETE shift roster
export const deleteShiftRoster = async (req: Request, res: Response) => {
  try {
    const rosterId = parseInt(req.params.id!);
    if (isNaN(rosterId)) {
      return res.status(400).json({ error: "Invalid roster ID" });
    }

    const [deletedRoster] = await db
      .delete(shiftRoster)
      .where(eq(shiftRoster.rosterId, rosterId))
      .returning();

    if (!deletedRoster) {
      return res.status(404).json({ error: "Shift roster not found" });
    }

    res.json({ message: "Shift roster deleted successfully" });
  } catch (err) {
    console.error("Error deleting shift roster:", err);
    res.status(500).json({ error: "Failed to delete shift roster" });
  }
};
