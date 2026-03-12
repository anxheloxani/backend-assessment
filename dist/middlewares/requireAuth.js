"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing Authorization Bearer token" });
    }
    const token = header.slice("Bearer ".length);
    const secret = process.env.JWT_SECRET;
    if (!secret)
        return res.status(500).json({ error: "JWT_SECRET not set" });
    try {
        req.user = jsonwebtoken_1.default.verify(token, secret);
        return next();
    }
    catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
