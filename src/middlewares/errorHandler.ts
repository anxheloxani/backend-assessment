import { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const correlationId = (req as any).correlationId || null;

  console.error({
    correlationId,
    message: err?.message,
    stack: err?.stack,
  });

  res.status(err?.status || 500).json({
    error: err?.message || "Internal server error",
    correlationId,
  });
}