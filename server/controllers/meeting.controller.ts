import { NextFunction, Request, Response } from "express";
import { meetingSchema } from "../utils/validator";
import { errorHandler } from "../utils/customError";
import Meeting from "../models/meeting.model";

//get meetings by id
export const getMeetingsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const skip = (page - 1) * limit;

    // Get total count of meetings for pagination
    const totalMeetings = await Meeting.countDocuments({
      prospectiveGuestId: id,
    });

    const totalPages = Math.ceil(totalMeetings / limit);

    // Aggregate query with pagination
    let meetings = await Meeting.aggregate([
      { $match: { prospectiveGuestId: id } }, // Filter by prospectiveGuest
      { $sort: { date: -1 } }, // Sort by latest meeting date
      { $skip: skip }, // Skip records based on pagination
      { $limit: limit }, // Limit the number of results per page
    ]);

    res.status(200).json({
      success: true,
      meetings,
      totalPages,
    });
  } catch (error) {
    console.log("error at fetching meetings:", error);
    next(errorHandler(500, "server error fetching meetings failed"));
  }
};

//create meeting
export const createMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prospectiveGuestId, date, remarks, attendies } = req.body;
    const { error } = meetingSchema.validate({
      date,
      remarks,
      attendies,
    });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }

    const newMeeting = await Meeting.create({
      prospectiveGuestId,
      date,
      remarks,
      attendies,
    });

    res.json({
      success: true,
      newMeeting,
    });
  } catch (error: any) {
    console.log("Meeting creation error:", error);
    next(errorHandler(500, "server error Meeting creation failed"));
  }
};

//edit meeting

export const editMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { values } = req.body;
    const { id } = req.params;
    const { error } = meetingSchema.validate(values);
    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      id,
      { $set: values },
      { new: true, runValidators: true }
    );

    if (!updatedMeeting) {
      next(errorHandler(404, "Meeting not found"));
      return;
    }

    res.json({ success: true, updatedMeeting });
  } catch (error: any) {
    console.log("update meeting error:", error);

    next(errorHandler(500, "server error update meeting failed"));
  }
};

//delete meeting
export const deleteMeeting = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      next(errorHandler(400, "Prospective Guest not found"));
      return;
    }

    // Check if meeting exists
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      next(errorHandler(404, "Meeting not found"));
      return;
    }

    await Meeting.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.log("Meeting delete error:", error);
    next(errorHandler(500, "server error Meeting delete failed"));
  }
};
