import * as guest from './../controllers/prospectiveGuest.controller';
import express from "express";
import { authenticate, authorize } from "../middlewares/auth";

const router = express.Router();

router.post("/", authenticate, authorize("prospective-guest:create"), guest.createProspectiveGuest);
router.get("/", authenticate, authorize("prospective-guest:read"), guest.getAllProspectiveGuests);
router.put("/:id", authenticate, authorize("prospective-guest:update"), guest.editProspectiveGuest);
router.delete("/:id", authenticate, authorize("prospective-guest:delete"), guest.deleteProspectiveGuest);
router.get("/name-id", authenticate, authorize("booking:update"), guest.getNameAndId);


export default router;
