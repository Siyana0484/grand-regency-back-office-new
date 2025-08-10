import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import AddRoleModal from "./AddRoleModal";
import UpdatePermissionModal from "./UpdatePermissionModal";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { getAllRoles } from "../apis/roleApi";
import { usePermissionStore } from "../stores/permissionStore";

interface Role {
  _id: string;
  roleName: string;
  permissions: string[];
}

const RolesList: React.FC = () => {
  const axiosPrivate = useAxiosPrivate();
  const { hasPermission } = usePermissionStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true); // Start loading
        const response = await getAllRoles(axiosPrivate);
        setRoles(response);
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchRoles();
  }, []);

  const handleRoleClick = (role: Role) => {
    if (role.roleName.toUpperCase() === "ADMIN") return;
    setSelectedRole(role);
    setShowUpdateModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Roles & Permissions
        </h2>
        {hasPermission("role:create") && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FaPlus className="text-sm" /> Add Role
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-xl shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : roles?.length > 0 ? (
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 uppercase text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Allowed Permissions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const isAdmin = role.roleName.toLowerCase() === "admin";
                const clickable = hasPermission("role:update") && !isAdmin;

                return (
                  <tr
                    key={role._id}
                    onClick={
                      clickable ? () => handleRoleClick(role) : undefined
                    }
                    className={`border-t transition ${
                      isAdmin
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : clickable
                        ? "hover:bg-gray-50 cursor-pointer"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">{role.roleName}</td>
                    <td className="px-4 py-3 space-x-2 space-y-1">
                      {isAdmin ? (
                        <span className="text-sm italic text-gray-500">
                          Access to all permissions
                        </span>
                      ) : role.permissions.length > 0 ? (
                        role.permissions.map((perm, i) => (
                          <span
                            key={i}
                            className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full"
                          >
                            {perm}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm italic text-gray-400">
                          No permissions assigned
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500 border rounded-lg">
            No roles available
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddRoleModal
          closeModal={() => setShowAddModal(false)}
          updateRoles={setRoles}
        />
      )}
      {showUpdateModal && selectedRole && (
        <UpdatePermissionModal
          role={selectedRole}
          closeModal={() => setShowUpdateModal(false)}
          updateRoles={setRoles}
        />
      )}
    </div>
  );
};

export default RolesList;
