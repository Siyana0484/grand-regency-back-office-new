import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { usePurchaseStore } from "../../stores/purchaseStore";
import { getAllPurchases } from "../../apis/purchaseApi";
import { usePermissionStore } from "../../stores/permissionStore";

const PurchaseListing: React.FC = () => {
  const axiosPrivate = useAxiosPrivate();
  const { hasPermission } = usePermissionStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [startPurchaseFilter, setStartPurchaseFilter] = useState("");
  const [endPurchaseFilter, setEndPurchaseFilter] = useState("");
  const { purchases, setPurchases, setSelectedPurchase } = usePurchaseStore();
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setSelectedPurchase(null); // Reset selected purchase when reaching the list page
  }, [setSelectedPurchase]);

  // Function to fetch bookings from backend
  const fetchBookings = async (
    query = "",
    startPurchaseFilter = "",
    endPurchaseFilter = "",
    page = 1
  ) => {
    setLoading(true);

    try {
      const response = await getAllPurchases(
        axiosPrivate,
        query,
        startPurchaseFilter,
        endPurchaseFilter,
        page
      );
      setPurchases(response.purchases || []); // Ensure it's always an array
      setTotalPages(response.totalPages || 1); // Default to 1 if missing
    } catch (err) {
      console.log("Failed listing purchases:", err);
      setPurchases([]); // Reset purchases on error
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Debounced function for searching & filtering
  const debouncedFetch = useCallback(
    debounce((query, startPurchaseFilter, endPurchaseFilter, page) => {
      fetchBookings(query, startPurchaseFilter, endPurchaseFilter, page);
    }, 500),
    []
  );

  // Fetch bookings on search, filter, or page change
  useEffect(() => {
    debouncedFetch(
      searchQuery,
      startPurchaseFilter,
      endPurchaseFilter,
      currentPage
    );
  }, [
    searchQuery,
    startPurchaseFilter,
    endPurchaseFilter,
    currentPage,
    debouncedFetch,
  ]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search vendor details, or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purchase from
          </label>
          <input
            type="date"
            value={startPurchaseFilter}
            onChange={(e) => setStartPurchaseFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purchase to
          </label>
          <input
            type="date"
            value={endPurchaseFilter}
            onChange={(e) => setEndPurchaseFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        {hasPermission("purchase:create") && (
          <button
            onClick={() => navigate("/create-purchase")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            + Create Purchase
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-10 h-80">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500 border-r-transparent border-solid"></div>
          </div>
        ) : purchases && purchases.length > 0 ? (
          <div className="space-y-4">
            {purchases.map((purchase, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedPurchase(purchase);
                  navigate("/purchase-details");
                }}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 cursor-pointer hover:bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Vendor Name</p>
                    <p className="text-gray-800 font-semibold">
                      {purchase.vendor.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Purchase Item</p>
                    <p>{purchase.item}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Purchase Date</p>
                    <p>
                      {new Date(purchase.purchaseDate).toLocaleDateString(
                        "en-GB"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Invoice Number</p>
                    <p>{purchase.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">GSTIN</p>
                    <p>{purchase.vendor.gstin}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-10 h-80">
            <p className="text-center text-gray-500 text-lg">
              No purchases found.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && purchases && purchases.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md transition ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-md text-sm transition ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-indigo-100"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md transition ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PurchaseListing;
