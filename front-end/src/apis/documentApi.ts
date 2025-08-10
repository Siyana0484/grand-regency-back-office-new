import { AxiosError, AxiosInstance } from "axios";
import { Failed } from "../helpers/popup";

//get document details
export const getDocumentDetails = async (
  axiosPrivate: AxiosInstance,
  search: string = "",
  page: number = 1,
  limit: number = 5,
  type: string
) => {
  try {
    const response = await axiosPrivate.get(`/v1/document/${type}`, {
      params: {
        type,
        page,
        limit,
        search: search || undefined,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch guest documents Error:", error);
      Failed(error.response?.data?.message || "Failed to fetch documents.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//get file download url
export const fileDownloadUrl = async (
  axiosPrivate: AxiosInstance,
  fileName: string,
  type: string
) => {
  try {
    // Map the type to the corresponding folder
    const folderMap: Record<string, string> = {
      guest: "guest",
      purchase: "purchases",
      booking: "booking",
    };
    const folder = folderMap[type] || "default";
    const response = await axiosPrivate.get(
      `/v1/document/${type}/${fileName}/${folder}`
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("file download Error:", error);
      Failed(error.response?.data?.message || "Failed to download file.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};
