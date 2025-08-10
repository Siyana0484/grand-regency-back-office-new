import express from "express";
import { authenticate, authorize } from "../middlewares/auth";
import * as booking from "../controllers/booking.controller";

const router = express.Router();

router.get("/", authenticate, authorize("booking:read"), booking.getAllBookings);
router.get("/:id", authenticate, authorize("prospective-guest:read"), booking.getBookingsById);
router.post("/", authenticate, authorize("booking:create"), booking.createBooking);
router.put("/:id", authenticate, authorize("booking:update"), booking.editBooking);
router.patch("/", authenticate, authorize(["booking:create", "booking:update"]), booking.saveBookingFiles);
router.delete("/:id", authenticate, authorize("booking:delete"), booking.deleteBooking);
router.patch("/:id", authenticate, authorize("booking:update"), booking.addAdditionalCost);
router.patch("/:id/:type", authenticate, authorize("booking:update"), booking.deleteAdditionalCost);

export default router;
