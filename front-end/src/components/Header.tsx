import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import useLogout from "../hooks/useLogout";
import { usePermissionStore } from "../stores/permissionStore";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logout = useLogout();
  const { user } = usePermissionStore();
  const { hasPermission } = usePermissionStore();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = user?.name || "User";
  const roles = user?.roles || [];
  const displayedRoles = roles.slice(0, 3).join(", ");
  const showMore = roles.length > 3;

  return (
    <header className="bg-white p-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">Grand Regency</h1>

      <div className="flex items-center gap-4">
          {/* Guest Check-In Button */}
          {hasPermission("booking:create") && (
        <div className="flex justify-end">
          <button
            onClick={() => navigate("/create-booking")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition duration-200 shadow"
          >
            Guest Check-in
          </button>
        </div>
      )}

        {/* User Info */}
        <div className="text-right text-gray-700 font-medium">
          <div>{userName}</div>
          <div className="text-sm text-green-600">
            {displayedRoles}
            {showMore && " ..."}
          </div>
        </div>

        {/* Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <img
            src="/images/sampleImage.png"
            alt="Profile"
            width="42"
            height="42"
            className="cursor-pointer rounded-full border border-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          />

          {isOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg border border-gray-200 rounded-md z-10">
              <ul className="py-2 text-sm text-gray-700">
                <li
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    navigate("/profile");
                    setIsOpen(false);
                  }}
                >
                  <FaUserCircle className="text-gray-500" />
                  Profile
                </li>
                <li
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                  onClick={async () => {
                    await logout();
                    setIsOpen(false);
                    navigate("/login");
                  }}
                >
                  <FaSignOutAlt className="text-red-500" />
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
