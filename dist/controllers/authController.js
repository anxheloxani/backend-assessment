"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "email and password are required" });
        }
        const result = await db_1.db.query(`
      SELECT id, organization_id, email, role, is_active, password_hash, created_at
      FROM users
      WHERE email = $1
      ORDER BY created_at DESC
      LIMIT 1
      `, [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const user = result.rows[0];
        if (!user.is_active) {
            return res.status(403).json({ error: "User is inactive" });
        }
        const orgResult = await db_1.db.query(`SELECT status FROM organizations WHERE id = $1`, [user.organization_id]);
        if (orgResult.rows.length === 0 || orgResult.rows[0].status !== "active") {
            return res.status(403).json({ error: "Organization is not active" });
        }
        if (!user.password_hash) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            organizationId: user.organization_id,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.json({
            token,
            user: {
                id: user.id,
                organization_id: user.organization_id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
