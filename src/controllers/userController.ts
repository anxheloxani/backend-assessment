import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";

export async function createUser(req: Request, res: Response) {
  try {
    const { orgId } = req.params;
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: "name, email, role, and password are required" });
    }

    const allowedRoles = ["admin", "manager", "member"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (organization_id, name, email, role, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, organization_id, name, email, role, is_active, created_at`,
      [orgId, name, email, role, passwordHash]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists in this organization" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateUserRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "manager", "member"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const result = await db.query(
      `UPDATE users SET role = $1 WHERE id = $2
       RETURNING id, organization_id, name, email, role, is_active`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deactivateUser(req: Request, res: Response) {
  const client = await db.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const userResult = await client.query(`SELECT id FROM users WHERE id = $1`, [id]);
    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "User not found" });
    }

    await client.query(`UPDATE users SET is_active = FALSE WHERE id = $1`, [id]);

    await client.query(
      `UPDATE tasks SET assigned_to = NULL, version = version + 1
       WHERE assigned_to = $1 AND deleted_at IS NULL`,
      [id]
    );

    await client.query("COMMIT");
    return res.json({ message: "User deactivated and assigned tasks unassigned" });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}