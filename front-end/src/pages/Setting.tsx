import { JSX, useEffect, useState } from "react";
import { FaUsers, FaUserShield } from "react-icons/fa";
import RolesList from "../components/RoleList";
import UsersList from "../components/User/UserList";
import { usePermissionStore } from "../stores/permissionStore";

const tabConfigs = [
  {
    key: "users",
    label: "Users",
    icon: <FaUsers />,
    perm: "user:read",
  },
  {
    key: "roles",
    label: "Roles",
    icon: <FaUserShield />,
    perm: "role:read",
  },
];

const Settings: React.FC = () => {
  const hasPermission = usePermissionStore((state) => state.hasPermission);

  const availableTabs = tabConfigs.filter((tab) => hasPermission(tab.perm)) as {
    key: "users" | "roles";
    label: string;
    icon: JSX.Element;
    perm: string;
  }[];

  const [activeTab, setActiveTab] = useState<"users" | "roles" | null>(null);

  useEffect(() => {
    if (availableTabs.length > 0) {
      setActiveTab(availableTabs[0].key);
    }
  }, [hasPermission]);

  if (!activeTab) {
    return (
      <div className="p-6 text-gray-600 text-lg">
        You do not have permission to view settings.
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <ul>
          {availableTabs.map((tab) => (
            <li
              key={tab.key}
              className={`p-3 flex items-center gap-2 cursor-pointer rounded ${
                activeTab === tab.key
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 overflow-y-auto h-full scrollbar-hide">
        {activeTab === "users" && <UsersList />}
        {activeTab === "roles" && <RolesList />}
      </div>
    </div>
  );
};

export default Settings;
