import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/customError";
import { editGuestSchema, guestSchema, numberSchema } from "../utils/validator";
import Guest from "../models/guest.model";
import putObjects, { deleteObject, getObjects } from "../utils/aws";

//verify user phone number
export const verifyNumber = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phoneNumber } = req.body;

    const { error } = numberSchema.validate({ phoneNumber });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }

    //check is the guest existed
    const existGuest = await Guest.find({ phone: phoneNumber });

    if (existGuest.length === 0) {
      res.json({ exists: false });
      return;
    }

    res.status(200).json({ exists: true, guest: existGuest });
  } catch (error: any) {
    console.log("guest phone verify error:", error);
    next(errorHandler(500, "server error verify mobile failed"));
  }
};

//create guest

export const createGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone, dob, address, documents, folder } = req.body;
    const { error } = guestSchema.validate(
      { name, email, phone, dob, address, documents },
      { abortEarly: false }
    );
    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }
    // Step 1: Create the guest in DB
    const newGuest = await Guest.create({
      name,
      email,
      phone,
      dob,
      address,
      documents: [],
    });

    // Step 2: Generate presigned URLs for document uploads

    const signedUrls = await putObjects(documents, folder);
    res.json({ guestId: newGuest._id, signedUrls });
  } catch (error: any) {
    console.log("get signed url error:", error);
    next(errorHandler(500, "server error get signed url failed"));
  }
};

//save guest files
export const saveGuestFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { guestId, uploadedFiles } = req.body;
    if (!guestId || !uploadedFiles || !Array.isArray(uploadedFiles)) {
      next(errorHandler(400, "Missing required parameters"));
      return;
    }
    // Update guest record with uploaded document details
    const updatedGuest = await Guest.findByIdAndUpdate(
      guestId,
      { $push: { documents: uploadedFiles } },
      { new: true }
    );
    res.json({
      success: true,
      message: "Files saved successfully",
      guest: {
        name: updatedGuest?.name,
        phone: updatedGuest?.phone,
        documents: updatedGuest?.documents,
        _id: updatedGuest?._id,
      },
    });
  } catch (error: any) {
    console.log("Error saving files:", error);

    next(errorHandler(500, "Failed to save file details"));
  }
};

//get all guest
export const getAllGuests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const skip = (page - 1) * limit;

    const searchTerm = req.query.search;
    const query = {
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
        { address: { $regex: searchTerm, $options: "i" } },
      ],
    };

    const guests = await Guest.find(query).skip(skip).limit(Number(limit));

    const totalGuest = await Guest.countDocuments();

    res.json({
      success: true,
      guests,
      totalGuest,
    });
  } catch (error) {
    console.log("error at fetching guest:", error);
    next(errorHandler(500, "server error fetching guest failed"));
  }
};

//edit guest

export const editGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { values, removedFiles } = req.body;
    const { error } = editGuestSchema.validate(
      {
        name: values.name,
        email: values.email,
        phone: values.phone,
        dob: values.dob,
        address: values.address,
      },
      { abortEarly: false }
    );
    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }
    const { id } = req.params;

    const guest = await Guest.findById(id);
    if (!guest) {
      next(errorHandler(404, "Guest not found"));
      return;
    }
    // Delete files from S3
    if (removedFiles.length > 0) {
      const result = await deleteObject(removedFiles, values.folder);
      if (!result) {
        next(errorHandler(500, "File deletion failed"));
        return;
      }
    }
    // Remove files from database
    guest.documents = guest?.documents?.filter(
      (doc) => !removedFiles.includes(doc)
    );
    // Update guest information
    guest.name = values.name;
    guest.email = values.email;
    guest.phone = values.phone;
    guest.dob = values.dob;
    guest.address = values.address;

    await guest.save();

    // // Step 2: Generate presigned URLs for document uploads

    const signedUrls = await putObjects(values?.documents, values?.folder);
    res.json({
      signedUrls,
      updatedGuest: {
        _id: guest._id,
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        dob: guest.dob,
        address: guest.address,
      },
    });
  } catch (error: any) {
    console.log("update guest error:", error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0]; // Get the duplicate field name

      if (duplicateField === "phone") {
        next(errorHandler(400, "Mobile number already taken."));
        return;
      }
    }
    next(errorHandler(500, "server error update guest failed"));
  }
};

//delete a guest
export const deleteGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      next(errorHandler(400, "Guest not found"));
      return;
    }

    // Find the guest before deleting to retrieve associated files
    const guest = await Guest.findById(id);
    if (!guest) {
      return next(errorHandler(404, "Guest not found"));
    }

    // Extract document filenames for deletion
    const removedFiles =
      guest?.documents?.map((file) => ({ fileName: file })) || [];

    // Delete files from S3 if they exist
    if (removedFiles.length > 0) {
      const s3DeletionSuccess = await deleteObject(removedFiles, "guest");
      if (!s3DeletionSuccess) {
        next(errorHandler(500, "Failed to delete guest documents from S3"));
        return;
      }
    }

    await Guest.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Guest deleted successfully",
    });
  } catch (error) {
    console.log("Guest delete error:", error);
    next(errorHandler(500, "server error Guest delete failed"));
  }
};
