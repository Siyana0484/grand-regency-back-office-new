import React from "react";
import { useFormik } from "formik";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { passwordSchema } from "../../schemas";
import { resetUserPassword } from "../../apis/userApi";
import { Success } from "../../helpers/popup";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const response = await resetUserPassword(axiosPrivate, values);
        if (response?.success) Success("password updated successfully");
        resetForm();
        onClose();
      } catch (err) {
        console.log("err at reseting password", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center modal_bg bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={formik.handleSubmit}>
          {/* Old Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Old Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md"
              {...formik.getFieldProps("oldPassword")}
            />
            {formik.touched.oldPassword && formik.errors.oldPassword && (
              <p className="text-red-500 text-sm">
                {formik.errors.oldPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md"
              {...formik.getFieldProps("newPassword")}
            />
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="text-red-500 text-sm">
                {formik.errors.newPassword}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white cursor-pointer ${
                formik.isSubmitting
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500"
              }`}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
