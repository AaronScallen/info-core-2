import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  boolean,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// -----------------------------------------------------------------------------
// Enums & Auth
// -----------------------------------------------------------------------------
export const roleEnum = pgEnum("role", [
  "dispatch",
  "officer",
  "supervisor",
  "command_staff",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").default("officer").notNull(),
  employeeId: integer("employee_id").references(() => employees.enumber),
  createdAt: timestamp("created_at").defaultNow(),
});

// -----------------------------------------------------------------------------
// Application Entities
// -----------------------------------------------------------------------------

export const assignments = pgTable("assignments", {
  assignmentId: serial("assignment_id").primaryKey(), // Auto generated
  assnId: integer("assn_id").unique().notNull(), // The ID used in CSV examples (e.g., 515)
  locationName: varchar("location_name", { length: 255 }),
});

export const bodycams = pgTable("bodycams", {
  bwcId: integer("bwc_id").primaryKey(), // 17916
  device: varchar("device", { length: 100 }),
  locator: varchar("locator", { length: 100 }),
  model: varchar("model", { length: 100 }),
  wifiMacAddress: varchar("wifi_mac_address", { length: 50 }),
});

export const policeVehicles = pgTable("police_vehicles", {
  vehId: integer("veh_id").primaryKey(), // 805009
  unitNumber: integer("unit_number"),
  color: varchar("color", { length: 50 }),
  year: integer("year"),
  make: varchar("make", { length: 50 }),
  model: varchar("model", { length: 50 }),
  decals: boolean("decals").default(false),
  vin: varchar("vin", { length: 100 }),
  lpNumber: varchar("lp_number", { length: 20 }),
});

export const cellPhones = pgTable("cell_phones", {
  phoneId: serial("phone_id").primaryKey(),
  idShort: integer("id_short"),
  phoneNum: varchar("phone_num", { length: 20 }),
  make: varchar("make", { length: 50 }),
  model: varchar("model", { length: 50 }),
});

export const employees = pgTable("employees", {
  enumber: integer("enumber").primaryKey(), // 56277
  badge: integer("badge").unique(),
  positionNumber: integer("position_number").unique(),
  pid: integer("pid").unique(),
  dob: date("dob"),
  lastName: varchar("last_name", { length: 100 }),
  firstName: varchar("first_name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  photoUrl: text("photo_url"), // Store photo URL or base64 data
  // Foreign Keys
  assignmentId: integer("assignment_id").references(() => assignments.assnId),
  bwcId: integer("bwc_id").references(() => bodycams.bwcId),
  vehId: integer("veh_id").references(() => policeVehicles.vehId),
  cellphoneId: integer("cellphone_id").references(() => cellPhones.phoneId),
});

export const absences = pgTable("absences", {
  absenceId: serial("absence_id").primaryKey(),
  enumber: integer("enumber").references(() => employees.enumber),
  assignment: varchar("assignment", { length: 255 }), // Can link to assignments or be text
  coveringEmpId: integer("covering_emp_id").references(() => employees.enumber),
  dateOfEntry: timestamp("date_of_entry"),
  notes: text("notes"),
});

export const emergencyAlerts = pgTable("emergency_alerts", {
  alertId: serial("alert_id").primaryKey(),
  priority: varchar("priority", { length: 20 }).notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  location: varchar("location", { length: 255 }).notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
  cancelledAt: timestamp("cancelled_at"),
  createdBy: integer("created_by").references(() => users.id),
  cancelledBy: integer("cancelled_by").references(() => users.id),
});

export const shiftEnum = pgEnum("shift", ["A-Shift", "B-Shift", "C-Shift"]);

export const shiftRoster = pgTable("shift_roster", {
  rosterId: serial("roster_id").primaryKey(),
  shift: shiftEnum("shift").notNull(),
  rosterDate: date("roster_date").notNull(),
  enumber: integer("enumber")
    .references(() => employees.enumber)
    .notNull(),
  badgeNumber: integer("badge_number").notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  vehicleAssigned: integer("vehicle_assigned").references(
    () => policeVehicles.vehId,
  ),
  patrolZone: varchar("patrol_zone", { length: 50 }),
  keysInVehicle: boolean("keys_in_vehicle").default(false),
  passAlongNotes: text("pass_along_notes"),
  supervisorEnumber: integer("supervisor_enumber")
    .references(() => employees.enumber)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// -----------------------------------------------------------------------------
// Relations (Optional but recommended)
// -----------------------------------------------------------------------------
export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.enumber],
    references: [users.employeeId],
  }),
  assignment: one(assignments, {
    fields: [employees.assignmentId],
    references: [assignments.assnId],
  }),
  shiftRosterEntries: many(shiftRoster),
}));

export const shiftRosterRelations = relations(shiftRoster, ({ one }) => ({
  employee: one(employees, {
    fields: [shiftRoster.enumber],
    references: [employees.enumber],
  }),
  supervisor: one(employees, {
    fields: [shiftRoster.supervisorEnumber],
    references: [employees.enumber],
  }),
  vehicle: one(policeVehicles, {
    fields: [shiftRoster.vehicleAssigned],
    references: [policeVehicles.vehId],
  }),
}));
