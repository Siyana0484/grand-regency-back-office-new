import express from "express";
import * as user from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth";

const router = express.Router();

router.get("/", authenticate, user.getProfile);
router.get("/all", authenticate, authorize("user:read"), user.getAllUsers);
router.post("/", authenticate, authorize("user:create"), user.addUser);
router.put("/:id", authenticate, authorize("user:update"), user.editUser);
router.delete("/:id", authenticate, authorize("user:delete"), user.deleteUser);
router.patch("/", authenticate, user.resetPassword);

export default router;
