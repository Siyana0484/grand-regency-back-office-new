import { useEffect, useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import DocumentsList from "../components/documents/DocumentList";
import { usePermissionStore } from "../stores/permissionStore";

const tabConfigs = [
  {
    label: "Booking Documents",
    key: "booking",
    permRead: "booking:files:read",
    permDownload: "booking:file:download",
  },
  {
    label: "Guest Documents",
    key: "guest",
    permRead: "guest:files:read",
    permDownload: "guest:file:download",
  },
  {
    label: "Purchase Documents",
    key: "purchase",
    permRead: "purchase:files:read",
    permDownload: "purchase:file:download",
  },
];
const Documents = () => {
  const permissions = usePermissionStore((state) => state.permissions);
  const hasPermission = usePermissionStore((state) => state.hasPermission);

  const availableTabs = tabConfigs.filter((tab) => hasPermission(tab.permRead));
  const [activeTab, setActiveTab] = useState<
    "booking" | "guest" | "purchase" | null
  >(null);
  const [activePerm, setActivePerm] = useState<
    | "booking:file:download"
    | "guest:file:download"
    | "purchase:file:download"
    | null
  >(null);

  useEffect(() => {
    if (availableTabs?.length > 0) {
      setActiveTab(availableTabs[0].key as typeof activeTab);
      setActivePerm(availableTabs[0].permDownload as typeof activePerm);
    }
  }, [permissions]);

  if (availableTabs.length === 0) {
    return (
      <div className="p-6 text-gray-600 text-lg">
        You do not have permission to view any documents.
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4">
        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        <ul>
          {availableTabs.map((tab) => (
            <li
              key={tab.key}
              className={`p-3 flex items-center gap-2 cursor-pointer rounded ${
                activeTab === tab.key
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => {
                setActiveTab(tab.key as typeof activeTab);
                setActivePerm(tab.permDownload as typeof activePerm);
              }}
            >
              <FaFileAlt /> {tab.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 overflow-y-auto h-full scrollbar-hide">
        {activeTab && activePerm && (
          <DocumentsList type={activeTab} perm={activePerm} />
        )}
      </div>
    </div>
  );
};

export default Documents;
