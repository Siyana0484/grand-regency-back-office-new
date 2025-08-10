import { AxiosError, AxiosInstance } from "axios";
import { Failed } from "../helpers/popup";
import { Meeting } from "../types";

//get meetings by id
export const getMeetingsById = async (
  axiosPrivate: AxiosInstance,
  id: string | undefined,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await axiosPrivate.get(`/v1/meeting/${id}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch meeting Error:", error);
      Failed(error.response?.data?.message || "Failed to fetch meeting.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

// create meeting
export const createMeeting = async (
  axiosPrivate: AxiosInstance,
  values: {
    prospectiveGuestId: string | undefined;
    date: string;
    remarks: string;
    attendies: string[];
  }
) => {
  try {
    const response = await axiosPrivate.post(`/v1/meeting`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("meeting creation Error:", error);
      Failed(error.response?.data?.message || "Failed to create meeting.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//edit meeting
export const editMeeting = async (
  axiosPrivate: AxiosInstance,
  values: Meeting,
  id: string | undefined
) => {
  try {
    const response = await axiosPrivate.put(`/v1/meeting/${id}`, {
      values,
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("meeting edit Error:", error);
      Failed(error.response?.data?.message || "Failed to update meeting.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//delete meeting
export const deleteMeeting = async (
  axiosPrivate: AxiosInstance,
  id: string | undefined
) => {
  try {
    const response = await axiosPrivate.delete(`/v1/meeting/${id}`);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("delete meeting Error:", error);
      Failed(error.response?.data?.message || "Failed to delete meeting.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};
