"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeTaskStatus = changeTaskStatus;
exports.createTask = createTask;
exports.softDeleteTask = softDeleteTask;
const db_1 = require("../db");
const taskRepository_1 = require("../repositories/taskRepository");
const VALID_TRANSITIONS = {
    todo: ["in_progress"],
    in_progress: ["review"],
    review: ["done"],
    done: [],
};
async function enqueueJob(jobType, payload) {
    await db_1.db.query(`INSERT INTO job_queue (job_type, payload) VALUES ($1, $2)`, [jobType, payload]);
}
async function changeTaskStatus(taskId, newStatus, changedBy) {
    const client = await db_1.db.connect();
    try {
        await client.query("BEGIN");
        const taskResult = await client.query(`SELECT t.status, t.project_id, p.organization_id, t.deleted_at
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE t.id = $1
       FOR UPDATE`, [taskId]);
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
            throw Object.assign(new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`), { status: 400 });
        }
        const updatedTask = await (0, taskRepository_1.updateTaskStatusInDb)(client, taskId, newStatus);
        await (0, taskRepository_1.insertWorkflowRecord)(client, taskId, currentStatus, newStatus, changedBy);
        await client.query(`INSERT INTO audit_logs
       (organization_id, entity_type, entity_id, action, performed_by, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`, [
            task.organization_id,
            "task",
            taskId,
            "status_changed",
            changedBy || null,
            { from: currentStatus, to: newStatus },
        ]);
        await client.query("COMMIT");
        await enqueueJob("task.status_changed", {
            taskId,
            changedBy,
            from: currentStatus,
            to: newStatus,
        });
        return updatedTask;
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function createTask(projectId, title, description, priority, assignedTo, dueDate) {
    return (0, taskRepository_1.insertTaskInDb)(projectId, title, description, priority, assignedTo, dueDate);
}
async function softDeleteTask(taskId) {
    const task = await (0, taskRepository_1.softDeleteTaskInDb)(taskId);
    if (!task) {
        throw Object.assign(new Error("Task not found or already deleted"), { status: 404 });
    }
    return task;
}
