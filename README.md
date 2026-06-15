# Info Core 2

Info Core 2 is a full-stack law enforcement resource management application with:

- A Next.js frontend (App Router + TypeScript)
- An Express + TypeScript backend API
- PostgreSQL/Neon database access via Drizzle ORM
- JWT authentication and role-based access control

## Repository Layout

```text
info-core-2/
├── info-core-front/        # Next.js frontend
└── info-core-2-backend/    # Express API + Drizzle + scripts
```

## Core Features

- Authentication (register/login with JWT)
- Role-aware access control (officer, dispatch, supervisor, command_staff)
- CRUD modules for:
  - Employees
  - Assignments
  - Bodycams
  - Vehicles
  - Cell Phones
  - Absences
  - Users
- Active alerts workflows
- Data migration/export utilities for Neon/PostgreSQL

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

### Backend

- Node.js + Express 5
- TypeScript
- Drizzle ORM + drizzle-kit
- PostgreSQL / Neon
- JWT + bcrypt

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL (local) or a Neon database

## Quick Start

### 1. Install dependencies

Install frontend and backend dependencies separately:

```bash
cd info-core-2-backend
npm install

cd ../info-core-front
npm install
```

### 2. Configure backend environment

In info-core-2-backend, copy .env.example to .env and set values:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
JWT_SECRET=replace_with_secure_random_value
FRONTEND_URL=http://localhost:3000
```

### 3. Push database schema

```bash
cd info-core-2-backend
npm run db:push
```

### 4. Start backend

```bash
cd info-core-2-backend
npm run dev
```

Backend runs on:

- http://localhost:3001
- API base: http://localhost:3001/api

### 5. Start frontend

In a second terminal:

```bash
cd info-core-front
npm run dev
```

Frontend runs on:

- http://localhost:3000

## Important Local Dev Note

The frontend currently calls the backend using hardcoded URLs at http://localhost:3001 in multiple pages. Run both apps on their default local ports unless you update those fetch URLs.

## Backend Scripts

From info-core-2-backend:

- npm run dev: Start backend in watch mode
- npm run build: Compile TypeScript
- npm run start: Run compiled server
- npm run db:push: Push Drizzle schema
- npm run db:studio: Open Drizzle Studio
- npm run export:data: Export data for migration
- npm run import:data: Import data into target database
- npm run reset:neon: Reset Neon-side data/state script
- npm run seed:demo-users: Seed demo login accounts
- npm run db:add-indexes: Add database indexes

## Frontend Scripts

From info-core-front:

- npm run dev: Start Next.js dev server
- npm run build: Build production bundle
- npm run start: Start production server
- npm run lint: Run ESLint

## Authentication and Roles

Primary roles:

- officer
- dispatch
- supervisor
- command_staff

Protected API routes require:

```http
Authorization: Bearer <token>
```

## API and Additional Docs

Backend docs are in info-core-2-backend:

- API_DOCUMENTATION.md: Endpoint reference
- CRUD_ROUTES_README.md: CRUD implementation and usage
- NEON_MIGRATION_GUIDE.md: Neon migration workflow
- test-requests.http / test.http: Request samples for API testing

## Troubleshooting

- If demo login returns invalid credentials, run:

```bash
cd info-core-2-backend
npm run seed:demo-users
```

- If the backend cannot connect to the database, verify DATABASE_URL and that your database is reachable.
- If CORS issues appear, confirm FRONTEND_URL matches your frontend origin.

## Deployment Notes

- Backend is configured for environment-based port and DB configuration.
- For production, set a strong JWT_SECRET and production-grade DATABASE_URL.
- If you move frontend/backend origins, update CORS and frontend API URLs accordingly.

## License

No license file is currently defined in this repository. Add one before public distribution.
