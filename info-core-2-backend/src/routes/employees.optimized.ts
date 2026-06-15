import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  cacheMiddleware,
  invalidateCacheMiddleware,
} from "../middleware/cache.middleware";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkCreateEmployees,
} from "../controllers/employees.controller";

const router = Router();

/**
 * OPTIMIZED ROUTES WITH CACHING
 *
 * GET requests are cached for 5 minutes (300 seconds)
 * POST/PUT/DELETE requests invalidate the cache
 */

// GET all employees - CACHED for 5 minutes
router.get(
  "/",
  authenticate,
  cacheMiddleware(300), // Cache for 5 minutes
  getAllEmployees,
);

// GET single employee - CACHED for 10 minutes
router.get(
  "/:id",
  authenticate,
  cacheMiddleware(600), // Cache for 10 minutes (details change less often)
  getEmployeeById,
);

// POST create employee - INVALIDATES cache
router.post(
  "/",
  authenticate,
  invalidateCacheMiddleware("employees"), // Invalidate all employee caches
  createEmployee,
);

// POST bulk create employees - INVALIDATES cache
router.post(
  "/bulk",
  authenticate,
  invalidateCacheMiddleware("employees"),
  bulkCreateEmployees,
);

// PATCH update employee - INVALIDATES cache
router.patch(
  "/:id",
  authenticate,
  invalidateCacheMiddleware("employees"),
  updateEmployee,
);

// DELETE employee - INVALIDATES cache
router.delete(
  "/:id",
  authenticate,
  invalidateCacheMiddleware("employees"),
  deleteEmployee,
);

export default router;
