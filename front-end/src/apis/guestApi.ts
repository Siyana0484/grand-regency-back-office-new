import { Failed } from "../helpers/popup";
import axios, { AxiosInstance, AxiosError } from "axios";
import { GuestType } from "../types";

//add new user
export const verifieNumber = async (
  axiosPrivate: AxiosInstance,
  values: {
    phoneNumber: string;
  }
) => {
  try {
    const response = await axiosPrivate.post(`/v1/guest/verfy-number`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("verify guest number Error:", error);
      Failed(error.response?.data?.message || "Failed to verify guest number.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

export const createGuest = async (
  axiosPrivate: AxiosInstance,
  values: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    address: string;
    documents: string[];
  }
) => {
  try {
    const response = await axiosPrivate.post(`/v1/guest`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("guest creation Error:", error);
      Failed(error.response?.data?.message || "Failed to create guest.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

// upload files to s3
export const uploadToS3 = async (
  signedUrls: { fileName: string; signedUrl: string }[],
  files: File[]
) => {
  try {
    await Promise.all(
      signedUrls.map(async ({ signedUrl }, index) => {
        const file = files[index];
        if (!file) return null;

        await axios.put(signedUrl, file, {
          headers: { "Content-Type": "application/pdf" },
        });
      })
    );

    return signedUrls.map(({ fileName }) => fileName);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("S3 Upload Error:", error);
      Failed(error.response?.data?.message || "Failed to upload files.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

// save guest files
export const saveGuestFiles = async (
  axiosPrivate: AxiosInstance,
  values: {
    uploadedFiles: string[] | undefined;
    guestId: string;
  }
) => {
  try {
    const response = await axiosPrivate.patch(`/v1/guest`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("guest files save Error:", error);
      Failed(error.response?.data?.message || "Failed to create guest.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//get all guest
export const getAllGuests = async (
  axiosPrivate: AxiosInstance,
  page = 1,
  limit = 5,
  searchTerm = ""
) => {
  try {
    const response = await axiosPrivate.get(
      `/v1/guest?page=${page}&limit=${limit}&search=${encodeURIComponent(
        searchTerm
      )}`
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch all guest Error:", error);
      Failed(error.response?.data?.message || "Failed to fetch guests.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//edit guest
export const editGuest = async (
  axiosPrivate: AxiosInstance,
  values: GuestType,
  id: string,
  removedFiles: string[] | undefined
) => {
  try {
    const response = await axiosPrivate.put(`/v1/guest/${id}`, {
      values,
      removedFiles,
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("guest updation Error:", error);
      Failed(error.response?.data?.message || "Failed to update guest.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//delete guest
export const deleteGuest = async (axiosPrivate: AxiosInstance, id: string) => {
  try {
    const response = await axiosPrivate.delete(`/v1/guest/${id}`);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("delete guest Error:", error);
      Failed(error.response?.data?.message || "Failed to delete guest.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};
