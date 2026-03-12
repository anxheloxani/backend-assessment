"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const organizationRoutes_1 = __importDefault(require("./routes/organizationRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const correlationId_1 = require("./middlewares/correlationId");
const errorHandler_1 = require("./middlewares/errorHandler");
function createApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use(correlationId_1.correlationId);
    app.get("/health", (_req, res) => {
        res.json({ ok: true });
    });
    app.use("/organizations", organizationRoutes_1.default);
    app.use(userRoutes_1.default);
    app.use("/projects", projectRoutes_1.default);
    app.use(taskRoutes_1.default);
    app.use("/auth", authRoutes_1.default);
    app.use(errorHandler_1.errorHandler);
    return app;
}
