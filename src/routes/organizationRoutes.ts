import { Router } from "express";
import { createOrganization, updateOrganizationStatus } from "../controllers/organizationController";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.post("/", createOrganization); // public — create org
router.patch("/:id/status", requireAuth, requireRole(["admin"]), updateOrganizationStatus);

export default router;