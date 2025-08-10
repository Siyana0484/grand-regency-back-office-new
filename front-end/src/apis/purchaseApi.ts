import { AxiosError, AxiosInstance } from "axios";
import { Failed } from "../helpers/popup";
import { CreatePurchase } from "../types";

//create purchase
export const createPurchase = async (
  axiosPrivate: AxiosInstance,
  values: CreatePurchase,
  folder: string,
  vendorId: string
) => {
  try {
    const response = await axiosPrivate.post(`/v1/purchase`, {
      values,
      folder,
      vendorId,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("purchase creation Error:", error);
      Failed(error.response?.data?.message || "Failed to create purchase.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

// save booking files
export const savePurchaseFiles = async (
  axiosPrivate: AxiosInstance,
  values: {
    uploadedFiles: string[] | undefined;
    purchaseId: string | undefined;
  }
) => {
  try {
    const response = await axiosPrivate.patch(`/v1/purchase`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("purchase file saving Error:", error);
      Failed(error.response?.data?.message || "Failed to save purchase files.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//get all purchases
export const getAllPurchases = async (
  axiosPrivate: AxiosInstance,
  search: string = "",
  startPurchaseFilter: string = "",
  endPurchaseFilter: string = "",
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await axiosPrivate.get("/v1/purchase", {
      params: {
        page,
        limit,
        search: search || undefined,
        startPurchaseDate: startPurchaseFilter || undefined,
        endPurchaseDate: endPurchaseFilter || undefined,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch all purchases Error:", error);
      Failed(
        error.response?.data?.message || "Failed to fetch purchases data."
      );
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//edit purchase
export const editPurchase = async (
  axiosPrivate: AxiosInstance,
  values: CreatePurchase,
  folder: string,
  purchaseId: string | undefined,
  removedFiles: string[] | undefined
) => {
  try {
    const response = await axiosPrivate.put(`/v1/purchase/${purchaseId}`, {
      values,
      folder,
      removedFiles,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("purchase updation Error:", error);
      Failed(error.response?.data?.message || "Failed to update purchase.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//delete purchase

export const deletePurchase = async (
  axiosPrivate: AxiosInstance,
  id: string
) => {
  try {
    const response = await axiosPrivate.delete(`/v1/purchase/${id}`);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("delete purchase Error:", error);
      Failed(error.response?.data?.message || "Failed to delete purchase.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};
