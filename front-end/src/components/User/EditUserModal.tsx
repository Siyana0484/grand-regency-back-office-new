import { useFormik } from "formik";
import { AiOutlineClose } from "react-icons/ai";
import { useEffect, useState } from "react";
import { UserListType } from "../../types";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { editUserSchema } from "../../schemas";
import { deleteUser, udpateUserDetails } from "../../apis/userApi";
import { Success } from "../../helpers/popup";
import { usePermissionStore } from "../../stores/permissionStore";

interface EditUserModalProps {
  user: UserListType;
  closeModal: () => void;
  updateUsers: (
    callback: (prevUsers: UserListType[]) => UserListType[]
  ) => void;
  availableRoles: { _id: string; roleName: string }[];
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  closeModal,
  updateUsers,
  availableRoles,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const { hasPermission } = usePermissionStore();
  const [loading, setLoading] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles || [],
    },

    validationSchema: editUserSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const updatedValues = {
          ...values,
          roles: values.roles.map((role) => role._id),
        };

        const resp = await udpateUserDetails(
          axiosPrivate,
          updatedValues,
          user._id
        );

        if (resp?.success) {
          updateUsers((prevUsers) =>
            prevUsers.map((u) => (u._id === user._id ? { ...u, ...values } : u))
          );
          closeModal();
          Success(resp?.message);
        }
      } catch (error) {
        console.error("Error updating user details:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    formik.setFieldValue("roles", user.roles);
  }, [user.roles]);

  const handleRoleChange = (role: { _id: string; roleName: string }) => {
    const updatedRoles = formik.values.roles.some((r) => r._id === role._id)
      ? formik.values.roles.filter((r) => r._id !== role._id) // Remove role
      : [...formik.values.roles, role]; // Add role

    formik.setFieldValue("roles", updatedRoles);
    formik.setTouched({ ...formik.touched, roles: [] });
  };

  //delete user
  const handleDelete = async () => {
    setLoading(true);
    try {
      const resp = await deleteUser(axiosPrivate, user._id);
      if (resp.success) {
        Success(resp.message);
        updateUsers((prevUser) => prevUser.filter((u) => u._id !== user._id));
        closeModal();
      } else {
        throw new Error(resp.message || "Failed to delete User.");
      }
    } catch (err) {
      console.log(err, "error deleting user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 modal_bg bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <AiOutlineClose className="text-2xl" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-8 mt-4">
          Edit User Details
        </h2>

        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700">Name</span>
              <input
                type="text"
                name="name"
                className="w-full p-3 border rounded-md"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-600 text-sm">{formik.errors.name}</p>
              )}
            </label>

            <label className="block">
              <span className="text-gray-700">Email</span>
              <input
                type="email"
                name="email"
                className="w-full p-3 border rounded-md"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-600 text-sm">{formik.errors.email}</p>
              )}
            </label>
          </div>

          <div className="mt-4">
            <label className="block">
              <span className="text-gray-700">Phone</span>
              <input
                type="text"
                name="phone"
                className="w-full p-3 border rounded-md"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-600 text-sm">{formik.errors.phone}</p>
              )}
            </label>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Assign Roles</h3>
            <div className="max-h-30 overflow-y-auto border p-2 rounded-md">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableRoles.length > 0 ? (
                  availableRoles.map((role) => (
                    <label
                      key={role._id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formik.values.roles.some(
                          (r) => r._id === role._id
                        )}
                        onChange={() => handleRoleChange(role)}
                        className="w-5 h-5"
                      />
                      {role.roleName}
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500">No roles available.</p>
                )}
              </div>
            </div>
            {formik.touched.roles &&
              formik.errors.roles &&
              typeof formik.errors.roles === "string" && (
                <p className="text-red-600 text-sm">{formik.errors.roles}</p>
              )}
          </div>

          <div className="flex justify-end mt-6 gap-3">
            {hasPermission("user:delete") && (
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md cursor-pointer"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            )}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              {formik.isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
