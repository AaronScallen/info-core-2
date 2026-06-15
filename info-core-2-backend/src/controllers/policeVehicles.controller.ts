import { Request, Response } from "express";
import { db } from "../db";
import { policeVehicles, employees } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const policeVehicleSchema = z.object({
  vehId: z.number(),
  unitNumber: z.number().optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  year: z.number().optional().nullable(),
  make: z.string().max(50).optional().nullable(),
  model: z.string().max(50).optional().nullable(),
  decals: z.boolean().optional().nullable(),
  vin: z.string().max(100).optional().nullable(),
  lpNumber: z.string().max(20).optional().nullable(),
});

const policeVehicleUpdateSchema = policeVehicleSchema
  .partial()
  .omit({ vehId: true });

// GET all police vehicles
export const getAllPoliceVehicles = async (req: Request, res: Response) => {
  try {
    const allVehicles = await db
      .selectDistinctOn([policeVehicles.vehId], {
        vehId: policeVehicles.vehId,
        unitNumber: policeVehicles.unitNumber,
        color: policeVehicles.color,
        year: policeVehicles.year,
        make: policeVehicles.make,
        model: policeVehicles.model,
        decals: policeVehicles.decals,
        vin: policeVehicles.vin,
        lpNumber: policeVehicles.lpNumber,
        assignedToBadge: employees.badge,
      })
      .from(policeVehicles)
      .leftJoin(employees, eq(policeVehicles.vehId, employees.vehId));
    res.json(allVehicles);
  } catch (err) {
    console.error("Error fetching police vehicles:", err);
    res.status(500).json({ error: "Failed to fetch police vehicles" });
  }
};

// GET single police vehicle by ID
export const getPoliceVehicleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid vehicle ID" });
    }

    const [vehicle] = await db
      .select()
      .from(policeVehicles)
      .where(eq(policeVehicles.vehId, id));

    if (!vehicle) {
      return res.status(404).json({ error: "Police vehicle not found" });
    }

    res.json(vehicle);
  } catch (err) {
    console.error("Error fetching police vehicle:", err);
    res.status(500).json({ error: "Failed to fetch police vehicle" });
  }
};

// POST create new police vehicle
export const createPoliceVehicle = async (req: Request, res: Response) => {
  try {
    const validatedData = policeVehicleSchema.parse(req.body);

    const [newVehicle] = await db
      .insert(policeVehicles)
      .values(validatedData)
      .returning();

    res.status(201).json(newVehicle);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error creating police vehicle:", err);
    res.status(500).json({ error: "Failed to create police vehicle" });
  }
};

// PUT/PATCH update police vehicle
export const updatePoliceVehicle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid vehicle ID" });
    }

    const validatedData = policeVehicleUpdateSchema.parse(req.body);

    const [updatedVehicle] = await db
      .update(policeVehicles)
      .set(validatedData)
      .where(eq(policeVehicles.vehId, id))
      .returning();

    if (!updatedVehicle) {
      return res.status(404).json({ error: "Police vehicle not found" });
    }

    res.json(updatedVehicle);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error updating police vehicle:", err);
    res.status(500).json({ error: "Failed to update police vehicle" });
  }
};

// DELETE police vehicle
export const deletePoliceVehicle = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid vehicle ID" });
    }

    const [deletedVehicle] = await db
      .delete(policeVehicles)
      .where(eq(policeVehicles.vehId, id))
      .returning();

    if (!deletedVehicle) {
      return res.status(404).json({ error: "Police vehicle not found" });
    }

    res.json({
      message: "Police vehicle deleted successfully",
      vehicle: deletedVehicle,
    });
  } catch (err) {
    console.error("Error deleting police vehicle:", err);
    res.status(500).json({ error: "Failed to delete police vehicle" });
  }
};
