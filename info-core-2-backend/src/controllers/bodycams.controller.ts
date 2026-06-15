import { Request, Response } from "express";
import { db } from "../db";
import { bodycams, employees } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const bodycamSchema = z.object({
  bwcId: z.number(),
  device: z.string().max(100).optional().nullable(),
  locator: z.string().max(100).optional().nullable(),
  model: z.string().max(100).optional().nullable(),
  wifiMacAddress: z.string().max(50).optional().nullable(),
});

const bodycamUpdateSchema = bodycamSchema.partial().omit({ bwcId: true });

// GET all bodycams
export const getAllBodycams = async (req: Request, res: Response) => {
  try {
    const allBodycams = await db
      .selectDistinctOn([bodycams.bwcId], {
        bwcId: bodycams.bwcId,
        device: bodycams.device,
        locator: bodycams.locator,
        model: bodycams.model,
        wifiMacAddress: bodycams.wifiMacAddress,
        assignedToBadge: employees.badge,
      })
      .from(bodycams)
      .leftJoin(employees, eq(bodycams.bwcId, employees.bwcId));
    res.json(allBodycams);
  } catch (err) {
    console.error("Error fetching bodycams:", err);
    res.status(500).json({ error: "Failed to fetch bodycams" });
  }
};

// GET single bodycam by ID
export const getBodycamById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid bodycam ID" });
    }

    const [bodycam] = await db
      .select()
      .from(bodycams)
      .where(eq(bodycams.bwcId, id));

    if (!bodycam) {
      return res.status(404).json({ error: "Bodycam not found" });
    }

    res.json(bodycam);
  } catch (err) {
    console.error("Error fetching bodycam:", err);
    res.status(500).json({ error: "Failed to fetch bodycam" });
  }
};

// POST create new bodycam
export const createBodycam = async (req: Request, res: Response) => {
  try {
    const validatedData = bodycamSchema.parse(req.body);

    const [newBodycam] = await db
      .insert(bodycams)
      .values(validatedData)
      .returning();

    res.status(201).json(newBodycam);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error creating bodycam:", err);
    res.status(500).json({ error: "Failed to create bodycam" });
  }
};

// PUT/PATCH update bodycam
export const updateBodycam = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid bodycam ID" });
    }

    const validatedData = bodycamUpdateSchema.parse(req.body);

    const [updatedBodycam] = await db
      .update(bodycams)
      .set(validatedData)
      .where(eq(bodycams.bwcId, id))
      .returning();

    if (!updatedBodycam) {
      return res.status(404).json({ error: "Bodycam not found" });
    }

    res.json(updatedBodycam);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error updating bodycam:", err);
    res.status(500).json({ error: "Failed to update bodycam" });
  }
};

// DELETE bodycam
export const deleteBodycam = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid bodycam ID" });
    }

    const [deletedBodycam] = await db
      .delete(bodycams)
      .where(eq(bodycams.bwcId, id))
      .returning();

    if (!deletedBodycam) {
      return res.status(404).json({ error: "Bodycam not found" });
    }

    res.json({
      message: "Bodycam deleted successfully",
      bodycam: deletedBodycam,
    });
  } catch (err) {
    console.error("Error deleting bodycam:", err);
    res.status(500).json({ error: "Failed to delete bodycam" });
  }
};
