import { useFormik } from "formik";
import { loginSchema } from "../schemas";
import { loginApi } from "../apis/authApi";
import { Link, useNavigate } from "react-router-dom";
import "../scss/login.scss";
import { Success } from "../helpers/popup";
import { useAuth } from "../hooks/useAuth";
import { usePermissionStore } from "../stores/permissionStore";
import { CustomJwtPayload } from "../types";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const { setAuth } = useAuth();
  const { setPermissions, setRoles } = usePermissionStore();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      const result = await loginApi(values);
      const accessToken = result?.accessToken;
      const username = result?.username;
      setAuth({ username, accessToken });
      const decoded = accessToken
        ? jwtDecode<CustomJwtPayload>(accessToken)
        : undefined;
      const permissions = decoded?.permission || [];
      const roles = decoded?.roles || [];
      setPermissions(permissions);
      setRoles({ name: username ?? "", roles });
      Success(result?.message);
      navigate("/profile");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 login-parent">
      <div className="absolute top-0 left-0 p-4">
        <img
          src="/images/logo.png"
          alt="Grand Regency Logo"
          className="w-32 xl:w-40 h-auto"
        />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Login
            </h2>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Email Section */}
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium text-gray-900">
                Email
              </label>
              <div className="relative flex items-center mt-2">
                <input
                  {...formik.getFieldProps("email")}
                  type="email"
                  className="w-full pl-4 pr-4 py-3 sm:py-4 border rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   outline-none transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className="text-sm text-red-500 mt-1">
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Password Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-sm sm:text-base font-medium text-gray-900">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-rose-500 hover:text-rose-600 
                  transition-colors duration-200 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative flex items-center mt-2">
                <input
                  {...formik.getFieldProps("password")}
                  type="password"
                  className="w-full pl-4 pr-4 py-3 sm:py-4 border rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   outline-none transition-all duration-200"
                  placeholder="Enter your Password"
                />
              </div>

              {formik.touched.password && formik.errors.password && (
                <div className="text-sm text-red-500 mt-1">
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`w-full px-4 py-3 sm:py-4 text-sm sm:text-base font-semibold cursor-pointer
                 text-white bg-blue-600 hover:bg-blue-700 rounded-lg
                 transition-colors duration-200 focus:outline-none 
                 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${formik.isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {formik.isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
