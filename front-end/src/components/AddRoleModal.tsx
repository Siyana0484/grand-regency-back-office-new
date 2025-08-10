import { useFormik } from "formik";
import { useState } from "react";
import { roleSchema } from "../schemas";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { addNewRole } from "../apis/roleApi";
import { Success } from "../helpers/popup";

interface Role {
  _id: string;
  roleName: string;
  permissions: string[];
}
interface AddRoleModalProps {
  closeModal: () => void;
  updateRoles: (callback: (prevRoles: Role[]) => Role[]) => void;
}

const allPermissions = [
  "user:create",
  "user:read",
  "user:update",
  "user:delete",
  "role:create",
  "role:read",
  "role:update",
  "role:delete",
  "booking:read",
  "booking:read:single",
  "booking:create",
  "booking:update",
  "booking:delete",
  "guest:read",
  "guest:update",
  "guest:delete",
  "vendor:read",
  "vendor:update",
  "vendor:delete",
  "purchase:read",
  "purchase:create",
  "purchase:update",
  "purchase:delete",
  "prospective-guest:create",
  "prospective-guest:read",
  "prospective-guest:update",
  "prospective-guest:delete",
  "meeting:create",
  "meeting:update",
  "meeting:delete",
  "guest:files:read",
  "booking:files:read",
  "purchase:files:read",
  "guest:file:download",
  "booking:file:download",
  "purchase:file:download",
];

const AddRoleModal: React.FC<AddRoleModalProps> = ({
  closeModal,
  updateRoles,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const formik = useFormik({
    initialValues: { name: "", permissions: [] },
    validationSchema: roleSchema,
    onSubmit: async (values) => {
      const payload = {
        roleName: values.name.toUpperCase(),
        permissions: selectedPermissions,
      };
      const resp = await addNewRole(axiosPrivate, payload);
      if (resp.success) {
        updateRoles((prev) => [...prev, resp.newRole]);
        Success(resp.message);
        closeModal();
      }
    },
  });

  const handlePermissionChange = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
    formik.setFieldValue(
      "permissions",
      selectedPermissions.includes(permission)
        ? selectedPermissions.filter((p) => p !== permission)
        : [...selectedPermissions, permission]
    );
  };

  return (
    <div className="fixed inset-0 modal_bg bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-100">
        <h2 className="text-xl font-semibold mb-4">Add New Role</h2>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-3">
          {/* Role Name Input */}
          <input
            name="name"
            placeholder="Role Name"
            onChange={formik.handleChange}
            value={formik.values.name}
            className="border p-2 rounded"
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-sm">{formik.errors.name}</p>
          )}

          {/* Permissions Selection */}
          <div className="border p-3 rounded max-h-40 overflow-y-auto">
            <p className="font-semibold mb-2">Assign Permissions:</p>
            {allPermissions.map((permission) => (
              <label
                key={permission}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission)}
                  onChange={() => handlePermissionChange(permission)}
                  className="w-5 h-5"
                />
                {permission}
              </label>
            ))}
          </div>
          {formik.touched.permissions && formik.errors.permissions && (
            <p className="text-red-500 text-sm">{formik.errors.permissions}</p>
          )}

          {/* Action Buttons */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className={`bg-blue-500 text-white px-4 py-2 rounded cursor-pointer transition-all duration-200 
    ${
      formik.isSubmitting
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-blue-600"
    }`}
          >
            {formik.isSubmitting ? "Adding..." : "Add Role"}
          </button>

          <button
            type="button"
            onClick={closeModal}
            className="text-red-500 mt-2 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRoleModal;
