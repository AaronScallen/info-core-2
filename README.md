# Info Core 2

Info Core 2 is a full-stack law enforcement resource management platform built to help agencies organize personnel, track assets, manage assignments, and move quickly in operational workflows. It combines a modern web UI, a structured API, and a PostgreSQL/Neon-backed data layer into a single product that is ready to demo, pilot, or showcase.

## What It Can Do

Info Core 2 is designed around day-to-day operational visibility and administrative control:

- Secure login with JWT-based authentication
- Role-aware access control for officer, dispatch, supervisor, and command staff workflows
- Personnel management for creating, updating, and reviewing employee records
- Assignment tracking for active work, status changes, and operational follow-up
- Equipment and asset tracking for bodycams, vehicles, and cell phones
- Absence management for monitoring time away and availability
- User administration for managing access and keeping the system organized
- Active alerts workflows for surfacing urgent operational items quickly
- Database export, import, migration, and reset utilities for managing data across environments
- Drizzle-powered schema management with PostgreSQL/Neon support

## Product Highlights

- Built as a split frontend/backend application for clear separation of concerns
- Uses TypeScript across the stack for maintainability and safer iteration
- Structured for internal operations, demonstrations, and sales presentations
- Supports operational workflows that can be shown live in a short demo or sales walkthrough
- Includes supporting scripts and documentation for database migration and seeded demo access
- Designed to present as a practical, usable system rather than a static prototype

## Demo Video

Use this space to show the app in action. The clip is stored in the repo at `demo-media/InfoCore.mp4`, and the raw GitHub URL below is the most reliable way to reference it in the remote README.

```html
<video controls width="100%">
  <source src="https://raw.githubusercontent.com/AaronScallen/info-core-2/main/demo-media/InfoCore.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
```

If GitHub does not render the player in the README view, use this direct link instead:

```markdown
[Watch the demo video](https://raw.githubusercontent.com/AaronScallen/info-core-2/main/demo-media/InfoCore.mp4)
```

## Repository Layout

```text
info-core-2/
├── info-core-front/        # Next.js frontend
└── info-core-2-backend/    # Express API + Drizzle + scripts
```

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

## Run Locally

The project is set up as two separate apps:

1. Install dependencies in both `info-core-2-backend` and `info-core-front`.
2. Configure the backend environment variables.
3. Push the database schema.
4. Start the backend and frontend in separate terminals.

If you are using the repo as a showcase or sales demo, you can keep these instructions in the appendix and focus most viewers on the capability sections above.

For a public-facing README, you can also move this section below the fold or replace it with a short "Request access" note.

## Local Development Notes

- The frontend currently calls the backend using hardcoded URLs at http://localhost:3001 in multiple pages. Run both apps on their default local ports unless you update those fetch URLs.
- If demo login returns invalid credentials, reseed demo users from the backend scripts.
- If the backend cannot connect to the database, verify `DATABASE_URL` and that your database is reachable.
- If CORS issues appear, confirm `FRONTEND_URL` matches your frontend origin.

## API and Additional Docs

Backend docs are in `info-core-2-backend`:

- `API_DOCUMENTATION.md`: Endpoint reference
- `CRUD_ROUTES_README.md`: CRUD implementation and usage
- `NEON_MIGRATION_GUIDE.md`: Neon migration workflow
- `test-requests.http` / `test.http`: Request samples for API testing

## License

No license file is currently defined in this repository. Add one before public distribution.
