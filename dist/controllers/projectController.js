"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
exports.listProjects = listProjects;
exports.updateProject = updateProject;
exports.archiveProject = archiveProject;
const db_1 = require("../db");
async function createProject(req, res) {
    try {
        const { organization_id, name, description, created_by, status } = req.body;
        if (!organization_id || !name || !created_by) {
            return res.status(400).json({ error: "organization_id, name, and created_by are required" });
        }
        const projectStatus = status || "draft";
        if (!["draft", "active", "archived"].includes(projectStatus)) {
            return res.status(400).json({ error: "Invalid project status" });
        }
        const result = await db_1.db.query(`INSERT INTO projects (organization_id, name, description, created_by, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [organization_id, name, description || null, created_by, projectStatus]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}
async function listProjects(req, res) {
    try {
        const { organization_id, status, page = "1", limit = "10" } = req.query;
        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.min(Math.max(Number(limit), 1), 100);
        const offset = (pageNum - 1) * limitNum;
        let query = `SELECT id, organization_id, name, description, created_by, status, created_at
                 FROM projects WHERE 1=1`;
        const values = [];
        if (organization_id) {
            values.push(organization_id);
            query += ` AND organization_id = $${values.length}`;
        }
        if (status) {
            values.push(status);
            query += ` AND status = $${values.length}`;
        }
        values.push(limitNum);
        query += ` ORDER BY created_at DESC LIMIT $${values.length}`;
        values.push(offset);
        query += ` OFFSET $${values.length}`;
        const result = await db_1.db.query(query, values);
        return res.json(result.rows);
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}
async function updateProject(req, res) {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;
        const result = await db_1.db.query(`UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status)
       WHERE id = $4 RETURNING *`, [name ?? null, description ?? null, status ?? null, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}
async function archiveProject(req, res) {
    try {
        const { id } = req.params;
        const result = await db_1.db.query(`UPDATE projects SET status = 'archived' WHERE id = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}
