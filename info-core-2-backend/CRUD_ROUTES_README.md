# Info Core 2 - Backend CRUD Routes

Complete CRUD API implementation for the Info Core 2 application with role-based access control.

## 📁 Project Structure

```
src/
├── controllers/          # Business logic for each entity
│   ├── auth.controller.ts
│   ├── employees.controller.ts
│   ├── assignments.controller.ts
│   ├── bodycams.controller.ts
│   ├── policeVehicles.controller.ts
│   ├── cellPhones.controller.ts
│   ├── absences.controller.ts
│   └── users.controller.ts
├── routes/
│   └── index.ts         # All API routes with auth middleware
├── middleware/
│   └── auth.middleware.ts
├── db/
│   ├── schema.ts
│   └── index.ts
└── server.ts            # Main Express app

types/
└── api-types.ts         # TypeScript types for frontend

lib/
└── api-client.ts        # API client for Next.js frontend
```

## 🚀 Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   JWT_SECRET=your-secret-key
   PORT=3001
   ```

3. **Run database migrations**

   ```bash
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Base URL

```
http://localhost:3001/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## 🔐 Role-Based Access Control

| Role              | Permissions                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| **officer**       | Read: vehicles, assignments, bodycams, cellphones, absences              |
| **dispatch**      | Read: all resources<br>Create/Update: absences                           |
| **supervisor**    | Read: all resources<br>Create/Update: most resources<br>Delete: absences |
| **command_staff** | Full CRUD access to all resources                                        |

## 📋 Available Entities

- **Users** - System users with authentication
- **Employees** - Police department employees
- **Assignments** - Work assignments/locations
- **Bodycams** - Body-worn cameras
- **Police Vehicles** - Department vehicles
- **Cell Phones** - Department cell phones
- **Absences** - Employee absences and coverage

## 🔧 Using with Next.js Frontend

### 1. Copy Types to Frontend

Copy `types/api-types.ts` to your Next.js project:

```bash
cp types/api-types.ts ../your-nextjs-app/types/
```

### 2. Copy API Client

Copy `lib/api-client.ts` to your Next.js project:

```bash
cp lib/api-client.ts ../your-nextjs-app/lib/
```

### 3. Set Environment Variable

In your Next.js `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Usage Example in Next.js

```typescript
// app/employees/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { Employee } from "@/types/api-types";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const data = await apiClient.getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployees();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Employees</h1>
      <ul>
        {employees.map((employee) => (
          <li key={employee.enumber}>
            {employee.firstName} {employee.lastName} - Badge: {employee.badge}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 5. Login Example

```typescript
// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.login(credentials);
      console.log("Logged in as:", response.user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Username"
        value={credentials.username}
        onChange={(e) =>
          setCredentials({ ...credentials, username: e.target.value })
        }
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) =>
          setCredentials({ ...credentials, password: e.target.value })
        }
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## 🧪 Testing the API

You can use the included `test.http` file with REST Client extension in VS Code, or use curl:

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123", "role": "officer"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# Get all employees (with token)
curl -X GET http://localhost:3001/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npx drizzle-kit push

# Generate database migrations
npx drizzle-kit generate

# Open Drizzle Studio
npx drizzle-kit studio
```

## 📝 Notes

- All CRUD operations include proper error handling and validation
- All endpoints return consistent JSON responses
- Validation is done using Zod schemas
- Database operations use Drizzle ORM
- JWT tokens expire based on your configuration
- Password hashes use bcrypt with salt rounds of 10

## 🔒 Security Best Practices

1. Always use HTTPS in production
2. Set strong JWT_SECRET in production
3. Implement rate limiting for auth endpoints
4. Use environment variables for sensitive data
5. Validate and sanitize all user inputs
6. Implement CORS properly for your frontend domain

## 📄 License

ISC

## 👨‍💻 Author

God Is Good, always!
