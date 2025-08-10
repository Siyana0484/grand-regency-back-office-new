import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import * as role from "../controllers/role.controller";

const router = Router();

router.post("/", authenticate, authorize("role:create"), role.createRole);
router.get("/", authenticate, authorize("role:read"), role.getRoles);
router.patch("/:id", authenticate, authorize("role:update"), role.assignRolePermissions);
router.delete("/:id", authenticate, authorize("role:delete"), role.deleteRole);

export default router;
