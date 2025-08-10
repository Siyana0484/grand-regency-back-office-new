import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/customError";
import { numberSchema, vendorSchema } from "../utils/validator";
import Vendor from "../models/vendor.model";
import Purchase from "../models/purchase.model";

//verify vendor phone number
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

    //check is the vendor existed
    const existVendor = await Vendor.find({ phone: phoneNumber });

    if (existVendor.length === 0) {
      res.json({ exists: false });
      return;
    }

    res.status(200).json({ exists: true, vendor: existVendor });
  } catch (error: any) {
    console.log("vendor phone verify error:", error);
    next(errorHandler(500, "server error verify mobile failed"));
  }
};

//create vendor

export const createVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone, address, contactPerson, gstin } = req.body;
    const { error } = vendorSchema.validate(
      { name, email, phone, address, contactPerson, gstin },
      { abortEarly: false }
    );
    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }

    const newVendor = await Vendor.create({
      name,
      email,
      phone,
      address,
      contactPerson,
      gstin,
    });

    res.json({
      success: true,
      vendor: {
        name: newVendor.name,
        phone: newVendor.phone,
        _id: newVendor._id,
      },
    });
  } catch (error: any) {
    console.log("vendor creation error:", error);
    next(errorHandler(500, "server error vendor creation failed"));
  }
};

//get all vendors
export const getAllVendors = async (
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
        { gstin: { $regex: searchTerm, $options: "i" } },
        { contactPerson: { $regex: searchTerm, $options: "i" } },
      ],
    };

    const vendors = await Vendor.find(query).skip(skip).limit(Number(limit));

    const totalCount = await Vendor.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      vendors,
      totalPages,
    });
  } catch (error) {
    console.log("error at fetching vendors:", error);
    next(errorHandler(500, "server error fetching vendors failed"));
  }
};

//edit vendor

export const editVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { values } = req.body;
    const { id } = req.params;
    const { error } = vendorSchema.validate(values);
    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { $set: values },
      { new: true, runValidators: true }
    );

    if (!updatedVendor) {
      next(errorHandler(404, "Vendor not found"));
      return;
    }

    res.json({ success: true, updatedVendor });
  } catch (error: any) {
    console.log("update vendor error:", error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0]; // Get the duplicate field name

      if (duplicateField === "phone") {
        next(errorHandler(400, "Mobile number already taken."));
        return;
      }
    }
    next(errorHandler(500, "server error update vendor failed"));
  }
};

//delete vendor
export const deleteVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      next(errorHandler(400, "Vendor not found"));
      return;
    }

    // Check if vendor exists
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      next(errorHandler(404, "Vendor not found"));
      return;
    }

    // Delete all purchases related to this vendor
    await Purchase.deleteMany({ vendorId: id });

    await Vendor.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    console.log("vendor delete error:", error);
    next(errorHandler(500, "server error vendor delete failed"));
  }
};
