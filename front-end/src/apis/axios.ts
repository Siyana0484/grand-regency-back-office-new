import axios from "axios";

export default axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string,
  withCredentials: true,
});

export const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL as string,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
