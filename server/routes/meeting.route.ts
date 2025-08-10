import * as meeting from './../controllers/meeting.controller';
import express from "express";
import { authenticate, authorize } from "../middlewares/auth";

const router = express.Router();

router.get("/:id", authenticate, authorize("prospective-guest:read"), meeting.getMeetingsById);
router.post("/", authenticate, authorize("meeting:create"), meeting.createMeeting);
router.put("/:id", authenticate, authorize("meeting:update"), meeting.editMeeting);
router.delete("/:id", authenticate, authorize("meeting:delete"), meeting.deleteMeeting);


export default router;
