import { useState } from "react";
import React, { useRef } from "react";
import PrintContent from "./PrintContent.tsx"; 
import { useBookingStore } from "../../stores/bookingStore";
import {
  AiOutlineDelete,
  AiOutlineDownload,
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlinePrinter,
} from "react-icons/ai";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import AdditionalCostModal from "./AdditionalCostModal";
import { deleteAdditionalCost, deleteBooking } from "../../apis/bookingApi";
import { Success } from "../../helpers/popup";
import { useNavigate } from "react-router-dom";
import { fileDownloadUrl } from "../../apis/documentApi";
import EditBookingModal from "./EditBookingModal";
import { usePermissionStore } from "../../stores/permissionStore";

const BookingDetails: React.FC = () => {
  const { selectedBooking, setSelectedBooking } = useBookingStore();
  const { hasPermission } = usePermissionStore();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "additionalPurchase" | "damageCost"
  >("additionalPurchase");
  const axiosPrivate = useAxiosPrivate();

  // Add new purchase
  const handleAddNewEntry = (
    newEntry: { item: string; cost: string },
    type: "additionalPurchase" | "damageCost"
  ) => {
    if (!selectedBooking) return;

    setSelectedBooking({
      ...selectedBooking,
      [type]: [...(selectedBooking?.[type] || []), newEntry], // Dynamically update either additionalPurchase or damageCost
    });
  };

  const handleDownload = async (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation(); // Prevent the row click event
    const resp = await fileDownloadUrl(axiosPrivate, fileName, "booking");

    if (resp.success) {
      const link = document.createElement("a");
      link.href = resp.signedUrl;
      link.download = fileName; // triggers browser download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 🗑️ Handle Deletion
  const handleDeleteEntry = async (
    index: number,
    type: "additionalPurchase" | "damageCost"
  ) => {
    if (!selectedBooking) return;

    const itemToDelete = selectedBooking[type][index];
    try {
      const response = await deleteAdditionalCost(
        axiosPrivate,
        itemToDelete,
        selectedBooking._id,
        type
      );

      if (response.success) {
        Success(response?.message);
        setSelectedBooking({
          ...selectedBooking,
          [type]: selectedBooking[type].filter((_, i) => i !== index),
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // 🚀 Delete Booking Function
  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await deleteBooking(axiosPrivate, selectedBooking._id);
      if (response.success) {
        Success("Booking deleted successfully!");
        setSelectedBooking(null);
        navigate("/bookings");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  if (!selectedBooking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-gray-700 p-8 bg-white shadow-lg rounded-lg">
          No booking details available.
        </div>
      </div>
    );
  }

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    console.log("Preparing to print...");
    const printWindow = window.open('', '_blank');
    if (printWindow && componentRef.current) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              @page { size: auto; margin: 0mm; }
              body { -webkit-print-color-adjust: exact; }
            </style>
          </head>
          <body>
            ${componentRef.current.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };


  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-300">
        <h2 className="text-3xl font-bold text-gray-900">Booking Details</h2>
        {hasPermission("booking:update") && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-300 shadow cursor-pointer flex items-center gap-2"
          >
            <AiOutlineEdit size={20} />
            Edit Booking
          </button>
        )}
        <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-300 shadow cursor-pointer flex items-center gap-2"
>
  <AiOutlinePrinter /> Print Booking
</button>

<div style={{ display: "none" }}>
  <PrintContent 
    ref={componentRef}
    guestData={{
      name: selectedBooking.guest.name,
      email: selectedBooking.guest.email,
      phone: selectedBooking.guest.phone,
      dob: selectedBooking.guest.dob,
      address: selectedBooking.guest.address,
      documents: selectedBooking.documents
    }}
    bookingData={{
      roomNumber: selectedBooking.roomNumber,
      checkInDate: new Date(selectedBooking.checkInDate).toLocaleDateString(),
      checkOutDate: new Date(selectedBooking.checkOutDate).toLocaleDateString(),
      grcNumber: selectedBooking.grcNumber,
      coStayers: selectedBooking.coStayers
    }}
  />
</div>
        {hasPermission("booking:delete") && (
          <button
            onClick={handleDeleteBooking}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-300 shadow cursor-pointer flex items-center gap-2"
          >
            <AiOutlineDelete size={20} /> Delete Booking
          </button>
        )}
      </div>

      {/* Guest Information */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Guest Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Name", value: selectedBooking.guest.name },
            { label: "Email", value: selectedBooking.guest.email },
            { label: "Phone", value: selectedBooking.guest.phone },
            {
              label: "DOB",
              value: new Date(selectedBooking.guest.dob).toLocaleDateString(
                "en-GB"
              ),
            },
            { label: "Address", value: selectedBooking.guest.name },
          ].map((info, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-600 font-semibold">{info.label}</p>
              <p className="text-lg text-gray-900">{info.value}</p>
            </div>
          ))}
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4 mt-5">
          Booking Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Room Number", value: selectedBooking.roomNumber },
            {
              label: "Check-in Date",
              value: new Date(selectedBooking.checkInDate).toLocaleDateString(
                "en-GB"
              ),
            },
            {
              label: "Check-out Date",
              value: new Date(selectedBooking.checkOutDate).toLocaleDateString(
                "en-GB"
              ),
            },
            { label: "GRC Number", value: selectedBooking.grcNumber },
          ].map((info, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-600 font-semibold">{info.label}</p>
              <p className="text-lg text-gray-900">{info.value}</p>
            </div>
          ))}
        </div>
        {/* Prospective Guest Section */}
        <div className="mb-8 mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Prospective Guest
          </h3>

          {selectedBooking.prospectiveGuest?.name ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-600 font-semibold">Name</p>
                <p className="text-lg text-gray-900">
                  {selectedBooking.prospectiveGuest.name}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No prospective guest.</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 mt-7">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 font-semibold">Documents</p>
            {selectedBooking?.documents?.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2"
              >
                <p className="text-lg text-gray-900">{file.split("-").pop()}</p>
                {hasPermission("booking:file:download") && (
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

      {/* Co-Stayers */}
      <div className="mb-8">
        {selectedBooking?.coStayers?.length > 0 ? ( // ✅ Optional chaining
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Co-Stayers ({selectedBooking?.coStayers?.length || 0})
          </h3>
        ) : (
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Co-Stayers (0)
          </h3>
        )}

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          {selectedBooking?.coStayers?.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600">
                  <th className="p-3">Name</th>
                  <th className="p-3">Relation</th>
                  <th className="p-3">DOB</th>
                </tr>
              </thead>
              <tbody>
                {selectedBooking?.coStayers.map(
                  (
                    stayer: { name: string; relation: string; dob: string },
                    index: number
                  ) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-3 text-gray-900">
                        {stayer.name || "N/A"}
                      </td>
                      <td className="p-3 text-gray-700">
                        {stayer.relation || "N/A"}
                      </td>
                      <td className="p-3 text-gray-700">
                        {stayer.dob
                          ? new Date(stayer.dob).toLocaleDateString("en-GB")
                          : "N/A"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No co-stayers.</p>
          )}
        </div>
      </div>

      {/* Additional Purchases */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Additional Purchases
          </h3>
          {hasPermission("booking:update") && (
            <button
              onClick={() => {
                setModalType("additionalPurchase");
                setIsModalOpen(true);
              }}
              className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <AiOutlinePlus size={24} className="mr-1" /> Add
            </button>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          {selectedBooking?.additionalPurchase?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {selectedBooking?.additionalPurchase?.map((purchase, index) => (
                <li
                  key={index}
                  className="py-3 grid grid-cols-3 items-center text-gray-900 gap-4"
                >
                  <span className="truncate">{purchase.item || "N/A"}</span>
                  <span className="font-medium text-gray-800 text-right min-w-[80px]">
                    {purchase.cost || "N/A"}
                  </span>
                  {hasPermission("booking:update") && (
                    <button
                      onClick={() =>
                        handleDeleteEntry(index, "additionalPurchase")
                      }
                      className="text-red-600 hover:text-red-800 flex justify-end cursor-pointer"
                    >
                      <AiOutlineDelete size={20} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No additional purchases.</p>
          )}
        </div>
      </div>

      {/* Damage Costs */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">Damage Cost</h3>
          {hasPermission("booking:update") && (
            <button
              onClick={() => {
                setModalType("damageCost");
                setIsModalOpen(true);
              }}
              className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <AiOutlinePlus size={24} className="mr-1" /> Add
            </button>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          {selectedBooking?.damageCost?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {selectedBooking?.damageCost?.map((damagedItem, index) => (
                <li
                  key={index}
                  className="py-3 grid grid-cols-3 items-center text-gray-900 gap-4"
                >
                  <span className="truncate">{damagedItem.item || "N/A"}</span>
                  <span className="font-medium text-gray-800 text-right min-w-[80px]">
                    {damagedItem.cost || "N/A"}
                  </span>
                  {hasPermission("booking:update") && (
                    <button
                      onClick={() => handleDeleteEntry(index, "damageCost")}
                      className="text-red-600 hover:text-red-800 flex justify-end cursor-pointer"
                    >
                      <AiOutlineDelete size={20} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No Damages.</p>
          )}
        </div>
      </div>
      <AdditionalCostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddNewEntry}
        type={modalType}
        id={selectedBooking._id}
      />

      {/* Edit Booking Modal */}
      {isEditModalOpen && (
        <EditBookingModal onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  );
};

export default BookingDetails;
