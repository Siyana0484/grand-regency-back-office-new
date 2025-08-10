import express from "express";
import { authenticate, authorize } from "../middlewares/auth";
import * as purchase from "../controllers/purchase.controller";

const router = express.Router();

router.get("/", authenticate, authorize("purchase:read"), purchase.getAllPurchases);
router.post("/", authenticate, authorize("purchase:create"), purchase.createPurchase);
router.patch("/", authenticate, authorize(["purchase:create","purchase:update"]), purchase.savePurchaseFiles);
router.put("/:id", authenticate, authorize("purchase:update"), purchase.editpurchase);
router.delete("/:id", authenticate, authorize("purchase:delete"), purchase.deletePurchase);

export default router;
