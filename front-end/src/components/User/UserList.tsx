import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import AddUserModal from "./AddUserModal";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { getAllUsers } from "../../apis/userApi";
import EditUserModal from "./EditUserModal";
import { usePermissionStore } from "../../stores/permissionStore";

interface User {
  _id: string;
  name: string;
  phone: string;
  email: string;
  roles: { _id: string; roleName: string }[];
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { hasPermission } = usePermissionStore();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<
    { _id: string; roleName: string }[]
  >([]);
  const axiosPrivate = useAxiosPrivate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await getAllUsers(
          axiosPrivate,
          currentPage,
          usersPerPage
        );
        setUsers(response?.users ?? []);
        setTotalUsers(response?.totalUsers);
        setAvailableRoles(response?.allRoles);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentPage]); // Refetch when currentPage changes

  if (loading)
    return (
      <div className="flex justify-center items-center py-10 h-80">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    );
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
        {hasPermission("user:create") && (
          <button
            onClick={() => setShowAddUserModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FaPlus className="text-sm" /> Add User
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto border rounded-xl shadow-sm">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Roles</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr
                key={user._id}
                className={`border-t hover:bg-gray-50 transition ${
                  hasPermission("user:update") && "cursor-pointer"
                }`}
                onClick={
                  hasPermission("user:update")
                    ? () => setSelectedUser(user)
                    : undefined
                }
              >
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.phone}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 space-x-1">
                  {user?.roles?.length > 0 ? (
                    user.roles.map((role, i) => (
                      <span
                        key={i}
                        className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full"
                      >
                        {role.roleName}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">
                      No roles assigned
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 pt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-2 rounded-md text-sm transition ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-blue-100"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>

      {/* Modals */}
      {showAddUserModal && (
        <AddUserModal
          closeModal={() => setShowAddUserModal(false)}
          updateUsers={setUsers}
          availableRoles={availableRoles}
        />
      )}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          closeModal={() => setSelectedUser(null)}
          updateUsers={setUsers}
          availableRoles={availableRoles}
        />
      )}
    </div>
  );
};

export default UsersList;
