"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = createTask;
exports.updateTaskStatus = updateTaskStatus;
exports.assignTask = assignTask;
exports.softDeleteTask = softDeleteTask;
const db_1 = require("../db");
const auditLogger_1 = require("../utils/auditLogger");
const taskService = __importStar(require("../services/taskService"));
async function enqueueJob(jobType, payload) {
    await db_1.db.query(`INSERT INTO job_queue (job_type, payload) VALUES ($1, $2)`, [jobType, payload]);
}
async function createTask(req, res) {
    try {
        const { projectId } = req.params;
        const { title, description, priority, assigned_to, due_date } = req.body;
        if (!projectId || Array.isArray(projectId)) {
            return res.status(400).json({ error: "projectId is required and must be a string" });
        }
        if (!title)
            return res.status(400).json({ error: "title is required" });
        const task = await taskService.createTask(projectId, title, description || null, priority ?? 3, assigned_to || null, due_date || null);
        return res.status(201).json(task);
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}
async function updateTaskStatus(req, res) {
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
    }
    catch (error) {
        return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
    }
}
async function assignTask(req, res) {
    try {
        const taskId = req.params.id;
        const { assigned_to, changed_by } = req.body;
        if (!taskId)
            return res.status(400).json({ error: "Task id is required" });
        if (!assigned_to)
            return res.status(400).json({ error: "assigned_to is required" });
        const taskResult = await db_1.db.query(`SELECT project_id, assigned_to FROM tasks WHERE id = $1`, [taskId]);
        if (taskResult.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        const { project_id: projectId, assigned_to: previousAssignedTo } = taskResult.rows[0];
        const updateResult = await db_1.db.query(`UPDATE tasks SET assigned_to = $1, version = version + 1 WHERE id = $2 RETURNING *`, [assigned_to, taskId]);
        const projectResult = await db_1.db.query(`SELECT organization_id FROM projects WHERE id = $1`, [projectId]);
        if (projectResult.rows.length > 0) {
            const organizationId = String(projectResult.rows[0].organization_id);
            await (0, auditLogger_1.logAudit)({
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
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}
async function softDeleteTask(req, res) {
    try {
        const { id } = req.params;
        if (Array.isArray(id)) {
            return res.status(400).json({ error: "Invalid task id" });
        }
        const task = await taskService.softDeleteTask(id);
        return res.json({ message: "Task soft deleted", task });
    }
    catch (error) {
        return res.status(error.status || 500).json({ error: error.message || "Internal server error" });
    }
}
