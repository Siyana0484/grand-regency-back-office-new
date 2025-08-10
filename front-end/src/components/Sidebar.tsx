import { useLocation, useNavigate } from "react-router-dom";
import {
  FaBookOpen,
  FaUsers,
  FaBuilding,
  FaShoppingCart,
  FaUserPlus,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import MenuItem from "./MenuItem";
import useLogout from "../hooks/useLogout";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const logout = useLogout();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Bookings", path: "/bookings", icon: FaBookOpen },
    { label: "Guests", path: "/guests", icon: FaUsers },
    { label: "Vendors", path: "/vendors", icon: FaBuilding },
    { label: "Purchases", path: "/purchases", icon: FaShoppingCart },
    { label: "Prospective Guests", path: "/prospective-guests", icon: FaUserPlus },
    { label: "Documents", path: "/documents", icon: FaFileAlt },
    { label: "Settings", path: "/settings", icon: FaCog },
  ];

  return (
    <aside className="bg-white w-64 h-screen border-r border-gray-200 flex flex-col shadow-sm">
      <div className="flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <MenuItem
            key={item.path}
            label={item.label}
            path={item.path}
            Icon={item.icon}
            isActive={currentPath === item.path}
          />
        ))}
      </div>

      <button
        onClick={async () => {
          await logout();
          navigate("/login");
        }}
        className="flex items-center gap-3 p-4 text-red-600 hover:bg-red-100 transition w-full border-t mb-19 border-gray-200"
      >
        <FaSignOutAlt className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
