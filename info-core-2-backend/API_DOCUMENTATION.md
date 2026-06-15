# API Routes Documentation

Base URL: `http://localhost:3001/api`

## Authentication Routes

### Register

- **POST** `/auth/register`
- **Body**:
  ```json
  {
    "username": "string (min 3 chars)",
    "password": "string (min 6 chars)",
    "role": "dispatch | officer | supervisor | command_staff (optional)",
    "employeeId": "number (optional)"
  }
  ```

### Login

- **POST** `/auth/login`
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "JWT token",
    "user": { "id": 1, "username": "...", "role": "..." }
  }
  ```

---

## Protected Routes

All routes below require authentication header: `Authorization: Bearer <token>`

## Employees

### Get All Employees

- **GET** `/employees`
- **Auth**: supervisor, command_staff
- **Response**: Array of employee objects

### Get Employee by ID

- **GET** `/employees/:id`
- **Auth**: supervisor, command_staff
- **Response**: Single employee object

### Create Employee

- **POST** `/employees`
- **Auth**: command_staff
- **Body**:
  ```json
  {
    "enumber": 56277,
    "badge": 1234,
    "positionNumber": 5678,
    "pid": 9012,
    "dob": "1990-01-01",
    "lastName": "Doe",
    "firstName": "John",
    "assignmentId": 515,
    "bwcId": 17916,
    "vehId": 805009,
    "cellphoneId": 1
  }
  ```

### Update Employee

- **PUT/PATCH** `/employees/:id`
- **Auth**: supervisor, command_staff
- **Body**: Partial employee object

### Delete Employee

- **DELETE** `/employees/:id`
- **Auth**: command_staff

---

## Assignments

### Get All Assignments

- **GET** `/assignments`
- **Auth**: officer, dispatch, supervisor, command_staff
- **Response**: Array of assignment objects

### Get Assignment by ID

- **GET** `/assignments/:id`
- **Auth**: officer, dispatch, supervisor, command_staff

### Create Assignment

- **POST** `/assignments`
- **Auth**: supervisor, command_staff
- **Body**:
  ```json
  {
    "assnId": 515,
    "locationName": "District 1"
  }
  ```

### Update Assignment

- **PUT/PATCH** `/assignments/:id`
- **Auth**: supervisor, command_staff
- **Body**: Partial assignment object

### Delete Assignment

- **DELETE** `/assignments/:id`
- **Auth**: command_staff

---

## Bodycams

### Get All Bodycams

- **GET** `/bodycams`
- **Auth**: officer, dispatch, supervisor, command_staff

### Get Bodycam by ID

- **GET** `/bodycams/:id`
- **Auth**: officer, dispatch, supervisor, command_staff

### Create Bodycam

- **POST** `/bodycams`
- **Auth**: supervisor, command_staff
- **Body**:
  ```json
  {
    "bwcId": 17916,
    "device": "Axon Body 3",
    "locator": "A-123",
    "model": "Body 3",
    "wifiMacAddress": "00:11:22:33:44:55"
  }
  ```

### Update Bodycam

- **PUT/PATCH** `/bodycams/:id`
- **Auth**: supervisor, command_staff

### Delete Bodycam

- **DELETE** `/bodycams/:id`
- **Auth**: command_staff

---

## Police Vehicles

### Get All Vehicles

- **GET** `/vehicles`
- **Auth**: officer, dispatch, supervisor, command_staff

### Get Vehicle by ID

- **GET** `/vehicles/:id`
- **Auth**: officer, dispatch, supervisor, command_staff

### Create Vehicle

- **POST** `/vehicles`
- **Auth**: command_staff
- **Body**:
  ```json
  {
    "vehId": 805009,
    "unitNumber": 123,
    "color": "Black/White",
    "year": 2023,
    "make": "Ford",
    "model": "Explorer",
    "decals": true,
    "vin": "1FMCU9GD7KUA12345",
    "lpNumber": "ABC123"
  }
  ```

### Update Vehicle

- **PUT/PATCH** `/vehicles/:id`
- **Auth**: supervisor, command_staff

### Delete Vehicle

- **DELETE** `/vehicles/:id`
- **Auth**: command_staff

---

## Cell Phones

### Get All Cell Phones

- **GET** `/cellphones`
- **Auth**: officer, dispatch, supervisor, command_staff

### Get Cell Phone by ID

- **GET** `/cellphones/:id`
- **Auth**: officer, dispatch, supervisor, command_staff

### Create Cell Phone

- **POST** `/cellphones`
- **Auth**: supervisor, command_staff
- **Body**:
  ```json
  {
    "idShort": 123,
    "phoneNum": "555-1234",
    "make": "Apple",
    "model": "iPhone 14"
  }
  ```

### Update Cell Phone

- **PUT/PATCH** `/cellphones/:id`
- **Auth**: supervisor, command_staff

### Delete Cell Phone

- **DELETE** `/cellphones/:id`
- **Auth**: command_staff

---

## Absences

### Get All Absences

- **GET** `/absences`
- **Auth**: officer, dispatch, supervisor, command_staff

### Get Absence by ID

- **GET** `/absences/:id`
- **Auth**: officer, dispatch, supervisor, command_staff

### Create Absence

- **POST** `/absences`
- **Auth**: dispatch, supervisor, command_staff
- **Body**:
  ```json
  {
    "enumber": 56277,
    "assignment": "District 1",
    "coveringEmpId": 12345,
    "dateOfEntry": "2025-12-17T10:00:00Z",
    "notes": "Sick leave"
  }
  ```

### Update Absence

- **PUT/PATCH** `/absences/:id`
- **Auth**: dispatch, supervisor, command_staff

### Delete Absence

- **DELETE** `/absences/:id`
- **Auth**: supervisor, command_staff

---

## Users

### Get All Users

- **GET** `/users`
- **Auth**: command_staff

### Get User by ID

- **GET** `/users/:id`
- **Auth**: command_staff

### Update User

- **PUT/PATCH** `/users/:id`
- **Auth**: command_staff
- **Body**:
  ```json
  {
    "username": "newusername",
    "password": "newpassword",
    "role": "supervisor",
    "employeeId": 56277
  }
  ```

### Delete User

- **DELETE** `/users/:id`
- **Auth**: command_staff

---

## Role-Based Access Control

| Role              | Permissions                                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **officer**       | Read: vehicles, assignments, bodycams, cellphones, absences                                                                |
| **dispatch**      | Read: all resources<br>Create/Update: absences                                                                             |
| **supervisor**    | Read: all resources<br>Create/Update: assignments, bodycams, vehicles, cellphones, absences, employees<br>Delete: absences |
| **command_staff** | Full access to all resources                                                                                               |

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid input or validation error
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error
