import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import AddProspectiveGuestModal from "./AddProspectiveGuestModal";
import { getAllProspectiveGuest } from "../../apis/ProspectiveGuestApi";
import { useProspectiveGuestStore } from "../../stores/prospectiveGuestStore";
import { usePermissionStore } from "../../stores/permissionStore";

const ProspectiveGuestListing: React.FC = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { hasPermission } = usePermissionStore();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    prospectiveGuests,
    setProspectiveGuests,
    setSelectedProspectiveGuest,
  } = useProspectiveGuestStore();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setSelectedProspectiveGuest(null); // Reset selected guest when reaching the list page
  }, [setSelectedProspectiveGuest]);

  // Function to fetch prospective guest from backend
  const fetchProspectiveGuest = async (query = "", page = 1) => {
    setLoading(true);

    try {
      const response = await getAllProspectiveGuest(axiosPrivate, query, page);
      setProspectiveGuests(response.prospectiveGuests || []); // Ensure it's always an array
      setTotalPages(response.totalPages || 1); // Default to 1 if missing
    } catch (err) {
      console.log("Failed listing Prosepective Guests:", err);
      setProspectiveGuests([]); // Reset purchases on error
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Debounced function for searching & filtering
  const debouncedFetch = useCallback(
    debounce((query, page) => {
      fetchProspectiveGuest(query, page);
    }, 500),
    []
  );

  // Fetch bookings on search, filter, or page change
  useEffect(() => {
    debouncedFetch(searchQuery, currentPage);
  }, [searchQuery, currentPage, debouncedFetch]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Search Filters */}
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search guest name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        {hasPermission("prospective-guest:create") && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            Create Prospective Guest
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-10 h-80">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500 border-solid border-r-transparent"></div>
          </div>
        ) : prospectiveGuests && prospectiveGuests.length > 0 ? (
          <div className="space-y-4">
            {prospectiveGuests.map((guest, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedProspectiveGuest(guest);
                  navigate("/prospective-guest-details");
                }}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 cursor-pointer hover:bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Name</p>
                    <p className="text-gray-800 font-semibold">{guest.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Email</p>
                    <p>{guest.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Phone</p>
                    <p>{guest.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Company</p>
                    <p>{guest.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-10 h-80">
            <p className="text-center text-gray-500 text-lg">
              No prospective guests found.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading &&
        prospectiveGuests &&
        prospectiveGuests.length > 0 &&
        totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg transition ${
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
              className={`px-4 py-2 rounded-lg transition ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Next
            </button>
          </div>
        )}

      {/* Add Prospective Guest Modal */}
      {isModalOpen && (
        <AddProspectiveGuestModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default ProspectiveGuestListing;
