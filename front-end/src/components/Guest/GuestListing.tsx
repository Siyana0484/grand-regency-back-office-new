import React, { useCallback, useEffect, useState } from "react";
import EditGuestModal from "./EditGuestModal";
import { AiOutlineDownload } from "react-icons/ai";
import { debounce } from "lodash";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { GuestListType } from "../../types";
import { getAllGuests } from "../../apis/guestApi";
import { fileDownloadUrl } from "../../apis/documentApi";
import { usePermissionStore } from "../../stores/permissionStore";

const GuestListing: React.FC = () => {
  const axiosPrivate = useAxiosPrivate();
  const { hasPermission } = usePermissionStore();
  const [guests, setGuests] = useState<GuestListType[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestListType | null>(
    null
  );
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
        const response = await getAllGuests(
          axiosPrivate,
          page,
          limit,
          debouncedSearch
        );

        setGuests(response.guests ?? []);
        setTotalPages(Math.ceil(response.totalGuest / limit));
      } catch (error) {
        console.error("Error fetching guests:", error);
      }
      setLoading(false);
    };

    fetchGuests();
  }, [page, debouncedSearch]);

  const handleRowClick = (guest: GuestListType) => {
    setSelectedGuest(guest);
  };

  const handleModalClose = () => {
    setSelectedGuest(null);
  };

  const handleDownload = async (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation(); // Prevent the row click event
    const resp = await fileDownloadUrl(axiosPrivate, fileName, "guest");

    if (resp.success) {
      const link = document.createElement("a");
      link.href = resp.signedUrl;
      link.download = fileName; // triggers browser download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
            placeholder="Search guest name, email, phone, or address..."
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
      ) : guests.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No guests found.</div>
      ) : (
        <>
          {/* Guest List */}
          <div className="space-y-4">
            {guests.map((guest) => (
              <div
                key={guest._id}
                onClick={
                  hasPermission("guest:update")
                    ? () => handleRowClick(guest)
                    : undefined
                }
                className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 ${
                  hasPermission("guest:update") &&
                  "cursor-pointer hover:bg-gray-50"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Guest Name</p>
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
                    <p className="text-gray-500 font-medium">Address</p>
                    <p>{guest.address}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Date of Birth</p>
                    <p>
                      {guest.dob
                        ? new Date(guest.dob).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">
                      Prospective Guest
                    </p>
                    <p>{guest.prospectiveGuest ? "Yes" : "No"}</p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-gray-500 font-medium mb-2">Documents</p>
                    <ul className="space-y-2">
                      {guest.documents?.map((doc, index) => {
                        const fileName = doc.split("-").pop();
                        return (
                          <li
                            key={index}
                            className="flex justify-between items-center bg-gray-100 rounded-md px-3 py-2"
                          >
                            <span className="truncate">{fileName}</span>
                            {hasPermission("guest:file:download") && (
                              <button
                                onClick={(e) => handleDownload(e, doc)}
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <AiOutlineDownload className="w-5 h-5" />
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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

      {/* Edit Guest Modal */}
      {selectedGuest && (
        <EditGuestModal
          guest={selectedGuest}
          onClose={handleModalClose}
          setGuest={setGuests}
        />
      )}
    </div>
  );
};

export default GuestListing;
