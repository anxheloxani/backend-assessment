import { Request, Response } from "express";
import { db } from "../db";
import { logAudit } from "../utils/auditLogger";
import * as taskService from "../services/taskService";

async function enqueueJob(jobType: string, payload: Record<string, unknown>) {
  await db.query(
    `INSERT INTO job_queue (job_type, payload) VALUES ($1, $2)`,
    [jobType, payload]
  );
}

export async function createTask(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const { title, description, priority, assigned_to, due_date } = req.body;

    if (!projectId || Array.isArray(projectId)) {
      return res.status(400).json({ error: "projectId is required and must be a string" });
    }
    if (!title) return res.status(400).json({ error: "title is required" });

    const task = await taskService.createTask(
      projectId,
      title,
      description || null,
      priority ?? 3,
      assigned_to || null,
      due_date || null
    );

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateTaskStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, changed_by } = req.body;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Task id is required and must be a string" });
    }

    const allowedStatuses = ["todo", "in_progress", "review", "done"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid task status" });
    }

    const updatedTask = await taskService.changeTaskStatus(id, status, changed_by);
    return res.json(updatedTask);
  } catch (error: any) {
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}

export async function assignTask(req: Request, res: Response) {
  try {
    const taskId = req.params.id;
    const { assigned_to, changed_by } = req.body;

    if (!taskId) return res.status(400).json({ error: "Task id is required" });
    if (!assigned_to) return res.status(400).json({ error: "assigned_to is required" });

    const taskResult = await db.query(
      `SELECT project_id, assigned_to FROM tasks WHERE id = $1`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const { project_id: projectId, assigned_to: previousAssignedTo } = taskResult.rows[0];

    const updateResult = await db.query(
      `UPDATE tasks SET assigned_to = $1, version = version + 1 WHERE id = $2 RETURNING *`,
      [assigned_to, taskId]
    );

    const projectResult = await db.query(
      `SELECT organization_id FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length > 0) {
      const organizationId = String(projectResult.rows[0].organization_id);

      await logAudit({
        organizationId,
        entityType: "task",
        entityId: String(taskId),
        action: "task_assigned",
        performedBy: changed_by ? String(changed_by) : null,
        metadata: {
          previous_assigned_to: previousAssignedTo,
          new_assigned_to: assigned_to,
        },
      });

      await enqueueJob("task.assigned", { taskId, assigned_to, changed_by });
    }

    return res.json(updateResult.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function softDeleteTask(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const task = await taskService.softDeleteTask(id);
    return res.json({ message: "Task soft deleted", task });
  } catch (error: any) {
    return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
  }
}