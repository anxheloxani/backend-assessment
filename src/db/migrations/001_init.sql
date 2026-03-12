CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE org_status AS ENUM ('active', 'suspended');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status org_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_status ON organizations(status);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_users_org_email UNIQUE (organization_id, email)
);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_org_role ON users(organization_id, role);
CREATE INDEX idx_users_org_active ON users(organization_id, is_active);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status project_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_org_status_created
  ON projects(organization_id, status, created_at DESC);

CREATE INDEX idx_projects_created_by ON projects(created_by);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority INT NOT NULL DEFAULT 3,
  assigned_to UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  version INT NOT NULL DEFAULT 1
);

CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_assigned_status
  ON tasks(assigned_to, status)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_project_not_deleted
  ON tasks(project_id)
  WHERE deleted_at IS NULL;

CREATE TABLE task_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE RESTRICT,
  from_status task_status NOT NULL,
  to_status task_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_workflows_task_changed_at
  ON task_workflows(task_id, changed_at DESC);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_org_created
  ON audit_logs(organization_id, created_at DESC);

CREATE INDEX idx_audit_logs_entity
  ON audit_logs(entity_type, entity_id);

CREATE INDEX idx_audit_logs_metadata_gin
  ON audit_logs USING GIN (metadata);