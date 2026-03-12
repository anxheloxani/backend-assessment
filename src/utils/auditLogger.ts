import { db } from "../db";

type AuditLogInput = {
  organizationId: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAudit(input: AuditLogInput): Promise<void> {
  const {
    organizationId,
    entityType,
    entityId,
    action,
    performedBy = null,
    metadata = {},
  } = input;

  await db.query(
    `
    INSERT INTO audit_logs
    (organization_id, entity_type, entity_id, action, performed_by, metadata)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [organizationId, entityType, entityId, action, performedBy, metadata]
  );
}