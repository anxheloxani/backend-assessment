"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTaskById = findTaskById;
exports.updateTaskStatusInDb = updateTaskStatusInDb;
exports.insertWorkflowRecord = insertWorkflowRecord;
exports.insertTaskInDb = insertTaskInDb;
exports.softDeleteTaskInDb = softDeleteTaskInDb;
const db_1 = require("../db");
async function findTaskById(taskId) {
    const result = await db_1.db.query(`SELECT t.id, t.status, t.project_id, t.assigned_to, t.deleted_at,
            p.organization_id
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     WHERE t.id = $1`, [taskId]);
    return result.rows[0] || null;
}
async function updateTaskStatusInDb(client, taskId, status) {
    const result = await client.query(`UPDATE tasks SET status = $1, version = version + 1
     WHERE id = $2 RETURNING *`, [status, taskId]);
    return result.rows[0];
}
async function insertWorkflowRecord(client, taskId, fromStatus, toStatus, changedBy) {
    await client.query(`INSERT INTO task_workflows (task_id, from_status, to_status, changed_by)
     VALUES ($1, $2, $3, $4)`, [taskId, fromStatus, toStatus, changedBy]);
}
async function insertTaskInDb(projectId, title, description, priority, assignedTo, dueDate) {
    const result = await db_1.db.query(`INSERT INTO tasks (project_id, title, description, priority, assigned_to, due_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [projectId, title, description, priority, assignedTo, dueDate]);
    return result.rows[0];
}
async function softDeleteTaskInDb(taskId) {
    const result = await db_1.db.query(`UPDATE tasks SET deleted_at = now(), version = version + 1
     WHERE id = $1 AND deleted_at IS NULL RETURNING *`, [taskId]);
    return result.rows[0] || null;
}
