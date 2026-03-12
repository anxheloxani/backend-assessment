"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrganization = createOrganization;
exports.updateOrganizationStatus = updateOrganizationStatus;
const db_1 = require("../db");
async function createOrganization(req, res) {
    try {
        const { name } = req.body;
        if (!name || typeof name !== "string") {
            return res.status(400).json({ error: "Organization name is required" });
        }
        const result = await db_1.db.query(`INSERT INTO organizations (name) VALUES ($1) RETURNING id, name, status, created_at`, [name]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("Create organization failed:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
async function updateOrganizationStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["active", "suspended"].includes(status)) {
            return res.status(400).json({ error: "status must be active or suspended" });
        }
        const result = await db_1.db.query(`UPDATE organizations SET status = $1 WHERE id = $2 RETURNING id, name, status, created_at`, [status, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Organization not found" });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        console.error("Update organization status failed:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
