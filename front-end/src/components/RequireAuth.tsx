import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { CustomJwtPayload } from "../types";

interface RequireAuthProps {
  allowedPermission: string[]; // Correctly defining the type
}
const RequireAuth: React.FC<RequireAuthProps> = ({ allowedPermission }) => {
  const { auth } = useAuth();
  const location = useLocation();

  const decoded = auth?.accessToken
    ? jwtDecode<CustomJwtPayload>(auth.accessToken)
    : undefined;

  const permissions = decoded?.permission || [];
  return permissions?.find((permission) =>
    allowedPermission?.includes(permission)
  ) ? (
    <Outlet />
  ) : auth?.accessToken ? (
    <Navigate to="/unauthorized" state={{ from: location }} replace />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default RequireAuth;
