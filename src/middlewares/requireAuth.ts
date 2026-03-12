import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type AuthPayload = {
  userId: string;
  organizationId: string;
  role: "admin" | "manager" | "member";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization Bearer token" });
  }

  const token = header.slice("Bearer ".length);
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "JWT_SECRET not set" });

  try {
    req.user = jwt.verify(token, secret) as AuthPayload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}