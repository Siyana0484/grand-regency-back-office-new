import express from "express";
import * as auth from "../controllers/auth.controller";

const router = express.Router();

router.post("/login", auth.login);
router.post("/reset-password", auth.sendResetMail);
router.post("/change-password", auth.changePassword);
router.get("/", auth.logout);

export default router;
