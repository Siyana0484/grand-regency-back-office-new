import { useFormik } from "formik";
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { userSchema } from "../../schemas";
import { addNewUser } from "../../apis/userApi";
import { Success } from "../../helpers/popup";

interface User {
  _id: string;
  name: string;
  phone: string;
  email: string;
  roles: { _id: string; roleName: string }[];
}

interface AddUserModalProps {
  closeModal: () => void;
  updateUsers: (callback: (prevUsers: User[]) => User[]) => void;
  availableRoles: { _id: string; roleName: string }[];
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  closeModal,
  availableRoles,
  updateUsers,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      roles: [] as string[],
    },
    validationSchema: userSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const updatedValues = { ...values, roles: selectedRoles };

        // Use Axios Private instance for API call
        const resp = await addNewUser(axiosPrivate, updatedValues);
        if (resp.success) {
          updateUsers((prev) => [resp?.newUser, ...prev]);
          closeModal();
          Success(resp?.message);
        }
      } catch (error) {
        console.error("Error adding user:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleRoleChange = (roleId: string) => {
    const updatedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter((r) => r !== roleId)
      : [...selectedRoles, roleId];

    setSelectedRoles(updatedRoles);
    formik.setFieldValue("roles", updatedRoles);
  };

  return (
    <div className="fixed inset-0 modal_bg bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={closeModal}
        >
          <AiOutlineClose className="text-2xl" />
        </button>

        <h2 className="text-2xl font-semibold mb-5 text-center">
          Add New User
        </h2>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Two-Column Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                name="name"
                placeholder="Name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border p-3 rounded w-full focus:outline-blue-400"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-sm">{formik.errors.name}</p>
              )}
            </div>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border p-3 rounded w-full focus:outline-blue-400"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm">{formik.errors.email}</p>
              )}
            </div>
          </div>

          {/* Single-row inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border p-3 rounded w-full focus:outline-blue-400"
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-sm">{formik.errors.phone}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border p-3 rounded w-full focus:outline-blue-400"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm">{formik.errors.password}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="mt-3">
            <h3 className="text-sm font-semibold mb-2">Assign Roles:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border p-2 rounded">
              {availableRoles.map(({ _id, roleName }) => (
                <label
                  key={_id}
                  className={`flex items-center gap-2 border px-4 py-2 rounded-md cursor-pointer transition ${
                    selectedRoles.includes(_id)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedRoles.includes(_id)}
                    onChange={() => handleRoleChange(_id)}
                  />
                  {roleName}
                </label>
              ))}
            </div>
            {formik.errors.roles && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.roles}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-5">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`px-4 py-2 rounded-md shadow-md transition cursor-pointer ${
                formik.isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {formik.isSubmitting ? "Adding..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
