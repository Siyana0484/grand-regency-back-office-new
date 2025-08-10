import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { setNewPasswordApi } from "../apis/authApi";
import { newPasswordSchema } from "../schemas";
import { Success } from "../helpers/popup";

const NewPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: newPasswordSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      const resp = await setNewPasswordApi(values.newPassword, token);
      setIsLoading(false);
      if (resp.success) {
        Success(resp.message);
        navigate("/login");
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Set New Password
            </h2>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium text-gray-900">
                New Password
              </label>
              <input
                {...formik.getFieldProps("newPassword")}
                type="password"
                className="w-full pl-3 pr-10 py-3 sm:py-4 border rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  outline-none transition-all duration-200"
                placeholder="Enter new Password"
              />
              {formik.touched.newPassword && formik.errors.newPassword && (
                <div className="text-sm text-red-500 mt-1">
                  {formik.errors.newPassword}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium text-gray-900">
                Confirm Password
              </label>
              <input
                {...formik.getFieldProps("confirmPassword")}
                type="password"
                className="w-full pl-3 pr-10 py-3 sm:py-4 border rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  outline-none transition-all duration-200"
                placeholder="Confirm your Password"
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <div className="text-sm text-red-500 mt-1">
                    {formik.errors.confirmPassword}
                  </div>
                )}
            </div>

            {/* Submit Button with Loading State */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-3 sm:py-4 text-sm sm:text-base font-semibold
                text-white bg-blue-600 rounded-lg transition-colors duration-200 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  isLoading
                    ? "cursor-not-allowed opacity-75"
                    : "hover:bg-blue-700"
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    />
                  </svg>
                  Changing...
                </div>
              ) : (
                "Change Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPassword;
