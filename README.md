# Backend Assessment — Multi-Tenant Task Management API

A RESTful backend API built with Node.js, Express, TypeScript, and PostgreSQL.

## Tech Stack

- Node.js + Express
- TypeScript
- PostgreSQL (Docker)
- JWT Authentication
- bcryptjs, pino, zod

## Features

- Multi-tenant architecture (organizations)
- JWT authentication
- Role-based access control (admin, manager, member)
- Project and task management
- Workflow engine with validated status transitions (todo → in_progress → review → done)
- Transactional status updates with history tracking
- Audit logging with JSONB metadata
- Soft delete on tasks
- Optimistic concurrency (version field)
- Async background job worker with PostgreSQL job queue
- Correlation ID middleware
- Centralized error handling
- SQL migrations
- Services/repositories architecture

## Getting Started

### Prerequisites

- Node.js 18+
- Docker

### Setup

1. Clone the repo
```bash
  git clone https://github.com/anxheloxani/backend-assessment
cd backend-assessment
```

2. Install dependencies
```bash
   npm install
```

3. Start PostgreSQL with Docker
```bash
   docker run --name backend-postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=assessment_db \
     -p 5432:5432 -d postgres:15
```

4. Create a `.env` file
```
   PORT=3000
   DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/assessment_db
   JWT_SECRET=supersecretkey123
```

5. Run migrations
```bash
   npm run migrate
```

6. Start the server
```bash
   npm run dev
```

7. Start the background worker (separate terminal)
```bash
   npm run worker
```

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Login and receive JWT |

### Organizations
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /organizations | public | Create organization |
| PATCH | /organizations/:id/status | admin | Suspend or activate org |

### Users
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /organizations/:orgId/users | admin | Create user |
| PATCH | /users/:id/role | admin | Update user role |
| PATCH | /users/:id/deactivate | admin | Deactivate user and unassign tasks |

### Projects
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | /projects | all | List projects (paginated) |
| POST | /projects | admin, manager | Create project |
| PATCH | /projects/:id | admin, manager | Update project |
| PATCH | /projects/:id/archive | admin, manager | Archive project |

### Tasks
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /projects/:projectId/tasks | admin, manager | Create task |
| PATCH | /tasks/:id/status | all | Update task status |
| PATCH | /tasks/:id/assign | admin, manager | Assign task |
| DELETE | /tasks/:id | admin, manager | Soft delete task |

## Architecture
```
routes → controllers → services → repositories → database
```

- **Routes** — define endpoints and apply auth/role middleware
- **Controllers** — handle HTTP request/response, no business logic
- **Services** — business logic, transactions, workflow validation
- **Repositories** — direct database queries

## Workflow Transitions
```
todo → in_progress → review → done
```

Invalid transitions are rejected with a 400 error.
