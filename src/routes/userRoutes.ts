import { Router } from "express";
import { createUser, updateUserRole, deactivateUser } from "../controllers/userController";
import { requireAuth } from "../middlewares/requireAuth";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

router.post("/organizations/:orgId/users", requireAuth, requireRole(["admin"]), createUser);
router.patch("/users/:id/role", requireAuth, requireRole(["admin"]), updateUserRole);
router.patch("/users/:id/deactivate", requireAuth, requireRole(["admin"]), deactivateUser);

export default router;