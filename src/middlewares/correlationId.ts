import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

export function correlationId(req: Request, res: Response, next: NextFunction) {
  const id = req.header("x-correlation-id") || randomUUID();
  res.setHeader("x-correlation-id", id);
  (req as any).correlationId = id;
  next();
}