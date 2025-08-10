import express from "express";
import * as guest from './../controllers/guest.controller';
import { authenticate, authorize } from "../middlewares/auth";

const router = express.Router();

router.get("/", authenticate, authorize("guest:read"), guest.getAllGuests);
router.post("/verfy-number", authenticate, authorize("booking:create"), guest.verifyNumber);
router.post("/", authenticate, authorize("booking:create"), guest.createGuest);
router.put("/:id", authenticate, authorize("guest:update"), guest.editGuest);
router.delete("/:id", authenticate, authorize("guest:delete"), guest.deleteGuest);
router.patch("/", authenticate, authorize(["booking:create", "guest:update"]), guest.saveGuestFiles);

export default router;
