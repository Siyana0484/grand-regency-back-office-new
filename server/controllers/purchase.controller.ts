import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../utils/customError";
import Purchase from "../models/purchase.model";
import { purchaseSchema } from "../utils/validator";
import putObjects, { deleteObject } from "../utils/aws";

//get all purchases
export const getAllPurchases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let {
      search,
      startPurchaseDate,
      endPurchaseDate,
      page = 1,
      limit = 5,
    } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 5;
    const skip = (pageNum - 1) * limitNum;

    // Create filter object
    let filter: any = {};

    // Apply date filters if provided
    if (startPurchaseDate || endPurchaseDate) {
      filter["purchaseDate"] = {};
      if (startPurchaseDate) {
        filter["purchaseDate"]["$gte"] = new Date(startPurchaseDate as string);
      }
      if (endPurchaseDate) {
        filter["purchaseDate"]["$lte"] = new Date(endPurchaseDate as string);
      }
    }

    // Search filter (including grcNumber)
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { "vendor.name": { $regex: search, $options: "i" } },
          { "vendor.email": { $regex: search, $options: "i" } },
          { "vendor.phone": { $regex: search, $options: "i" } },
          { "vendor.address": { $regex: search, $options: "i" } },
          { "vendor.gstin": { $regex: search, $options: "i" } },
          { item: { $regex: search, $options: "i" } },
          { invoiceNumber: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Aggregation pipeline to join Booking with Guest collection
    const purchases = await Purchase.aggregate([
      {
        $lookup: {
          from: "vendors", // Vendor collection name
          localField: "vendorId",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: "$vendor" }, // Flatten the vendor array
      { $match: { ...filter, ...searchFilter } }, // Apply filters
      { $sort: { checkInDate: -1, createdAt: -1 } },
      { $skip: skip }, // Pagination
      { $limit: limitNum },
      {
        $project: {
          _id: 1,
          item: 1,
          quantity: 1,
          invoiceNumber: 1,
          warrantyPeriod: 1,
          value: 1,
          documents: 1,
          purchaseDate: 1,
          "vendor.name": 1,
          "vendor.email": 1,
          "vendor.phone": 1,
          "vendor.address": 1,
          "vendor.gstin": 1,
        },
      },
    ]);

    // Get total count of filtered bookings
    const totalPurchases = await Purchase.aggregate([
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendor",
        },
      },
      { $unwind: "$vendor" },
      { $match: { ...filter, ...searchFilter } },
      { $count: "totalCount" },
    ]);
    const totalCount =
      totalPurchases.length > 0 ? totalPurchases[0].totalCount : 0;
    const totalPages = Math.ceil(totalCount / limitNum);
    res.json({
      success: true,
      purchases,
      totalPages,
    });
  } catch (error) {
    console.log("error at fetching purchases:", error);
    next(errorHandler(500, "server error fetching purchases failed"));
  }
};

//create purchase
export const createPurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { values, folder, vendorId } = req.body;
    const { error } = purchaseSchema.validate(values);
    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", "); // Convert array to a string

      next(errorHandler(400, errorMessages));
      return;
    }

    if (!folder || !vendorId) {
      next(errorHandler(400, "missing parameters"));
      return;
    }
    // Step 1: Create the purchase in DB
    const newPurchase = await Purchase.create({
      ...values,
      vendorId,
      documents: [],
    });

    // Step 2: Generate presigned URLs for document uploads

    const signedUrls = await putObjects(values.documents, folder);
    res.json({ purchaseId: newPurchase._id, signedUrls });
  } catch (error: any) {
    console.log("get signed url error in purchase:", error);
    next(errorHandler(500, "server error get signed url failed in purchase"));
  }
};

//save purchase files
export const savePurchaseFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { purchaseId, uploadedFiles } = req.body;
    if (!purchaseId || !uploadedFiles || !Array.isArray(uploadedFiles)) {
      next(errorHandler(400, "Missing required parameters"));
      return;
    }
    // Update guest record with uploaded document details
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      { $push: { documents: uploadedFiles } },
      { new: true }
    );
    res.json({
      updatedFiles: updatedPurchase?.documents,
      success: true,
      message: "Files saved successfully",
    });
  } catch (error: any) {
    console.log("Error saving files:", error);

    next(errorHandler(500, "Failed to save file details"));
  }
};

//edit purchase

export const editpurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { values, removedFiles, folder } = req.body;
    const { id } = req.params;

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      next(errorHandler(404, "Purchase not found"));
      return;
    }
    // Delete files from S3
    if (removedFiles || removedFiles.length > 0) {
      const result = await deleteObject(removedFiles, folder);
      if (!result) {
        next(errorHandler(500, "File deletion failed"));
        return;
      }
    }
    // Remove files from database
    purchase.documents = purchase?.documents?.filter(
      (doc) => !removedFiles.includes(doc)
    );
    // Update guest information
    purchase.item = values.item;
    purchase.quantity = values.quantity;
    purchase.value = values.value;
    purchase.warrantyPeriod = values.warrantyPeriod;
    purchase.invoiceNumber = values.invoiceNumber;
    purchase.purchaseDate = values.purchaseDate;

    await purchase.save();

    // // Step 2: Generate presigned URLs for document uploads

    const signedUrls = await putObjects(values?.documents, folder);
    res.json({
      signedUrls,
      updatedPurchase: purchase,
    });
  } catch (error: any) {
    console.log("update guest error:", error);

    next(errorHandler(500, "server error update purchase failed"));
  }
};

//delete purchase

export const deletePurchase = async (
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
    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return next(errorHandler(404, "Purchase not found"));
    }

    // Extract document filenames for deletion
    const removedFiles =
      purchase?.documents?.map((file) => ({ fileName: file })) || [];

    // Delete files from S3 if they exist
    if (removedFiles.length > 0) {
      const s3DeletionSuccess = await deleteObject(removedFiles, "purchases");
      if (!s3DeletionSuccess) {
        next(errorHandler(500, "Failed to delete purchase documents from S3"));
        return;
      }
    }

    await Purchase.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Purchase deleted successfully",
    });
  } catch (error) {
    console.log("Booking delete error:", error);
    next(errorHandler(500, "server error booking delete failed"));
  }
};
