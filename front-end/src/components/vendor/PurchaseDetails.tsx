import { useState } from "react";
import {
  AiOutlineDelete,
  AiOutlineDownload,
  AiOutlineEdit,
} from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import EditPurchaseModal from "./EditPurchaseModal";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Success } from "../../helpers/popup";
import { usePurchaseStore } from "../../stores/purchaseStore";
import { deletePurchase } from "../../apis/purchaseApi";
import { fileDownloadUrl } from "../../apis/documentApi";
import { usePermissionStore } from "../../stores/permissionStore";

const PurchaseDetails: React.FC = () => {
  const { selectedPurchase, setSelectedPurchase } = usePurchaseStore();
  const { hasPermission } = usePermissionStore();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const axiosPrivate = useAxiosPrivate();

  const handleDownload = async (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation(); // Prevent the row click event
    const resp = await fileDownloadUrl(axiosPrivate, fileName, "purchase");

    if (resp.success) {
      const link = document.createElement("a");
      link.href = resp.signedUrl;
      link.download = fileName; // triggers browser download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Delete Purchase Function
  const handleDeletePurchase = async () => {
    if (!selectedPurchase) return;

    try {
      const response = await deletePurchase(axiosPrivate, selectedPurchase._id);
      if (response.success) {
        Success("Purchase deleted successfully!");
        setSelectedPurchase(null);
        navigate("/purchases");
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
  };

  if (!selectedPurchase) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-gray-700 p-8 bg-white shadow-lg rounded-lg">
          No Purchase details available.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-300">
        <h2 className="text-3xl font-bold text-gray-900">Purchase Details</h2>
        {hasPermission("purchase:update") && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-300 shadow cursor-pointer flex items-center gap-2"
          >
            <AiOutlineEdit size={20} />
            Edit Purchase
          </button>
        )}
        {hasPermission("purchase:delete") && (
          <button
            onClick={handleDeletePurchase}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-300 shadow cursor-pointer flex items-center gap-2"
          >
            <AiOutlineDelete size={20} /> Delete Purchase
          </button>
        )}
      </div>

      {/* Guest Information */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Vendor Name", value: selectedPurchase.vendor.name },
            { label: "Vendor Email", value: selectedPurchase.vendor.email },
            { label: "Vendor Phone", value: selectedPurchase.vendor.phone },
            { label: "Vendor Address", value: selectedPurchase.vendor.address },
            { label: "GSTIN", value: selectedPurchase.vendor.gstin },
            { label: "Invoice Number", value: selectedPurchase.invoiceNumber },
            {
              label: "Warranty Period",
              value: selectedPurchase.warrantyPeriod,
            },
            { label: "Purchase Item", value: selectedPurchase.item },
            { label: "Purchase Quantity", value: selectedPurchase.quantity },
            { label: "Purchase Value", value: selectedPurchase.value },
            {
              label: "Purchase Date",
              value: new Date(selectedPurchase.purchaseDate).toLocaleDateString(
                "en-GB"
              ),
            },
          ].map((info, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-600 font-semibold">{info.label}</p>
              <p className="text-lg text-gray-900">{info.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 mt-7">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 font-semibold">Documents</p>
            {selectedPurchase?.documents?.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2"
              >
                <p className="text-lg text-gray-900">{file.split("-").pop()}</p>
                {hasPermission("purchase:file:download") && (
                  <button
                    onClick={(e) => handleDownload(e, file)}
                    className="text-blue-500 hover:text-blue-700 cursor-pointer"
                  >
                    <AiOutlineDownload size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Booking Modal */}
      {isEditModalOpen && (
        <EditPurchaseModal onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  );
};

export default PurchaseDetails;
