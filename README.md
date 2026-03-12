Task Management Backend API

This project is a backend task management system built with Node.js, Express, TypeScript, and PostgreSQL.
It supports organizations, users, projects, and tasks with workflow validation, audit logging, and role-based access control.

The goal of this project was to design a clean backend architecture and implement a relational data model with real-world features like task workflows and activity tracking.

Tech Stack

Backend:

Node.js

Express

TypeScript

Database:

PostgreSQL

Tools:

Docker (for PostgreSQL)

ts-node-dev

dotenv

Project Structure
src
 ├── controllers
 ├── routes
 ├── db
 │    ├── migrations
 │    └── seed scripts
 ├── middlewares
 └── utils

The API follows a simple layered structure:

routes → controllers → database

Routes define endpoints, controllers contain the logic, and the database layer handles SQL queries.

Database Design

Main tables:

organizations
users
projects
tasks
task_workflows
audit_logs

Relationships:

Organization
   ├── Users
   └── Projects
           └── Tasks

Additional tracking tables:

task_workflows → stores task status transitions

audit_logs → stores system activity events

Task Workflow

Tasks follow a strict status workflow:

todo → in_progress → review → done

Invalid transitions are rejected by the API.

For example:

todo → done  

Every status change is recorded in the task_workflows table.

Audit Logging

Important actions are recorded in audit_logs.

Examples include:

task status changes

task assignment

user creation

Example audit log entry:

entity_type: task
action: status_changed
metadata: { from: "in_progress", to: "review" }

This allows tracking changes and debugging activity.

Role-Based Access Control (RBAC)

The system supports three roles:

admin
manager
member

Permissions:

Role	Permissions
admin	full access
manager	manage projects and tasks
member	update task status

RBAC is implemented using middleware that checks the request header:

x-user-role

Example:

x-user-role: admin

In a production system, this role would normally come from a JWT token.

API Endpoints
Organizations

Create an organization

POST /organizations

Example:

curl -X POST http://localhost:3000/organizations \
-H "Content-Type: application/json" \
-d '{"name":"Acme Inc"}'
Users

Create a user within an organization

POST /organizations/:orgId/users
Projects

Create a project

POST /projects

Requires role:

admin or manager
Tasks

Create a task

POST /projects/:projectId/tasks
Update Task Status
PATCH /tasks/:id/status

Example:

curl -X PATCH http://localhost:3000/tasks/{taskId}/status \
-H "Content-Type: application/json" \
-d '{
"status":"in_progress",
"changed_by":"USER_ID"
}'
Assign Task
PATCH /tasks/:id/assign

This endpoint updates the assigned user and records the change in the audit logs.

Local Setup
Install dependencies
npm install
Start PostgreSQL with Docker
docker run -d \
--name backend-postgres \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_DB=assessment_db \
-p 5432:5432 \
postgres:15
Run database migrations
npm run migrate
Seed sample data
npm run seed
Start the server
npm run dev

Server runs at:

http://localhost:3000
Testing

Endpoints can be tested using:

curl

Postman

Insomnia

Health check endpoint:

GET /health

Response:

{ "ok": true }
Possible Improvements

Future improvements could include:

JWT authentication

pagination and filtering

background job processing

real-time notifications

automated tests

Author

Angjelos Xani