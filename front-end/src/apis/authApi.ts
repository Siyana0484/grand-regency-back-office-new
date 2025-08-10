import { Failed } from "../helpers/popup";
import { LoginData, LoginResponse } from "../types";
import axios from "./axios";
import { AxiosError } from "axios";

export const loginApi = async (
  values: LoginData
): Promise<LoginResponse | undefined> => {
  try {
    const response = await axios.post<LoginResponse>("/v1/auth/login", values);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Login API Error:", error);

      // Show an error message if available in response
      Failed(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred. Please try again.");
    }
  }
};

//send otp for reset password
export const sendOtpApi = async (email: string) => {
  try {
    const response = await axios.post(`/v1/auth/reset-password`, { email });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("send otp Error:", error);
      Failed(error.response?.data?.message || "Failed to send otp.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};

//set new password

export const setNewPasswordApi = async (
  password: string,
  token: string | undefined
) => {
  try {
    const response = await axios.post(`/v1/auth/change-password`, {
      token,
      password,
    });

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("password update Error:", error);
      Failed(error.response?.data?.message || "Failed to update password.");
    } else {
      console.error("Unexpected Error:", error);
      Failed("An unexpected error occurred.");
    }
  }
};
