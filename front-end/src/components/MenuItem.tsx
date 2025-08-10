import { Link } from "react-router-dom";
import { IconType } from "react-icons";

interface MenuItemProps {
  label: string;
  path: string;
  isActive: boolean;
  Icon: IconType;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, path, isActive, Icon }) => {
  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
        isActive
          ? "bg-gray-300 text-blue-700 font-medium"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

export default MenuItem;
