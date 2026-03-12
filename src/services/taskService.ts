import { db } from "../db";
import {
  findTaskById,
  updateTaskStatusInDb,
  insertWorkflowRecord,
  insertTaskInDb,
  softDeleteTaskInDb,
} from "../repositories/taskRepository";
import { logAudit } from "../utils/auditLogger";

const VALID_TRANSITIONS: Record<string, string[]> = {
  todo: ["in_progress"],
  in_progress: ["review"],
  review: ["done"],
  done: [],
};

async function enqueueJob(jobType: string, payload: Record<string, unknown>) {
  await db.query(
    `INSERT INTO job_queue (job_type, payload) VALUES ($1, $2)`,
    [jobType, payload]
  );
}

export async function changeTaskStatus(
  taskId: string,
  newStatus: string,
  changedBy: string
) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const taskResult = await client.query(
      `SELECT t.status, t.project_id, p.organization_id, t.deleted_at
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE t.id = $1
       FOR UPDATE`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      await client.query("ROLLBACK");
      throw Object.assign(new Error("Task not found"), { status: 404 });
    }

    const task = taskResult.rows[0];

    if (task.deleted_at) {
      await client.query("ROLLBACK");
      throw Object.assign(new Error("Task is deleted"), { status: 400 });
    }

    const currentStatus = task.status;

    if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
      await client.query("ROLLBACK");
      throw Object.assign(
        new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`),
        { status: 400 }
      );
    }

    const updatedTask = await updateTaskStatusInDb(client, taskId, newStatus);
    await insertWorkflowRecord(client, taskId, currentStatus, newStatus, changedBy);

    await client.query(
      `INSERT INTO audit_logs
       (organization_id, entity_type, entity_id, action, performed_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        task.organization_id,
        "task",
        taskId,
        "status_changed",
        changedBy || null,
        { from: currentStatus, to: newStatus },
      ]
    );

    await client.query("COMMIT");

    await enqueueJob("task.status_changed", {
      taskId,
      changedBy,
      from: currentStatus,
      to: newStatus,
    });

    return updatedTask;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createTask(
  projectId: string,
  title: string,
  description: string | null,
  priority: number,
  assignedTo: string | null,
  dueDate: string | null
) {
  return insertTaskInDb(projectId, title, description, priority, assignedTo, dueDate);
}

export async function softDeleteTask(taskId: string) {
  const task = await softDeleteTaskInDb(taskId);
  if (!task) {
    throw Object.assign(new Error("Task not found or already deleted"), { status: 404 });
  }
  return task;
}