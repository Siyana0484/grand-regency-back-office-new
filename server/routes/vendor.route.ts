import * as vendor from './../controllers/vendor.controller';
import express from "express";
import { authenticate, authorize } from "../middlewares/auth";

const router = express.Router();

router.get("/", authenticate, authorize("vendor:read"), vendor.getAllVendors);
router.post("/verfy-number", authenticate, authorize("purchase:create"), vendor.verifyNumber);
router.post("/", authenticate, authorize("purchase:create"), vendor.createVendor);
router.put("/:id", authenticate, authorize("vendor:update"), vendor.editVendor);
router.delete("/:id", authenticate, authorize("vendor:delete"), vendor.deleteVendor);

export default router;
