import { AxiosError, AxiosInstance } from "axios";
import { Failed } from "../helpers/popup";
import { CreateBooking } from "../types";

//create booking
export const createBooking = async (
  axiosPrivate: AxiosInstance,
  values: CreateBooking,
  folder: string,
  guestId: string
) => {
  try {
    const response = await axiosPrivate.post(`/v1/booking`, {
      values,
      folder,
      guestId,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error(" booking creation Error:", error);
      Failed(error.response?.data?.message || "Failed to create booking.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

// save booking files
export const saveBookingFiles = async (
  axiosPrivate: AxiosInstance,
  values: {
    uploadedFiles: string[] | undefined;
    bookingId: string | undefined;
  }
) => {
  try {
    const response = await axiosPrivate.patch(`/v1/booking`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("save booking file Error:", error);
      Failed(error.response?.data?.message || "Failed to save booking files.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//get all bookings
export const getAllBookings = async (
  axiosPrivate: AxiosInstance,
  search: string = "",
  checkInDate: string = "",
  checkOutDate: string = "",
  dob: string = "",
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await axiosPrivate.get("/v1/booking", {
      params: {
        page,
        limit,
        search: search || undefined,
        checkInDate: checkInDate || undefined,
        checkOutDate: checkOutDate || undefined,
        dob: dob || undefined,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch all bookings Error:", error);
      Failed(error.response?.data?.message || "Failed to fetch bookings.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//edit booking
export const editBooking = async (
  axiosPrivate: AxiosInstance,
  values: CreateBooking,
  folder: string,
  bookingId: string | undefined,
  removedFiles: string[] | undefined
) => {
  try {
    const response = await axiosPrivate.put(`/v1/booking/${bookingId}`, {
      values,
      folder,
      removedFiles,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("booking edit Error:", error);
      Failed(error.response?.data?.message || "Failed to update booking.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

// add additional cost
export const addAdditionalCost = async (
  axiosPrivate: AxiosInstance,
  values: { item: string; cost: string },
  type: string,
  bookingId: string
) => {
  try {
    const response = await axiosPrivate.patch(`/v1/booking/${bookingId}`, {
      values,
      type,
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("additional cost Error:", error);
      Failed(
        error.response?.data?.message || "Failed to update additional cost."
      );
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

// delete additional cost
export const deleteAdditionalCost = async (
  axiosPrivate: AxiosInstance,
  values: { item: string; cost: string },
  type: string,
  bookingId: string
) => {
  try {
    const response = await axiosPrivate.patch(
      `/v1/booking/${type}/${bookingId}`,
      {
        values,
      }
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("additional cost delete Error:", error);
      Failed(
        error.response?.data?.message || "Failed to delete additional cost."
      );
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//delete booking

export const deleteBooking = async (
  axiosPrivate: AxiosInstance,
  id: string
) => {
  try {
    const response = await axiosPrivate.delete(`/v1/booking/${id}`);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("delete booking Error:", error);
      Failed(error.response?.data?.message || "Failed to delete booking.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//get bookings by id
export const getBookingsById = async (
  axiosPrivate: AxiosInstance,
  id: string | undefined,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await axiosPrivate.get(`/v1/booking/${id}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch bookings Error:", error);
      Failed(error.response?.data?.message || "Failed to fetch bookings.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};
