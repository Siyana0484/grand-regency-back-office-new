import { useState } from "react";
import { deleteRole, updateRolePermission } from "../apis/roleApi";
import { Success } from "../helpers/popup";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { usePermissionStore } from "../stores/permissionStore";

interface Role {
  _id: string;
  roleName: string;
  permissions: string[];
}

interface UpdatePermissionModalProps {
  role: Role;
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

const UpdatePermissionModal: React.FC<UpdatePermissionModalProps> = ({
  role,
  closeModal,
  updateRoles,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const { hasPermission } = usePermissionStore();
  const [permissions, setPermissions] = useState<string[]>(role.permissions);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  const handlePermissionChange = (permission: string) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
    setError(null); // Clear error when user interacts
  };

  const handleSave = async () => {
    if (permissions.length === 0) {
      setError("At least one permission must be selected.");
      return;
    }

    setLoading(true);
    try {
      const resp = await updateRolePermission(
        axiosPrivate,
        { permissions },
        role._id
      );
      if (resp.success) {
        updateRoles((prevRoles) =>
          prevRoles.map((r) => (r._id === role._id ? { ...r, permissions } : r))
        );
        Success(resp.message);
        closeModal();
      } else {
        throw new Error(resp.message || "Failed to update permissions.");
      }
    } catch (err) {
      console.log(err, "error updating permission");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const resp = await deleteRole(axiosPrivate, role._id);
      if (resp.success) {
        Success(resp.message);
        updateRoles((prevRoles) => prevRoles.filter((r) => r._id !== role._id));
        closeModal();
      } else {
        throw new Error(resp.message || "Failed to delete role.");
      }
    } catch (err) {
      console.log(err, "error deleting role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 modal_bg bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl space-y-4">
        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800">
          Update Permissions for{" "}
          <span className="text-blue-600">{role.roleName}</span>
        </h2>

        {/* Permission Checkboxes */}
        <div className="max-h-60 overflow-y-auto border border-gray-200 p-3 rounded-md space-y-2">
          {allPermissions.map((permission) => (
            <label
              key={permission}
              className="flex items-center gap-2 text-gray-700 hover:bg-gray-50 px-2 py-1 rounded cursor-pointer transition"
            >
              <input
                type="checkbox"
                checked={permissions.includes(permission)}
                onChange={() => handlePermissionChange(permission)}
                className="w-4 h-4 accent-blue-600"
                disabled={loading}
              />
              <span className="text-sm">{permission}</span>
            </label>
          ))}
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          {hasPermission("role:delete") && (
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Role"}
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={closeModal}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={permissions.length === 0 || loading}
              className={`px-4 py-2 rounded-md transition ${
                permissions.length === 0 || loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePermissionModal;
