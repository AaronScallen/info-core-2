-- Export script for PostgreSQL to Neon DB migration
-- This script exports all data from your current database

-- Start transaction
BEGIN;

    -- Export Users
    COPY
    (SELECT *
    FROM users
    ORDER BY id
    ) TO STDOUT
    WITH
    (FORMAT CSV, HEADER);

-- Export Assignments
COPY
(SELECT *
FROM assignments
ORDER BY assignment_id
) TO STDOUT
WITH
(FORMAT CSV, HEADER);

-- Export Bodycams
COPY
(SELECT *
FROM bodycams
ORDER BY bwc_id
) TO STDOUT
WITH
(FORMAT CSV, HEADER);

-- Export Police Vehicles
COPY
(SELECT *
FROM police_vehicles
ORDER BY veh_id
) TO STDOUT
WITH
(FORMAT CSV, HEADER);

-- Export Cell Phones
COPY
(SELECT *
FROM cell_phones
ORDER BY phone_id
) TO STDOUT
WITH
(FORMAT CSV, HEADER);

-- Export Employees
COPY
(SELECT *
FROM employees
ORDER BY enumber
) TO STDOUT
WITH
(FORMAT CSV, HEADER);

-- Export Absences
COPY
(SELECT *
FROM absences
ORDER BY absence_id
) TO STDOUT
WITH
(FORMAT CSV, HEADER);

COMMIT;
