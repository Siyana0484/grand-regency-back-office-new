import { NextFunction, Request, Response } from "express";
import { prospectiveGuestSchema } from "../utils/validator";
import { errorHandler } from "../utils/customError";
import ProspectiveGuest from "../models/prospectiveGuest.model";
import bookingModel from "../models/booking.model";
import meetingModel from "../models/meeting.model";

//create prospective guest
export const createProspectiveGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone, company, description } = req.body;
    const { error } = prospectiveGuestSchema.validate({
      name,
      email,
      phone,
      company,
      description,
    });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }

    const newGuest = await ProspectiveGuest.create({
      name,
      email,
      phone,
      company,
      description,
    });

    res.json({
      success: true,
      newGuest,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0]; // Get the duplicate field name

      if (duplicateField === "phone") {
        next(errorHandler(400, "Mobile number already taken."));
        return;
      }
    }
    console.log("Prospective guest creation error:", error);
    next(errorHandler(500, "server error prospective guest creation failed"));
  }
};

//get all prospective guests
export const getAllProspectiveGuests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const searchTerm = req.query.search;
    let query = {};

    if (searchTerm) {
      query = {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
          { phone: { $regex: searchTerm, $options: "i" } },
          { company: { $regex: searchTerm, $options: "i" } },
        ],
      };
    }

    const prospectiveGuests = await ProspectiveGuest.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalCount = await ProspectiveGuest.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      prospectiveGuests,
      totalPages,
    });
  } catch (error) {
    console.log("error at fetching prospective guests:", error);
    next(errorHandler(500, "server error fetching prospective guests failed"));
  }
};

//edit prospective guest

export const editProspectiveGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { values } = req.body;
    const { id } = req.params;
    const { error } = prospectiveGuestSchema.validate(values);
    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }

    const updatedProspectiveGuest = await ProspectiveGuest.findByIdAndUpdate(
      id,
      { $set: values },
      { new: true, runValidators: true }
    );

    if (!updatedProspectiveGuest) {
      next(errorHandler(404, "Prospective Guest not found"));
      return;
    }

    res.json({ success: true, updatedProspectiveGuest });
  } catch (error: any) {
    console.log("update prospective guest error:", error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0]; // Get the duplicate field name

      if (duplicateField === "phone") {
        next(errorHandler(400, "Mobile number already taken."));
        return;
      }
    }
    next(errorHandler(500, "server error update Prospective Guest failed"));
  }
};

//delete prospective guest
export const deleteProspectiveGuest = async (
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

    // Check if guest exists
    const prospectiveGuest = await ProspectiveGuest.findById(id);
    if (!prospectiveGuest) {
      next(errorHandler(404, "Prospective Guest not found"));
      return;
    }

    await bookingModel.updateMany(
      { "prospectiveGuest._id": id },
      { $unset: { prospectiveGuest: "" } }
    );

    await meetingModel.deleteMany({ prospectiveGuestId: id });

    await ProspectiveGuest.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Prospective Guest deleted successfully",
    });
  } catch (error) {
    console.log("Guest delete error:", error);
    next(errorHandler(500, "server error Guest delete failed"));
  }
};

//get name and id of prospective guests
export const getNameAndId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const prospectiveGuests = await ProspectiveGuest.find(
      {},
      { name: 1, _id: 1 }
    );
    res.json({
      success: true,
      prospectiveGuests,
    });
  } catch (error) {
    console.log("error at fetching prospective guests:", error);
    next(errorHandler(500, "server error fetching prospective guests failed"));
  }
};
