import { Request, Response } from "express";
import { db } from "../db";
import { absences } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const absenceSchema = z.object({
  enumber: z.number().optional().nullable(),
  assignment: z.string().max(255).optional().nullable(),
  coveringEmpId: z.number().optional().nullable(),
  dateOfEntry: z.union([z.string(), z.date()]).optional().nullable(),
  notes: z.string().optional().nullable(),
});

const absenceUpdateSchema = absenceSchema.partial();

// GET all absences
export const getAllAbsences = async (req: Request, res: Response) => {
  try {
    const allAbsences = await db.select().from(absences);
    res.json(allAbsences);
  } catch (err) {
    console.error("Error fetching absences:", err);
    res.status(500).json({ error: "Failed to fetch absences" });
  }
};

// GET single absence by ID
export const getAbsenceById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid absence ID" });
    }

    const [absence] = await db
      .select()
      .from(absences)
      .where(eq(absences.absenceId, id));

    if (!absence) {
      return res.status(404).json({ error: "Absence not found" });
    }

    res.json(absence);
  } catch (err) {
    console.error("Error fetching absence:", err);
    res.status(500).json({ error: "Failed to fetch absence" });
  }
};

// POST create new absence
export const createAbsence = async (req: Request, res: Response) => {
  try {
    const validatedData = absenceSchema.parse(req.body);

    // Convert string date to Date object if provided
    const dataToInsert: any = { ...validatedData };
    if (
      validatedData.dateOfEntry &&
      typeof validatedData.dateOfEntry === "string"
    ) {
      dataToInsert.dateOfEntry = new Date(validatedData.dateOfEntry);
    }

    const [newAbsence] = await db
      .insert(absences)
      .values(dataToInsert)
      .returning();

    res.status(201).json(newAbsence);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error creating absence:", err);
    res.status(500).json({ error: "Failed to create absence" });
  }
};

// PUT/PATCH update absence
export const updateAbsence = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid absence ID" });
    }

    const validatedData = absenceUpdateSchema.parse(req.body);

    // Convert string date to Date object if provided
    const dataToUpdate: any = { ...validatedData };
    if (
      validatedData.dateOfEntry &&
      typeof validatedData.dateOfEntry === "string"
    ) {
      dataToUpdate.dateOfEntry = new Date(validatedData.dateOfEntry);
    }

    const [updatedAbsence] = await db
      .update(absences)
      .set(dataToUpdate)
      .where(eq(absences.absenceId, id))
      .returning();

    if (!updatedAbsence) {
      return res.status(404).json({ error: "Absence not found" });
    }

    res.json(updatedAbsence);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error updating absence:", err);
    res.status(500).json({ error: "Failed to update absence" });
  }
};

// DELETE absence
export const deleteAbsence = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid absence ID" });
    }

    const [deletedAbsence] = await db
      .delete(absences)
      .where(eq(absences.absenceId, id))
      .returning();

    if (!deletedAbsence) {
      return res.status(404).json({ error: "Absence not found" });
    }

    res.json({
      message: "Absence deleted successfully",
      absence: deletedAbsence,
    });
  } catch (err) {
    console.error("Error deleting absence:", err);
    res.status(500).json({ error: "Failed to delete absence" });
  }
};
