import express from "express";
import * as token from "../controllers/token.controller";

const router = express.Router();

router.get("/", token.handleRefreshToken);

export default router;
