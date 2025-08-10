import { AxiosError, AxiosInstance } from "axios";
import { Failed } from "../helpers/popup";
import { ProspectiveGuest } from "../types";

// create prospective guest
export const createProspectiveGuest = async (
  axiosPrivate: AxiosInstance,
  values: {
    name: string;
    email: string;
    phone: string;
    company: string;
    description: string;
  }
) => {
  try {
    const response = await axiosPrivate.post(`/v1/prospective-guest`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("prospectiv guest creation Error:", error);
      Failed(
        error.response?.data?.message || "Failed to create prospective guest."
      );
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//get all prospective guests
export const getAllProspectiveGuest = async (
  axiosPrivate: AxiosInstance,
  search: string = "",
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await axiosPrivate.get("/v1/prospective-guest", {
      params: {
        page,
        limit,
        search: search || undefined,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch prospective guest Error:", error);
      Failed(
        error.response?.data?.message || "Failed to fetch prospective guest."
      );
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//edit ProspectiveGuest
export const editProspectiveGuest = async (
  axiosPrivate: AxiosInstance,
  values: ProspectiveGuest,
  id: string | undefined
) => {
  try {
    const response = await axiosPrivate.put(`/v1/prospective-guest/${id}`, {
      values,
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("prospective guest edit Error:", error);
      Failed(
        error.response?.data?.message || "Failed to update prospective guest."
      );
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//delete prospective guest
export const deleteProspectiveGuest = async (
  axiosPrivate: AxiosInstance,
  id: string | undefined
) => {
  try {
    const response = await axiosPrivate.delete(`/v1/prospective-guest/${id}`);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("delete prospective guest Error:", error);
      Failed(
        error.response?.data?.message || "Failed to delete prospective guest."
      );
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//get all prospective guests
export const getAllProspectiveGuestNameAndId = async (
  axiosPrivate: AxiosInstance
) => {
  try {
    const response = await axiosPrivate.get("/v1/prospective-guest/name-id");
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch prospective guest Error:", error);
      Failed(
        error.response?.data?.message || "Failed to fetch prospective guest."
      );
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};
