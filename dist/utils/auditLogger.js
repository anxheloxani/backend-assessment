"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
const db_1 = require("../db");
async function logAudit(input) {
    const { organizationId, entityType, entityId, action, performedBy = null, metadata = {}, } = input;
    await db_1.db.query(`
    INSERT INTO audit_logs
    (organization_id, entity_type, entity_id, action, performed_by, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    `, [organizationId, entityType, entityId, action, performedBy, metadata]);
}
