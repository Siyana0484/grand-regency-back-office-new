import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useBookingStore } from "../../stores/bookingStore";
import { getAllBookings } from "../../apis/bookingApi";
import { usePermissionStore } from "../../stores/permissionStore";

const BookingListing: React.FC = () => {
  const axiosPrivate = useAxiosPrivate();
  const { hasPermission } = usePermissionStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkInFilter, setCheckInFilter] = useState("");
  const [checkOutFilter, setCheckOutFilter] = useState("");
  const [dobFilter, setDobFilter] = useState("");
  const { bookings, setBookings, setSelectedBooking } = useBookingStore();
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setSelectedBooking(null); // Reset selected booking when reaching the list page
  }, [setSelectedBooking]);

  // Function to fetch bookings from backend
  const fetchBookings = async (
    query = "",
    checkIn = "",
    checkOut = "",
    dob = "",
    page = 1
  ) => {
    setLoading(true);

    try {
      const response = await getAllBookings(
        axiosPrivate,
        query,
        checkIn,
        checkOut,
        dob,
        page
      );

      setBookings(response.bookings || []); // Ensure it's always an array
      setTotalPages(response.totalPages || 1); // Default to 1 if missing
    } catch (err) {
      console.log("Failed listing bookings:", err);
      setBookings([]); // Reset bookings on error
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Debounced function for searching & filtering
  const debouncedFetch = useCallback(
    debounce((query, checkIn, checkOut, dob, page) => {
      fetchBookings(query, checkIn, checkOut, dob, page);
    }, 500),
    []
  );

  // Fetch bookings on search, filter, or page change
  useEffect(() => {
    debouncedFetch(
      searchQuery,
      checkInFilter,
      checkOutFilter,
      dobFilter,
      currentPage
    );
  }, [
    searchQuery,
    checkInFilter,
    checkOutFilter,
    dobFilter,
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
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Search Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search guest name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Check-in</label>
          <input
            type="date"
            value={checkInFilter}
            onChange={(e) => setCheckInFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Check-out</label>
          <input
            type="date"
            value={checkOutFilter}
            onChange={(e) => setCheckOutFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">DOB</label>
          <input
            type="date"
            value={dobFilter}
            onChange={(e) => setDobFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          />
        </div>
      </div>
  
      {/* Create Booking Button */}
      {hasPermission("booking:create") && (
        <div className="flex justify-end">
          <button
            onClick={() => navigate("/create-booking")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition duration-200 shadow"
          >
            + Create Booking
          </button>
        </div>
      )}
  
      {/* Booking List or Loader */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        ) : bookings?.length ? (
          bookings.map((booking, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedBooking(booking);
                navigate("/booking-details");
              }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-semibold">Guest Name</p>
                  <p className="text-gray-800 font-medium">{booking.guest.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Room Number</p>
                  <p>{booking.roomNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">DOB</p>
                  <p>{new Date(booking.guest.dob).toLocaleDateString("en-GB")}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Check-in / Check-out</p>
                  <p>
                    {new Date(booking.checkInDate).toLocaleDateString("en-GB")} →{" "}
                    {new Date(booking.checkOutDate).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">GRC Number</p>
                  <p>{booking.grcNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">CO-Stayers</p>
                  <p>{booking?.coStayers?.length}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Total Damage Cost</p>
                  <p>
                    ₹
                    {booking?.damageCost?.reduce(
                      (sum, item) => sum + parseFloat(item.cost),
                      0
                    ) || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">
                    Total Additional Purchase Cost
                  </p>
                  <p>
                    ₹
                    {booking?.additionalPurchase?.reduce(
                      (sum, item) => sum + parseFloat(item.cost),
                      0
                    ) || 0}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">No bookings found.</div>
        )}
      </div>
  
      {/* Pagination */}
      {!loading && bookings?.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 hover:bg-indigo-100"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
  
};

export default BookingListing;
