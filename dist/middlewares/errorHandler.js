"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, _next) {
    const correlationId = req.correlationId || null;
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
