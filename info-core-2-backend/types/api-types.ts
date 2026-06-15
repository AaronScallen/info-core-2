// TypeScript types for Next.js 16 frontend
// These types match the database schema and API responses

export type Role = "dispatch" | "officer" | "supervisor" | "command_staff";

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ApiError {
  error: string;
  details?: any;
}

export interface ApiSuccess {
  message: string;
  [key: string]: any;
}

// -----------------------------------------------------------------------------
// Entity Types
// -----------------------------------------------------------------------------

export interface User {
  id: number;
  username: string;
  role: Role;
  employeeId: number | null;
  createdAt: Date | string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

export interface Assignment {
  assignmentId: number;
  assnId: number;
  locationName: string | null;
}

export interface Bodycam {
  bwcId: number;
  device: string | null;
  locator: string | null;
  model: string | null;
  wifiMacAddress: string | null;
}

export interface PoliceVehicle {
  vehId: number;
  unitNumber: number | null;
  color: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  decals: boolean | null;
  vin: string | null;
  lpNumber: string | null;
}

export interface CellPhone {
  phoneId: number;
  idShort: number | null;
  phoneNum: string | null;
  make: string | null;
  model: string | null;
}

export interface Employee {
  enumber: number;
  badge: number | null;
  positionNumber: number | null;
  pid: number | null;
  dob: string | null;
  lastName: string | null;
  firstName: string | null;
  email: string | null;
  assignmentId: number | null;
  bwcId: number | null;
  vehId: number | null;
  cellphoneId: number | null;
}

export interface Absence {
  absenceId: number;
  enumber: number | null;
  assignment: string | null;
  coveringEmpId: number | null;
  dateOfEntry: Date | string | null;
  notes: string | null;
}

export type Shift = "A-Shift" | "B-Shift" | "C-Shift";

export interface ShiftRoster {
  rosterId: number;
  shift: Shift;
  rosterDate: string;
  enumber: number;
  badgeNumber: number;
  lastName: string;
  vehicleAssigned: number | null;
  patrolZone: string | null;
  keysInVehicle: boolean;
  passAlongNotes: string | null;
  supervisorEnumber: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PatrolOfficer {
  enumber: number;
  badge: number | null;
  lastName: string | null;
  firstName: string | null;
  assignmentId: number | null;
  locationName: string | null;
}

export interface PatrolSupervisor {
  enumber: number;
  badge: number | null;
  lastName: string | null;
  firstName: string | null;
  assignmentId: number | null;
  locationName: string | null;
}

// -----------------------------------------------------------------------------
// Request Body Types (for POST/PUT/PATCH)
// -----------------------------------------------------------------------------

export interface RegisterRequest {
  username: string;
  password: string;
  role?: Role;
  employeeId?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateEmployeeRequest {
  enumber: number;
  badge?: number | null;
  positionNumber?: number | null;
  pid?: number | null;
  dob?: string | null;
  lastName?: string | null;
  firstName?: string | null;
  assignmentId?: number | null;
  bwcId?: number | null;
  vehId?: number | null;
  cellphoneId?: number | null;
}

export type UpdateEmployeeRequest = Partial<
  Omit<CreateEmployeeRequest, "enumber">
>;

export interface CreateAssignmentRequest {
  assnId: number;
  locationName?: string | null;
}

export type UpdateAssignmentRequest = Partial<
  Omit<CreateAssignmentRequest, "assnId">
>;

export interface CreateBodycamRequest {
  bwcId: number;
  device?: string | null;
  locator?: string | null;
  model?: string | null;
  wifiMacAddress?: string | null;
}

export type UpdateBodycamRequest = Partial<Omit<CreateBodycamRequest, "bwcId">>;

export interface CreatePoliceVehicleRequest {
  vehId: number;
  unitNumber?: number | null;
  color?: string | null;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  decals?: boolean | null;
  vin?: string | null;
  lpNumber?: string | null;
}

export type UpdatePoliceVehicleRequest = Partial<
  Omit<CreatePoliceVehicleRequest, "vehId">
>;

export interface CreateCellPhoneRequest {
  idShort?: number | null;
  phoneNum?: string | null;
  make?: string | null;
  model?: string | null;
}

export type UpdateCellPhoneRequest = Partial<CreateCellPhoneRequest>;

export interface CreateAbsenceRequest {
  enumber?: number | null;
  assignment?: string | null;
  coveringEmpId?: number | null;
  dateOfEntry?: string | null;
  notes?: string | null;
}

export type UpdateAbsenceRequest = Partial<CreateAbsenceRequest>;

export interface CreateShiftRosterRequest {
  shift: Shift;
  rosterDate: string;
  enumber: number;
  badgeNumber: number;
  lastName: string;
  vehicleAssigned?: number | null;
  patrolZone?: string | null;
  keysInVehicle?: boolean;
  passAlongNotes?: string | null;
  supervisorEnumber: number;
}

export type UpdateShiftRosterRequest = Partial<CreateShiftRosterRequest>;

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  role?: Role;
  employeeId?: number | null;
}

// -----------------------------------------------------------------------------
// Extended Types with Relations (for joins/populated data)
// -----------------------------------------------------------------------------

export interface EmployeeWithRelations extends Employee {
  user?: User;
  assignment?: Assignment;
  bodycam?: Bodycam;
  vehicle?: PoliceVehicle;
  cellphone?: CellPhone;
}

export interface AbsenceWithRelations extends Absence {
  employee?: Employee;
  coveringEmployee?: Employee;
}

export interface ShiftRosterWithRelations extends ShiftRoster {
  employee?: Employee;
  supervisor?: Employee;
  vehicle?: PoliceVehicle;
}
