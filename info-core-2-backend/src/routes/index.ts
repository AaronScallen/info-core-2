import { Router } from "express";
import {
  authenticateToken,
  authorizeRole,
} from "../middleware/auth.middleware";
import {
  cacheMiddleware,
  invalidateCacheMiddleware,
} from "../middleware/cache.middleware";

// Import all controllers
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkCreateEmployees,
} from "../controllers/employees.controller";

import {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignments.controller";

import {
  getAllBodycams,
  getBodycamById,
  createBodycam,
  updateBodycam,
  deleteBodycam,
} from "../controllers/bodycams.controller";

import {
  getAllPoliceVehicles,
  getPoliceVehicleById,
  createPoliceVehicle,
  updatePoliceVehicle,
  deletePoliceVehicle,
} from "../controllers/policeVehicles.controller";

import {
  getAllCellPhones,
  getCellPhoneById,
  createCellPhone,
  updateCellPhone,
  deleteCellPhone,
} from "../controllers/cellPhones.controller";

import {
  getAllAbsences,
  getAbsenceById,
  createAbsence,
  updateAbsence,
  deleteAbsence,
} from "../controllers/absences.controller";

import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/users.controller";

import {
  getAllShiftRosters,
  getShiftRosterById,
  getShiftRostersByDate,
  getShiftRostersByDateRange,
  getPatrolOfficers,
  getPatrolSupervisors,
  createShiftRoster,
  updateShiftRoster,
  deleteShiftRoster,
} from "../controllers/shiftRoster.controller";

import {
  getActiveAlert,
  getAllAlerts,
  createAlert,
  cancelAlert,
} from "../controllers/alerts.controller";

const router = Router();

// -----------------------------------------------------------------------------
// EMPLOYEES ROUTES
// -----------------------------------------------------------------------------
router.get(
  "/employees",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  cacheMiddleware(300), // Cache for 5 minutes
  getAllEmployees,
);

router.get(
  "/employees/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  cacheMiddleware(600), // Cache for 10 minutes
  getEmployeeById,
);

router.post(
  "/employees",
  authenticateToken,
  authorizeRole(["command_staff"]),
  invalidateCacheMiddleware("employees"),
  createEmployee,
);

router.post(
  "/employees/bulk",
  authenticateToken,
  authorizeRole(["command_staff"]),
  invalidateCacheMiddleware("employees"),
  bulkCreateEmployees,
);

router.put(
  "/employees/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  invalidateCacheMiddleware("employees"),
  updateEmployee,
);

router.patch(
  "/employees/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  invalidateCacheMiddleware("employees"),
  updateEmployee,
);

router.delete(
  "/employees/:id",
  authenticateToken,
  authorizeRole(["command_staff"]),
  invalidateCacheMiddleware("employees"),
  deleteEmployee,
);

// -----------------------------------------------------------------------------
// ASSIGNMENTS ROUTES
// -----------------------------------------------------------------------------
router.get(
  "/assignments",
  authenticateToken,
  authorizeRole(["officer", "dispatch", "supervisor", "command_staff"]),
  getAllAssignments,
);

router.get(
  "/assignments/:id",
  authenticateToken,
  authorizeRole(["officer", "dispatch", "supervisor", "command_staff"]),
  getAssignmentById,
);

router.post(
  "/assignments",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  createAssignment,
);

router.put(
  "/assignments/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  updateAssignment,
);

router.patch(
  "/assignments/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  updateAssignment,
);

router.delete(
  "/assignments/:id",
  authenticateToken,
  authorizeRole(["command_staff"]),
  deleteAssignment,
);

// -----------------------------------------------------------------------------
// BODYCAMS ROUTES
// -----------------------------------------------------------------------------
router.get(
  "/bodycams",
  authenticateToken,
  authorizeRole(["officer", "dispatch", "supervisor", "command_staff"]),
  getAllBodycams,
);

router.get(
  "/bodycams/:id",
  authenticateToken,
  authorizeRole(["officer", "dispatch", "supervisor", "command_staff"]),
  getBodycamById,
);

router.post(
  "/bodycams",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  createBodycam,
);

router.put(
  "/bodycams/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  updateBodycam,
);

router.patch(
  "/bodycams/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  updateBodycam,
);

router.delete(
  "/bodycams/:id",
  authenticateToken,
  authorizeRole(["command_staff"]),
  deleteBodycam,
);

// -----------------------------------------------------------------------------
// POLICE VEHICLES ROUTES
// -----------------------------------------------------------------------------
router.get(
  "/vehicles",
  authenticateToken,
  authorizeRole(["officer", "dispatch", "supervisor", "command_staff"]),
  getAllPoliceVehicles,
);

router.get(
  "/vehicles/:id",
  authenticateToken,
  authorizeRole(["officer", "dispatch", "supervisor", "command_staff"]),
  getPoliceVehicleById,
);

router.post(
  "/vehicles",
  authenticateToken,
  authorizeRole(["command_staff"]),
  createPoliceVehicle,
);

router.put(
  "/vehicles/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  updatePoliceVehicle,
);

router.patch(
  "/vehicles/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  updatePoliceVehicle,
);

router.delete(
  "/vehicles/:id",
  authenticateToken,
  authorizeRole(["command_staff"]),
  deletePoliceVehicle,
);

// -----------------------------------------------------------------------------
// CELL PHONES ROUTES
// -----------------------------------------------------------------------------
router.get(
  "/cellphones",
  authenticateToken,
  authorizeRole(["officer", "dispatch", "supervisor", "command_staff"]),
  getAllCellPhones,
);

router.get(
  "/cellphones/:id",
  authenticateToken,
  authorizeRole(["officer", "dispatch", "supervisor", "command_staff"]),
  getCellPhoneById,
);

router.post(
  "/cellphones",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  createCellPhone,
);

router.put(
  "/cellphones/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  updateCellPhone,
);

router.patch(
  "/cellphones/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  updateCellPhone,
);

router.delete(
  "/cellphones/:id",
  authenticateToken,
  authorizeRole(["command_staff"]),
  deleteCellPhone,
);

// -----------------------------------------------------------------------------
// ABSENCES ROUTES
// -----------------------------------------------------------------------------
router.get(
  "/absences",
  authenticateToken,
  authorizeRole(["officer", "dispatch", "supervisor", "command_staff"]),
  getAllAbsences,
);

router.get(
  "/absences/:id",
  authenticateToken,
  authorizeRole(["officer", "dispatch", "supervisor", "command_staff"]),
  getAbsenceById,
);

router.post(
  "/absences",
  authenticateToken,
  authorizeRole(["dispatch", "supervisor", "command_staff"]),
  createAbsence,
);

router.put(
  "/absences/:id",
  authenticateToken,
  authorizeRole(["dispatch", "supervisor", "command_staff"]),
  updateAbsence,
);

router.patch(
  "/absences/:id",
  authenticateToken,
  authorizeRole(["dispatch", "supervisor", "command_staff"]),
  updateAbsence,
);

router.delete(
  "/absences/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  deleteAbsence,
);

// -----------------------------------------------------------------------------
// USERS ROUTES
// -----------------------------------------------------------------------------
router.get(
  "/users",
  authenticateToken,
  authorizeRole(["command_staff"]),
  getAllUsers,
);

router.get(
  "/users/:id",
  authenticateToken,
  authorizeRole(["command_staff"]),
  getUserById,
);

router.put(
  "/users/:id",
  authenticateToken,
  authorizeRole(["command_staff"]),
  updateUser,
);

router.patch(
  "/users/:id",
  authenticateToken,
  authorizeRole(["command_staff"]),
  updateUser,
);

router.delete(
  "/users/:id",
  authenticateToken,
  authorizeRole(["command_staff"]),
  deleteUser,
);

// -----------------------------------------------------------------------------
// SHIFT ROSTER ROUTES
// -----------------------------------------------------------------------------

// Get patrol officers (for roster creation)
router.get(
  "/shift-roster/patrol-officers",
  authenticateToken,
  authorizeRole(["officer", "supervisor", "command_staff"]),
  getPatrolOfficers,
);

// Get patrol supervisors
router.get(
  "/shift-roster/supervisors",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  getPatrolSupervisors,
);

// Get all shift rosters with optional filters
router.get(
  "/shift-roster",
  authenticateToken,
  authorizeRole(["officer", "supervisor", "command_staff"]),
  getAllShiftRosters,
);

// Get rosters by specific date
router.get(
  "/shift-roster/date/:date",
  authenticateToken,
  authorizeRole(["officer", "supervisor", "command_staff"]),
  getShiftRostersByDate,
);

// Get rosters by date range (for week/month view)
router.get(
  "/shift-roster/range",
  authenticateToken,
  authorizeRole(["officer", "supervisor", "command_staff"]),
  getShiftRostersByDateRange,
);

// Get single shift roster by ID
router.get(
  "/shift-roster/:id",
  authenticateToken,
  authorizeRole(["officer", "supervisor", "command_staff"]),
  getShiftRosterById,
);

// Create new shift roster entry (supervisors only)
router.post(
  "/shift-roster",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  createShiftRoster,
);

// Update shift roster entry (supervisors only)
router.put(
  "/shift-roster/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  updateShiftRoster,
);

router.patch(
  "/shift-roster/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  updateShiftRoster,
);

// Delete shift roster entry (supervisors only)
router.delete(
  "/shift-roster/:id",
  authenticateToken,
  authorizeRole(["supervisor", "command_staff"]),
  deleteShiftRoster,
);

// -----------------------------------------------------------------------------
// EMERGENCY ALERTS ROUTES
// -----------------------------------------------------------------------------

// Active alert — accessible to all authenticated users (used by the banner)
router.get("/alerts/active", authenticateToken, getActiveAlert);

// Alert history — command_staff and dispatch only
router.get(
  "/alerts",
  authenticateToken,
  authorizeRole(["command_staff", "dispatch"]),
  getAllAlerts,
);

// Trigger a new alert — command_staff and dispatch only
router.post(
  "/alerts",
  authenticateToken,
  authorizeRole(["command_staff", "dispatch"]),
  createAlert,
);

// Cancel an alert — command_staff and dispatch only
router.put(
  "/alerts/:id/cancel",
  authenticateToken,
  authorizeRole(["command_staff", "dispatch"]),
  cancelAlert,
);

export default router;
