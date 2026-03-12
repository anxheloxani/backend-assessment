"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizationController_1 = require("../controllers/organizationController");
const requireAuth_1 = require("../middlewares/requireAuth");
const requireRole_1 = require("../middlewares/requireRole");
const router = (0, express_1.Router)();
router.post("/", organizationController_1.createOrganization); // public — create org
router.patch("/:id/status", requireAuth_1.requireAuth, (0, requireRole_1.requireRole)(["admin"]), organizationController_1.updateOrganizationStatus);
exports.default = router;
