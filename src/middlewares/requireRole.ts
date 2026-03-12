import { NextFunction, Request, Response } from "express";

export function requireRole(allowed: Array<"admin" | "manager" | "member">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: "Unauthorized" });
    if (!allowed.includes(role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}