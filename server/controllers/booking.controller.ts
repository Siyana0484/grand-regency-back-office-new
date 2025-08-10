import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/customError";
import { bookingSchema } from "../utils/validator";
import Booking from "../models/booking.model";
import putObjects, { deleteObject } from "../utils/aws";
import { Types } from "mongoose";
import { startOfDay, endOfDay } from "date-fns";

//create booking
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { values, folder, guestId } = req.body;
    const { error } = bookingSchema.validate(values, { abortEarly: false });
    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }

    if (!folder || !guestId) {
      next(errorHandler(400, "missing parameters"));
      return;
    }
    // Step 1: Create the guest in DB
    const newBooking = await Booking.create({
      ...values,
      guestId,
      documents: [],
    });

    // Step 2: Generate presigned URLs for document uploads

    const signedUrls = await putObjects(values.documents, folder);
    res.json({ bookingId: newBooking._id, signedUrls });
  } catch (error: any) {
    console.log("get signed url error in booking:", error);
    next(errorHandler(500, "server error get signed url failed in booking"));
  }
};

//save booking files
export const saveBookingFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId, uploadedFiles } = req.body;
    if (!bookingId || !uploadedFiles || !Array.isArray(uploadedFiles)) {
      next(errorHandler(400, "Missing required parameters"));
      return;
    }
    // Update guest record with uploaded document details
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { $push: { documents: uploadedFiles } },
      { new: true }
    );
    res.json({
      updatedFiles: updatedBooking?.documents,
      success: true,
      message: "Files saved successfully",
    });
  } catch (error: any) {
    console.log("Error saving files:", error);

    next(errorHandler(500, "Failed to save file details"));
  }
};

//get all bookings
export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let {
      search,
      checkInDate,
      checkOutDate,
      dob,
      page = 1,
      limit = 5,
    } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 5;
    const skip = (pageNum - 1) * limitNum;
    console.log("dob:", dob);
    // Create filter object
    let filter: any = {};
    // Apply date filters if provided

    if (typeof checkInDate === "string") {
      const parsedCheckIn = new Date(checkInDate);
      filter["checkInDate"] = {
        $gte: startOfDay(parsedCheckIn),
        $lte: endOfDay(parsedCheckIn),
      };
    }

    if (typeof checkOutDate === "string") {
      const parsedCheckOut = new Date(checkOutDate);
      filter["checkOutDate"] = {
        $gte: startOfDay(parsedCheckOut),
        $lte: endOfDay(parsedCheckOut),
      };
    }

    if (typeof dob === "string") {
      const parsedDob = new Date(dob);
      filter["guest.dob"] = parsedDob;
    }

    // Search filter (including grcNumber)
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { "guest.name": { $regex: search, $options: "i" } },
          { "guest.email": { $regex: search, $options: "i" } },
          { "guest.phone": { $regex: search, $options: "i" } },
          { "guest.address": { $regex: search, $options: "i" } },
          { grcNumber: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Aggregation pipeline to join Booking with Guest collection
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "guests", // Guest collection name
          localField: "guestId",
          foreignField: "_id",
          as: "guest",
        },
      },
      { $unwind: "$guest" }, // Flatten the guest array
      { $match: { ...filter, ...searchFilter } }, // Apply filters
      { $sort: { checkInDate: -1, createdAt: -1 } },
      { $skip: skip }, // Pagination
      { $limit: limitNum },
      {
        $project: {
          _id: 1,
          checkInDate: 1,
          checkOutDate: 1,
          grcNumber: 1,
          roomNumber: 1,
          coStayers: 1,
          additionalPurchase: 1,
          damageCost: 1,
          documents: 1,
          prospectiveGuest: 1,
          "guest.name": 1,
          "guest.email": 1,
          "guest.phone": 1,
          "guest.address": 1,
          "guest.dob": 1,
        },
      },
    ]);

    // Get total count of filtered bookings
    const totalBookings = await Booking.aggregate([
      {
        $lookup: {
          from: "guests",
          localField: "guestId",
          foreignField: "_id",
          as: "guest",
        },
      },
      { $unwind: "$guest" },
      { $match: { ...filter, ...searchFilter } },
      { $count: "totalCount" },
    ]);
    const totalCount =
      totalBookings.length > 0 ? totalBookings[0].totalCount : 0;
    const totalPages = Math.ceil(totalCount / limitNum);
    res.json({
      success: true,
      bookings,
      totalPages,
    });
  } catch (error) {
    console.log("error at fetching users:", error);
    next(errorHandler(500, "server error fetching users failed"));
  }
};

//edit Booking

export const editBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { values, removedFiles, folder } = req.body;

    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      next(errorHandler(404, "Booking not found"));
      return;
    }
    // Delete files from S3
    if (removedFiles.length > 0) {
      const result = await deleteObject(removedFiles, folder);
      if (!result) {
        next(errorHandler(500, "File deletion failed"));
        return;
      }
    }
    // Remove files from database
    booking.documents = booking?.documents?.filter(
      (doc) => !removedFiles.includes(doc)
    );
    // Update guest information
    booking.roomNumber = values.roomNumber;
    booking.checkInDate = values.checkInDate;
    booking.checkOutDate = values.checkOutDate;
    booking.grcNumber = values.grcNumber;
    booking.coStayers = values.coStayers;
    if (values.prospectiveGuest) {
      booking.prospectiveGuest = values.prospectiveGuest;
    }

    await booking.save();

    // // Step 2: Generate presigned URLs for document uploads

    const signedUrls = await putObjects(values?.documents, folder);
    res.json({
      signedUrls,
      updatedBooking: booking,
    });
  } catch (error: any) {
    console.log("update booking error:", error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0]; // Get the duplicate field name

      if (duplicateField === "phone") {
        next(errorHandler(400, "Mobile number already taken."));
        return;
      }
    }
    next(errorHandler(500, "server error update booking failed"));
  }
};

// add additional cost
export const addAdditionalCost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { values, type } = req.body;
    if (!values || !type) {
      next(errorHandler(400, "missing parameters"));
      return;
    }
    const { id } = req.params;
    if (!id) {
      next(errorHandler(404, "id not found"));
      return;
    }
    const booking = await Booking.findById(id);

    if (!booking) {
      next(errorHandler(404, "booking not found"));
      return;
    }

    if (type === "additionalPurchase") {
      booking.additionalPurchase = booking.additionalPurchase || [];

      // Check if the item already exists
      const exists = booking.additionalPurchase.some(
        (purchase) => purchase.item === values.item
      );
      if (exists) {
        next(errorHandler(400, "Item already exists in additional purchases."));
        return;
      }

      booking.additionalPurchase.push(values);
    } else {
      booking.damageCost = booking.damageCost || [];

      // Check if the item already exists
      const exists = booking.damageCost.some(
        (damage) => damage.item === values.item
      );
      if (exists) {
        next(errorHandler(400, "Item already exists in damage costs."));
        return;
      }

      booking.damageCost.push(values);
    }

    await booking.save();
    res.status(200).json({
      success: true,
      message:
        type === "additionalPurchase"
          ? "Additional purchase added successfully"
          : "Damage cost added successfully",
    });
  } catch (error: any) {
    console.log("adding additional cost error:", error);
    next(errorHandler(500, "server error at adding additional cose"));
  }
};

//delete additional cost
export const deleteAdditionalCost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { values } = req.body;
    const { id, type } = req.params;
    if (!id || !type || !values) {
      next(errorHandler(404, "missign parameters"));
      return;
    }
    const booking = await Booking.findById(id);

    if (!booking) {
      next(errorHandler(404, "booking not found"));
      return;
    }

    if (type === "additionalPurchase") {
      booking.additionalPurchase = booking.additionalPurchase?.filter(
        (purchase) => purchase.item !== values.item
      );
    } else if (type === "damageCost") {
      booking.damageCost = booking.damageCost?.filter(
        (damage) => damage.item !== values.item
      );
    } else {
      return next(errorHandler(400, "Invalid cost type"));
    }

    await booking.save();
    res.status(200).json({
      success: true,
      message:
        type === "additionalPurchase"
          ? "purchase cost removed successfully"
          : "Damage cost removed successfully",
    });
  } catch (error: any) {
    console.log("adding additional cost error:", error);
    next(errorHandler(500, "server error at adding additional cose"));
  }
};

//delete booking

export const deleteBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      next(errorHandler(400, "ID not found"));
      return;
    }

    // Find the guest before deleting to retrieve associated files
    const booking = await Booking.findById(id);
    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    // Extract document filenames for deletion
    const removedFiles =
      booking?.documents?.map((file) => ({ fileName: file })) || [];

    // Delete files from S3 if they exist
    if (removedFiles.length > 0) {
      const s3DeletionSuccess = await deleteObject(removedFiles, "booking");
      if (!s3DeletionSuccess) {
        next(errorHandler(500, "Failed to delete booking documents from S3"));
        return;
      }
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.log("Booking delete error:", error);
    next(errorHandler(500, "server error booking delete failed"));
  }
};

//get bookings by id
export const getBookingsById = async (
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

    // Get total count of bookings for pagination
    const totalBookings = await Booking.countDocuments({
      "prospectiveGuest._id": id,
    });

    const totalPages = Math.ceil(totalBookings / limit);

    // Aggregate query with pagination
    let bookings = await Booking.aggregate([
      { $match: { "prospectiveGuest._id": new Types.ObjectId(id) } }, // Filter by prospectiveGuest
      {
        $lookup: {
          from: "guests", // Collection name for guests
          localField: "guestId",
          foreignField: "_id",
          as: "guest",
        },
      },
      { $unwind: "$guest" }, // Convert array into object
      {
        $project: {
          _id: 1,
          checkInDate: 1,
          checkOutDate: 1,
          grcNumber: 1,
          roomNumber: 1,
          coStayers: 1,
          additionalPurchase: 1,
          damageCost: 1,
          documents: 1,
          prospectiveGuest: 1,
          "guest.name": 1,
          "guest.email": 1,
          "guest.phone": 1,
          "guest.address": 1,
        },
      },
      { $sort: { checkInDate: -1 } }, // Sort by latest check-in date
      { $skip: skip }, // Skip records based on pagination
      { $limit: limit }, // Limit the number of results per page
    ]);

    res.status(200).json({
      success: true,
      bookings,
      totalPages,
    });
  } catch (error) {
    console.log("error at fetching bookings:", error);
    next(errorHandler(500, "server error fetching bookings failed"));
  }
};
