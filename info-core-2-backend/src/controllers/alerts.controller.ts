import { Request, Response } from "express";
import { db } from "../db";
import { emergencyAlerts } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const ALLOWED_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const alertSchema = z.object({
  priority: z.enum(ALLOWED_PRIORITIES),
  location: z.string().min(1).max(255),
  description: z.string().min(1),
});

// GET active alert (all authenticated users — used by the banner)
export const getActiveAlert = async (req: Request, res: Response) => {
  try {
    const [alert] = await db
      .select()
      .from(emergencyAlerts)
      .where(eq(emergencyAlerts.isActive, true))
      .limit(1);

    res.json(alert ?? null);
  } catch (err) {
    console.error("Error fetching active alert:", err);
    res.status(500).json({ error: "Failed to fetch active alert" });
  }
};

// GET all alerts (history — command_staff and dispatch)
export const getAllAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await db
      .select()
      .from(emergencyAlerts)
      .orderBy(desc(emergencyAlerts.triggeredAt));

    res.json(alerts);
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};

// POST create/trigger new alert (command_staff and dispatch)
export const createAlert = async (req: Request, res: Response) => {
  try {
    const validatedData = alertSchema.parse(req.body);

    // Cancel any currently active alerts first
    await db
      .update(emergencyAlerts)
      .set({
        isActive: false,
        cancelledAt: new Date(),
        cancelledBy: req.user!.id,
      })
      .where(eq(emergencyAlerts.isActive, true));

    const [newAlert] = await db
      .insert(emergencyAlerts)
      .values({
        ...validatedData,
        isActive: true,
        triggeredAt: new Date(),
        createdBy: req.user!.id,
      })
      .returning();

    res.status(201).json(newAlert);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error creating alert:", err);
    res.status(500).json({ error: "Failed to create alert" });
  }
};

// PUT cancel alert (command_staff and dispatch)
export const cancelAlert = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid alert ID" });
    }

    const [existing] = await db
      .select()
      .from(emergencyAlerts)
      .where(eq(emergencyAlerts.alertId, id));

    if (!existing) {
      return res.status(404).json({ error: "Alert not found" });
    }

    if (!existing.isActive) {
      return res.status(400).json({ error: "Alert is already cancelled" });
    }

    const [updated] = await db
      .update(emergencyAlerts)
      .set({
        isActive: false,
        cancelledAt: new Date(),
        cancelledBy: req.user!.id,
      })
      .where(eq(emergencyAlerts.alertId, id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error("Error cancelling alert:", err);
    res.status(500).json({ error: "Failed to cancel alert" });
  }
};
