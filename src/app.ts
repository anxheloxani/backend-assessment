import express from "express";
import organizationRoutes from "./routes/organizationRoutes";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import authRoutes from "./routes/authRoutes";
import { correlationId } from "./middlewares/correlationId";
import { errorHandler } from "./middlewares/errorHandler";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(correlationId);

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/organizations", organizationRoutes);
  app.use(userRoutes);
  app.use("/projects", projectRoutes);
  app.use(taskRoutes);
  app.use("/auth", authRoutes);

  app.use(errorHandler);

  return app;
}