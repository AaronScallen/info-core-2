-- Dummy Data for InfoCore Database
-- Insert 5 rows for each table (excluding users table)

-- =============================================================================
-- ASSIGNMENTS
-- =============================================================================
INSERT INTO assignments
    (assn_id, location_name)
VALUES
    (515, 'District 1 - Downtown Patrol'),
    (516, 'District 2 - North Side'),
    (517, 'District 3 - East Side'),
    (518, 'Traffic Division'),
    (519, 'K-9 Unit');

-- =============================================================================
-- BODYCAMS
-- =============================================================================
INSERT INTO bodycams
    (bwc_id, device, locator, model, wifi_mac_address)
VALUES
    (17916, 'BWC-001', 'Locker 12A', 'Axon Body 3', '00:1A:2B:3C:4D:5E'),
    (17917, 'BWC-002', 'Locker 12B', 'Axon Body 3', '00:1A:2B:3C:4D:5F'),
    (17918, 'BWC-003', 'Locker 15A', 'Axon Body 2', '00:1A:2B:3C:4D:60'),
    (17919, 'BWC-004', 'Locker 15B', 'Axon Body 3', '00:1A:2B:3C:4D:61'),
    (17920, 'BWC-005', 'Locker 18C', 'Axon Body 2', '00:1A:2B:3C:4D:62');

-- =============================================================================
-- POLICE VEHICLES
-- =============================================================================
INSERT INTO police_vehicles
    (veh_id, unit_number, color, year, make, model, decals, vin, lp_number)
VALUES
    (805009, 101, 'White', 2023, 'Ford', 'Explorer', true, '1FMCU9GD2PUA12345', 'POL101'),
    (805010, 102, 'Black', 2022, 'Chevrolet', 'Tahoe', true, '1GNSCCKC6NR123456', 'POL102'),
    (805011, 103, 'White', 2023, 'Dodge', 'Charger', true, '2C3CDXHG8LH234567', 'POL103'),
    (805012, 104, 'Black', 2021, 'Ford', 'F-150', false, '1FTEW1E50MFA34567', 'POL104'),
    (805013, 105, 'White', 2024, 'Ford', 'Explorer', true, '1FMCU9GD2RUA45678', 'POL105');

-- =============================================================================
-- CELL PHONES
-- =============================================================================
INSERT INTO cell_phones
    (id_short, phone_num, make, model)
VALUES
    (1001, '555-0101', 'Apple', 'iPhone 14 Pro'),
    (1002, '555-0102', 'Apple', 'iPhone 13'),
    (1003, '555-0103', 'Samsung', 'Galaxy S23'),
    (1004, '555-0104', 'Apple', 'iPhone 14'),
    (1005, '555-0105', 'Samsung', 'Galaxy S22');

-- =============================================================================
-- EMPLOYEES
-- =============================================================================
INSERT INTO employees
    (enumber, badge, position_number, pid, dob, last_name, first_name, assignment_id, bwc_id, veh_id, cellphone_id)
VALUES
    (56277, 1234, 1001, 10001, '1990-05-15', 'Johnson', 'Michael', 515, 17916, 805009, 1),
    (56278, 1235, 1002, 10002, '1988-08-22', 'Williams', 'Sarah', 516, 17917, 805010, 2),
    (56279, 1236, 1003, 10003, '1992-03-10', 'Martinez', 'Carlos', 517, 17918, 805011, 3),
    (56280, 1237, 1004, 10004, '1985-11-30', 'Davis', 'Jennifer', 518, 17919, 805012, 4),
    (56281, 1238, 1005, 10005, '1995-07-18', 'Anderson', 'Robert', 519, 17920, 805013, 5);

-- =============================================================================
-- ABSENCES
-- =============================================================================
INSERT INTO absences
    (enumber, assignment, covering_emp_id, date_of_entry, notes)
VALUES
    (56277, 'District 1 - Downtown Patrol', 56278, '2025-12-10 08:00:00', 'Vacation - Hawaii'),
    (56278, 'District 2 - North Side', 56279, '2025-11-15 09:30:00', 'Sick Leave - Flu'),
    (56279, 'District 3 - East Side', 56280, '2025-12-01 10:00:00', 'Personal Day'),
    (56280, 'Traffic Division', 56281, '2025-11-20 07:45:00', 'Training - Advanced Driving Course'),
    (56281, 'K-9 Unit', 56277, '2025-12-05 08:15:00', 'Bereavement Leave');
