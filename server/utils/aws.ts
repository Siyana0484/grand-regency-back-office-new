import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET!,
  },
});

const putObjects = async (
  documents: { fileName: string }[],
  folder: string
) => {
  const formatedFolderName = folder.toLowerCase();

  // Generate Signed URLs for all files
  try {
    const signedUrls = await Promise.all(
      documents.map(async (fileName) => {
        const uniqueFileName = `${Date.now()}-${uuidv4()}-${fileName}`;
        const params = {
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: `${formatedFolderName}/${uniqueFileName}`,
          ContentType: "application/pdf",
        };

        const signedUrl = await getSignedUrl(
          s3Client,
          new PutObjectCommand(params),
          {
            expiresIn: 900,
          }
        );
        return { fileName: uniqueFileName, signedUrl };
      })
    );

    return signedUrls; // Returns an array of objects with fileName & signedUrl
  } catch (error) {
    console.error("Error generating signed URLs:", error);
    throw new Error("Failed to generate signed URLs.");
  }
};

export const deleteObject = async (
  removedFiles: { fileName: string }[],
  folder: string
) => {
  const formatedFolderName = folder.toLowerCase();

  try {
    await Promise.all(
      removedFiles.map(async (fileName) => {
        const params = {
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: `${formatedFolderName}/${fileName}`,
        };

        const deleteCommand = new DeleteObjectCommand(params);
        await s3Client.send(deleteCommand);
      })
    );
    return true;
  } catch (error) {
    console.error("Error deleting files from S3:", error);
    throw new Error("Failed to delete files.");
  }
};

// get presigned url to download
export const getObjects = async (fileName: string, folder: string) => {
  const formatedFolderName = folder.toLowerCase();
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: `${formatedFolderName}/${fileName}`,
    ResponseContentDisposition: "attachment",
  });

  // Generate Signed URLs for the file
  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });

    return signedUrl; // Returns signedUrl
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL.");
  }
};

export default putObjects;
