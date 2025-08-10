import { NextFunction, Request, response, Response } from "express";
import { errorHandler } from "../utils/customError";
import Booking from "../models/booking.model";
import { PipelineStage } from "mongoose";
import { getObjects } from "../utils/aws";
import Purchase from "../models/purchase.model";
import Guest from "../models/guest.model";

const modelMap: Record<string, any> = {
  guest: Guest,
  purchase: Purchase,
  booking: Booking,
};
//get documents

export const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const type = (req.query.type as string)?.toLowerCase();
    const Model = modelMap[type];

    if (!Model) {
      next(errorHandler(400, "File type not specified"));
      return;
    }
    const skip = (page - 1) * limit;

    const searchTerm = req.query.search as string;
    const matchStage: PipelineStage.Match = searchTerm
      ? {
          $match: {
            documents: {
              $elemMatch: {
                $regex: new RegExp(searchTerm, "i"),
              },
            },
          },
        }
      : {
          $match: {
            documents: { $exists: true, $ne: [] },
          },
        };

    const pipeline: PipelineStage[] = [
      matchStage,
      { $unwind: "$documents" },
      ...(searchTerm
        ? [
            {
              $match: {
                documents: {
                  $regex: new RegExp(searchTerm, "i"),
                },
              },
            } as PipelineStage.Match,
          ]
        : []),
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          document: "$documents",
        },
      },
    ];

    const documents = await Model.aggregate(pipeline);

    const countPipeline: PipelineStage[] = [
      matchStage,
      { $unwind: "$documents" },
      ...(searchTerm
        ? [
            {
              $match: {
                documents: {
                  $regex: new RegExp(searchTerm, "i"),
                },
              },
            } as PipelineStage.Match,
          ]
        : []),
      { $count: "total" },
    ];

    const countResult = await Model.aggregate(countPipeline);
    const totalDocuments = countResult[0]?.total || 0;
    res.json({
      success: true,
      documents: documents.map((doc: any) => doc.document),
      totalDocuments,
    });
  } catch (error) {
    console.log("error at fetching documents:", error);
    next(errorHandler(500, "server error fetching documents failed"));
  }
};

//get file download signed url
export const getDownloadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName, folder } = req.params;
    console.log("filename:", fileName, ":", "folder:", folder);
    if (!fileName || !folder) {
      next(errorHandler(404, "Missing requirements"));
      return;
    }

    // get presigned url for file

    const signedUrl = await getObjects(fileName, folder);
    res.json({
      success: true,
      signedUrl,
    });
  } catch (error: any) {
    console.log(" file download  error:", error);
    next(errorHandler(500, `server error file download failed`));
  }
};
