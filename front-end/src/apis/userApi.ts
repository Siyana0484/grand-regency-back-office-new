import { Failed } from "../helpers/popup";
import { AxiosInstance, AxiosError } from "axios";
import { UpdateUserType, UserType } from "../types";

//get user profile
export const getUserProfile = async (axiosPrivate: AxiosInstance) => {
  try {
    const response = await axiosPrivate.get("/v1/user");
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch user Error:", error);
      Failed(error.response?.data?.message || "Failed to fetch user data");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//add new user
export const addNewUser = async (
  axiosPrivate: AxiosInstance,
  values: UserType
) => {
  try {
    const response = await axiosPrivate.post(`/v1/user`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("add user Error:", error);
      Failed(error.response?.data?.message || "Failed to add user");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//update user details
export const udpateUserDetails = async (
  axiosPrivate: AxiosInstance,
  values: UpdateUserType,
  id: string
) => {
  try {
    const response = await axiosPrivate.put(`/v1/user/${id}`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("update user details Error:", error);
      Failed(error.response?.data?.message || "Failed to update user");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//reset user password
export const resetUserPassword = async (
  axiosPrivate: AxiosInstance,
  values: { oldPassword: string; newPassword: string }
) => {
  try {
    const response = await axiosPrivate.patch("/v1/user", values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("reset user password Error:", error);
      Failed(error.response?.data?.message || "Failed to reset user password");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//get all users
export const getAllUsers = async (
  axiosPrivate: AxiosInstance,
  page = 1,
  limit = 3
) => {
  try {
    const response = await axiosPrivate.get(
      `/v1/user/all?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch all users Error:", error);
      Failed(error.response?.data?.message || "Failed to fetch users data");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//delete user
export const deleteUser = async (axiosPrivate: AxiosInstance, id: string) => {
  try {
    const response = await axiosPrivate.delete(`/v1/user/${id}`);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("delete user details Error:", error);
      Failed(error.response?.data?.message || "Failed to delete user");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};
