import { AxiosError, AxiosInstance } from "axios";
import { Failed } from "../helpers/popup";

//get all Roles
export const getAllRoles = async (axiosPrivate: AxiosInstance) => {
  try {
    const response = await axiosPrivate.get(`/v1/role`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("fetch all roles Error:", error);
      Failed(error.response?.data?.message || "Failed to fetch roles.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//add new role
export const addNewRole = async (
  axiosPrivate: AxiosInstance,
  values: {
    roleName: string;
    permissions: string[];
  }
) => {
  try {
    const response = await axiosPrivate.post(`/v1/role`, values);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("add Role Error:", error);
      Failed(error.response?.data?.message || "Failed to add Role");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

// Update roles permissions
export const updateRolePermission = async (
  axiosPrivate: AxiosInstance,
  values: {
    permissions: string[];
  },
  id: string
) => {
  try {
    const response = await axiosPrivate.patch(`/v1/role/${id}`, values);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("update role permissions Error:", error);
      Failed(error.response?.data?.message || "Failed to update permissions.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//delete role
export const deleteRole = async (axiosPrivate: AxiosInstance, id: string) => {
  try {
    const response = await axiosPrivate.delete(`/v1/role/${id}`);

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("delete role Error:", error);
      Failed(error.response?.data?.message || "Failed to delete role.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};
