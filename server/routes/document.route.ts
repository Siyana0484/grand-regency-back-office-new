import express from "express";
import { authenticate, authorize } from "../middlewares/auth";
import * as document from "../controllers/document.controller";

const router = express.Router();

router.get("/guest",authenticate,authorize("guest:files:read"),document.getDocuments);
router.get("/booking", authenticate, authorize("booking:files:read"), document.getDocuments);
router.get("/purchase", authenticate, authorize("purchase:files:read"), document.getDocuments);
router.get("/guest/:fileName/:folder",authenticate,authorize("guest:file:download"),document.getDownloadUrl);
router.get("/booking/:fileName/:folder",authenticate,authorize("booking:file:download"),document.getDownloadUrl);
router.get("/purchase/:fileName/:folder",authenticate,authorize("purchase:file:download"),document.getDownloadUrl);

export default router;
