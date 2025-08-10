import React, { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { VendorType } from "../../types";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { getAllVendors } from "../../apis/vendorApi";
import EditVendorModal from "./EditVendorModal";
import { usePermissionStore } from "../../stores/permissionStore";

const VendorListing: React.FC = () => {
  const axiosPrivate = useAxiosPrivate();
  const { hasPermission } = usePermissionStore();
  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 10; // Number of guests per page
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>(""); // Store debounced search

  // Debounce search input using lodash
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      setDebouncedSearch(value);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSetSearchTerm(e.target.value);
  };
  // Fetch Guests from Backend
  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);
      try {
        const response = await getAllVendors(
          axiosPrivate,
          page,
          limit,
          debouncedSearch
        );

        setVendors(response.vendors ?? []);
        setTotalPages(response.totalPages ?? 1);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
      setLoading(false);
    };

    fetchGuests();
  }, [page, debouncedSearch]);

  const handleRowClick = (vendor: VendorType) => {
    setSelectedVendor(vendor);
  };

  const handleModalClose = () => {
    setSelectedVendor(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Search Input */}
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search vendor name, email, phone, or address..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
  
      {/* Loading / Empty State */}
      {loading ? (
        <div className="flex justify-center items-center py-10 h-80">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500 border-solid border-r-transparent"></div>
        </div>
      ) : vendors && vendors.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No vendors found.</div>
      ) : (
        <>
          {/* Vendor List */}
          <div className="space-y-4">
            {vendors.map((vendor) => (
              <div
                key={vendor._id}
                onClick={
                  hasPermission("vendor:update") ? () => handleRowClick(vendor) : undefined
                }
                className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 ${
                  hasPermission("vendor:update") && "cursor-pointer hover:bg-gray-50"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Name</p>
                    <p className="text-gray-800 font-semibold">{vendor.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Email</p>
                    <p>{vendor.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Phone</p>
                    <p>{vendor.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">GSTIN</p>
                    <p>{vendor.gstin}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Contacted Person</p>
                    <p>{vendor.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Address</p>
                    <p>{vendor.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
  
          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 rounded-lg transition ${
                page === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Prev
            </button>
  
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`px-3 py-2 rounded-md text-sm transition ${
                    page === pageNumber
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-indigo-100"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
  
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 rounded-lg transition ${
                page === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
  
      {/* Edit Vendor Modal */}
      {selectedVendor && (
        <EditVendorModal
          vendor={selectedVendor}
          onClose={handleModalClose}
          setVendor={setVendors}
        />
      )}
    </div>
  );
  
};

export default VendorListing;
