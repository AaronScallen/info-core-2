-- Performance Optimization Indexes
-- Run this migration to add indexes for frequently queried columns
-- This will significantly speed up queries and reduce database costs

-- Employees table indexes
CREATE INDEX
IF NOT EXISTS idx_employees_badge ON employees
(badge);
CREATE INDEX
IF NOT EXISTS idx_employees_position_number ON employees
(position_number);
CREATE INDEX
IF NOT EXISTS idx_employees_last_name ON employees
(last_name);
CREATE INDEX
IF NOT EXISTS idx_employees_assignment_id ON employees
(assignment_id);

-- Shift roster indexes (most frequently queried)
CREATE INDEX
IF NOT EXISTS idx_shift_roster_date ON shift_roster
(roster_date);
CREATE INDEX
IF NOT EXISTS idx_shift_roster_shift ON shift_roster
(shift);
CREATE INDEX
IF NOT EXISTS idx_shift_roster_enumber ON shift_roster
(enumber);
CREATE INDEX
IF NOT EXISTS idx_shift_roster_supervisor ON shift_roster
(supervisor_enumber);
CREATE INDEX
IF NOT EXISTS idx_shift_roster_vehicle ON shift_roster
(vehicle_assigned);

-- Composite index for common query pattern (shift + date)
CREATE INDEX
IF NOT EXISTS idx_shift_roster_shift_date ON shift_roster
(shift, roster_date);

-- Absences indexes
CREATE INDEX
IF NOT EXISTS idx_absences_enumber ON absences
(enumber);
CREATE INDEX
IF NOT EXISTS idx_absences_date_of_entry ON absences
(date_of_entry);
CREATE INDEX
IF NOT EXISTS idx_absences_covering_emp ON absences
(covering_emp_id);

-- Users indexes
CREATE INDEX
IF NOT EXISTS idx_users_username ON users
(username);
CREATE INDEX
IF NOT EXISTS idx_users_employee_id ON users
(employee_id);

-- Assignments indexes
CREATE INDEX
IF NOT EXISTS idx_assignments_assn_id ON assignments
(assn_id);

-- Police Vehicles indexes
CREATE INDEX
IF NOT EXISTS idx_vehicles_unit_number ON police_vehicles
(unit_number);
CREATE INDEX
IF NOT EXISTS idx_vehicles_lp_number ON police_vehicles
(lp_number);

-- Cell Phones indexes
CREATE INDEX
IF NOT EXISTS idx_cellphones_id_short ON cell_phones
(id_short);
CREATE INDEX
IF NOT EXISTS idx_cellphones_phone_num ON cell_phones
(phone_num);

-- Bodycams indexes already have primary key (bwc_id), which is automatically indexed

-- Performance hint: VACUUM ANALYZE to update statistics
VACUUM ANALYZE employees;
VACUUM ANALYZE shift_roster;
VACUUM ANALYZE absences;
VACUUM ANALYZE users;
VACUUM ANALYZE assignments;
VACUUM ANALYZE police_vehicles;
VACUUM ANALYZE cell_phones;
VACUUM ANALYZE bodycams;
