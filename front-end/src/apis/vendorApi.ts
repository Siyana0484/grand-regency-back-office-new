import { Failed } from "../helpers/popup";
import { AxiosInstance, AxiosError } from "axios";
import { VendorType } from "../types";

//verify vendor number
export const verifieVendorNumber = async (
  axiosPrivate: AxiosInstance,
  values: {
    phoneNumber: string;
  }
) => {
  try {
    const response = await axiosPrivate.post(`/v1/vendor/verfy-number`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("verify vendor number Error:", error);
      Failed(error.response?.data?.message || "Failed to verify vendor number");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

// create vendor

export const createVendor = async (
  axiosPrivate: AxiosInstance,
  values: {
    name: string;
    email: string;
    phone: string;
    address: string;
    contactPerson: string;
    gstin: string;
  }
) => {
  try {
    const response = await axiosPrivate.post(`/v1/vendor`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("vendor creation Error:", error);
      Failed(error.response?.data?.message || "Failed to create vendor");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//get all vendors
export const getAllVendors = async (
  axiosPrivate: AxiosInstance,
  page = 1,
  limit = 5,
  searchTerm = ""
) => {
  try {
    const response = await axiosPrivate.get(
      `/v1/vendor?page=${page}&limit=${limit}&search=${encodeURIComponent(
        searchTerm
      )}`
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch all vendors Error:", error);
      Failed(error.response?.data?.message || "Failed to fetch vendors data");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//edit vendor
export const editVendor = async (
  axiosPrivate: AxiosInstance,
  values: VendorType,
  id: string | undefined
) => {
  try {
    const response = await axiosPrivate.put(`/v1/vendor/${id}`, {
      values,
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("vendor edit Error:", error);
      Failed(error.response?.data?.message || "Failed to update vendor");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//delete vendor
export const deleteVendor = async (
  axiosPrivate: AxiosInstance,
  id: string | undefined
) => {
  try {
    const response = await axiosPrivate.delete(`/v1/vendor/${id}`);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("delete vendor Error:", error);
      Failed(error.response?.data?.message || "Failed to delete vendor");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};
