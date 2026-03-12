import { Router } from "express";
import { createTask, updateTaskStatus, assignTask, softDeleteTask } from "../controllers/taskController";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.post("/projects/:projectId/tasks", requireAuth, requireRole(["admin", "manager"]), createTask);
router.patch("/tasks/:id/status", requireAuth, requireRole(["admin", "manager", "member"]), updateTaskStatus);
router.patch("/tasks/:id/assign", requireAuth, requireRole(["admin", "manager"]), assignTask);
router.delete("/tasks/:id", requireAuth, requireRole(["admin", "manager"]), softDeleteTask);

export default router;