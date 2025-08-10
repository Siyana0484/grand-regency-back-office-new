import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RedirectIfAuthenticated = () => {
  const { auth } = useAuth();

  return auth?.accessToken ? <Navigate to="/profile" replace /> : <Outlet />;
};

export default RedirectIfAuthenticated;
