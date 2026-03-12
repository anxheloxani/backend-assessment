import { Router } from "express";
import { createProject, listProjects, updateProject, archiveProject } from "../controllers/projectController";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.get("/", requireAuth, requireRole(["admin", "manager", "member"]), listProjects);
router.post("/", requireAuth, requireRole(["admin", "manager"]), createProject);
router.patch("/:id", requireAuth, requireRole(["admin", "manager"]), updateProject);
router.patch("/:id/archive", requireAuth, requireRole(["admin", "manager"]), archiveProject);

export default router;
