import { Request, Response } from "express";
import { db } from "../db";
import { assignments } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const assignmentSchema = z.object({
  assnId: z.number(),
  locationName: z.string().max(255).optional().nullable(),
});

const assignmentUpdateSchema = assignmentSchema
  .partial()
  .omit({ assnId: true });

// GET all assignments
export const getAllAssignments = async (req: Request, res: Response) => {
  try {
    const allAssignments = await db.select().from(assignments);
    res.json(allAssignments);
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
};

// GET single assignment by ID
export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid assignment ID" });
    }

    const [assignment] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.assignmentId, id));

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json(assignment);
  } catch (err) {
    console.error("Error fetching assignment:", err);
    res.status(500).json({ error: "Failed to fetch assignment" });
  }
};

// POST create new assignment
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const validatedData = assignmentSchema.parse(req.body);

    const [newAssignment] = await db
      .insert(assignments)
      .values(validatedData)
      .returning();

    res.status(201).json(newAssignment);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error creating assignment:", err);
    res.status(500).json({ error: "Failed to create assignment" });
  }
};

// PUT/PATCH update assignment
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid assignment ID" });
    }

    const validatedData = assignmentUpdateSchema.parse(req.body);

    const [updatedAssignment] = await db
      .update(assignments)
      .set(validatedData)
      .where(eq(assignments.assignmentId, id))
      .returning();

    if (!updatedAssignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json(updatedAssignment);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.issues });
    }
    console.error("Error updating assignment:", err);
    res.status(500).json({ error: "Failed to update assignment" });
  }
};

// DELETE assignment
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid assignment ID" });
    }

    const [deletedAssignment] = await db
      .delete(assignments)
      .where(eq(assignments.assignmentId, id))
      .returning();

    if (!deletedAssignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json({
      message: "Assignment deleted successfully",
      assignment: deletedAssignment,
    });
  } catch (err) {
    console.error("Error deleting assignment:", err);
    res.status(500).json({ error: "Failed to delete assignment" });
  }
};
