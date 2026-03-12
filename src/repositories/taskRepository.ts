import { db } from "../db";

export async function findTaskById(taskId: string) {
  const result = await db.query(
    `SELECT t.id, t.status, t.project_id, t.assigned_to, t.deleted_at,
            p.organization_id
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     WHERE t.id = $1`,
    [taskId]
  );
  return result.rows[0] || null;
}

export async function updateTaskStatusInDb(
  client: any,
  taskId: string,
  status: string
) {
  const result = await client.query(
    `UPDATE tasks SET status = $1, version = version + 1
     WHERE id = $2 RETURNING *`,
    [status, taskId]
  );
  return result.rows[0];
}

export async function insertWorkflowRecord(
  client: any,
  taskId: string,
  fromStatus: string,
  toStatus: string,
  changedBy: string
) {
  await client.query(
    `INSERT INTO task_workflows (task_id, from_status, to_status, changed_by)
     VALUES ($1, $2, $3, $4)`,
    [taskId, fromStatus, toStatus, changedBy]
  );
}

export async function insertTaskInDb(
  projectId: string,
  title: string,
  description: string | null,
  priority: number,
  assignedTo: string | null,
  dueDate: string | null
) {
  const result = await db.query(
    `INSERT INTO tasks (project_id, title, description, priority, assigned_to, due_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [projectId, title, description, priority, assignedTo, dueDate]
  );
  return result.rows[0];
}

export async function softDeleteTaskInDb(taskId: string) {
  const result = await db.query(
    `UPDATE tasks SET deleted_at = now(), version = version + 1
     WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    [taskId]
  );
  return result.rows[0] || null;
}