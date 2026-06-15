import { Request, Response } from "express";
import { db } from "../db";
import { cellPhones, employees } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const cellPhoneSchema = z.object({
  idShort: z.number().optional().nullable(),
  phoneNum: z.string().max(20).optional().nullable(),
  make: z.string().max(50).optional().nullable(),
  model: z.string().max(50).optional().nullable(),
});

const cellPhoneUpdateSchema = cellPhoneSchema.partial();

// GET all cell phones
export const getAllCellPhones = async (req: Request, res: Response) => {
  try {
    const allCellPhones = await db
      .select({
        phoneId: cellPhones.phoneId,
        idShort: cellPhones.idShort,
        phoneNum: cellPhones.phoneNum,
        make: cellPhones.make,
        model: cellPhones.model,
        assignedToBadge: employees.badge,
      })
      .from(cellPhones)
      .leftJoin(employees, eq(cellPhones.phoneId, employees.cellphoneId));
    res.json(allCellPhones);
  } catch (err) {
    console.error("Error fetching cell phones:", err);
    res.status(500).json({ error: "Failed to fetch cell phones" });
  }
};

// GET single cell phone by ID
export const getCellPhoneById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid cell phone ID" });
    }

    const [cellPhone] = await db
      .select()
      .from(cellPhones)
      .where(eq(cellPhones.phoneId, id));

    if (!cellPhone) {
      return res.status(404).json({ error: "Cell phone not found" });
    }

    res.json(cellPhone);
  } catch (err) {
    console.error("Error fetching cell phone:", err);
    res.status(500).json({ error: "Failed to fetch cell phone" });
  }
};

// POST create new cell phone
export const createCellPhone = async (req: Request, res: Response) => {
  try {
    const validatedData = cellPhoneSchema.parse(req.body);

    const [newCellPhone] = await db
      .insert(cellPhones)
      .values(validatedData)
      .returning();

    res.status(201).json(newCellPhone);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error creating cell phone:", err);
    res.status(500).json({ error: "Failed to create cell phone" });
  }
};

// PUT/PATCH update cell phone
export const updateCellPhone = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid cell phone ID" });
    }

    const validatedData = cellPhoneUpdateSchema.parse(req.body);

    const [updatedCellPhone] = await db
      .update(cellPhones)
      .set(validatedData)
      .where(eq(cellPhones.phoneId, id))
      .returning();

    if (!updatedCellPhone) {
      return res.status(404).json({ error: "Cell phone not found" });
    }

    res.json(updatedCellPhone);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error updating cell phone:", err);
    res.status(500).json({ error: "Failed to update cell phone" });
  }
};

// DELETE cell phone
export const deleteCellPhone = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid cell phone ID" });
    }

    const [deletedCellPhone] = await db
      .delete(cellPhones)
      .where(eq(cellPhones.phoneId, id))
      .returning();

    if (!deletedCellPhone) {
      return res.status(404).json({ error: "Cell phone not found" });
    }

    res.json({
      message: "Cell phone deleted successfully",
      cellPhone: deletedCellPhone,
    });
  } catch (err) {
    console.error("Error deleting cell phone:", err);
    res.status(500).json({ error: "Failed to delete cell phone" });
  }
};
