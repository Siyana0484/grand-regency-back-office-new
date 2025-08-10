import { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Success } from "../../helpers/popup";
import { useProspectiveGuestStore } from "../../stores/prospectiveGuestStore";
import EditProspectiveGuestModal from "./EditProspectiveGuestModal";
import { deleteProspectiveGuest } from "../../apis/ProspectiveGuestApi";
import Pagination from "../Pagination";
import { Booking, Meeting } from "../../types";
import { getBookingsById } from "../../apis/bookingApi";
import { getMeetingsById } from "../../apis/meetingApi";
import AddMeetingModal from "./AddMeetingModal";
import EditMeetingModal from "./EditMeetingModal";
import { useBookingStore } from "../../stores/bookingStore";
import { usePermissionStore } from "../../stores/permissionStore";

const ProspectiveGuestDetails: React.FC = () => {
  const { selectedProspectiveGuest, setSelectedProspectiveGuest } =
    useProspectiveGuestStore();
  const { hasPermission } = usePermissionStore();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [totalBookingsPages, setTotalBookingsPages] = useState(1);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsPage, setMeetingsPage] = useState(1);
  const [totalMeetingsPages, setTotalMeetingsPages] = useState(1);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);
  const [isEditMeetingModalOpen, setIsEditMeetingModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const { setSelectedBooking } = useBookingStore();

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setSelectedBooking(null); // Reset selected booking when reaching the detail page
  }, [setSelectedBooking]);

  useEffect(() => {
    if (selectedProspectiveGuest?._id) {
      fetchBookings(bookingsPage);
      fetchMeetings(meetingsPage);
    }
  }, [selectedProspectiveGuest, bookingsPage, meetingsPage]);

  // Fetch bookings
  const fetchBookings = async (page: number) => {
    setIsLoadingBookings(true);
    try {
      const resp = await getBookingsById(
        axiosPrivate,
        selectedProspectiveGuest?._id,
        page,
        10
      );
      if (resp.success) {
        setBookings(resp.bookings);
        setTotalBookingsPages(resp.totalPages);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Fetch meetings
  const fetchMeetings = async (page: number) => {
    setIsLoadingMeetings(true);
    try {
      const resp = await getMeetingsById(
        axiosPrivate,
        selectedProspectiveGuest?._id,
        page,
        10
      );
      if (resp.success) {
        setMeetings(resp.meetings);
        setTotalMeetingsPages(resp.totalPages);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
    } finally {
      setIsLoadingMeetings(false);
    }
  };
  // Open Edit Meeting Modal with Selected Meeting
  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsEditMeetingModalOpen(true);
  };

  // Delete prospective guest Function
  const handleDeleteProspectiveGuest = async () => {
    if (!selectedProspectiveGuest) return;

    try {
      const response = await deleteProspectiveGuest(
        axiosPrivate,
        selectedProspectiveGuest?._id
      );
      if (response.success) {
        Success("Prospective Guest deleted successfully!");
        setSelectedProspectiveGuest(null);
        navigate("/prospective-guests");
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
  };

  if (!selectedProspectiveGuest) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-gray-700 p-8 bg-white shadow-lg rounded-lg">
          No Prospective Guest details available.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-300">
        <h2 className="text-3xl font-bold text-gray-900">
          Prospective Guest Details
        </h2>
        {hasPermission("prospective-guest:update") && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-300 shadow cursor-pointer flex items-center gap-2"
          >
            <AiOutlineEdit size={20} />
            Edit Prospective Guest
          </button>
        )}
        {hasPermission("prospective-guest:delete") && (
          <button
            onClick={handleDeleteProspectiveGuest}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-300 shadow cursor-pointer flex items-center gap-2"
          >
            <AiOutlineDelete size={20} /> Delete ProspectiveGuest
          </button>
        )}
      </div>

      {/* Guest Information */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: " Name", value: selectedProspectiveGuest.name },
            { label: " Email", value: selectedProspectiveGuest.email },
            { label: " Phone", value: selectedProspectiveGuest.phone },
            { label: " Company", value: selectedProspectiveGuest.company },
            {
              label: "Description",
              value: selectedProspectiveGuest.description,
            },
          ].map((info, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <p className="text-gray-600 font-semibold">{info.label}</p>
              <p className="text-lg text-gray-900">{info.value}</p>
            </div>
          ))}
        </div>

        <div className="max-w-5xl mx-auto p-8 bg-white shadow-xl rounded-lg">
          {/* Bookings Section */}
          <div className="mb-8 mt-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Bookings</h3>
            {isLoadingBookings ? (
              <p className="text-gray-700">Loading bookings...</p>
            ) : bookings?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 shadow-md rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Guest Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Room Number
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Check-In
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Check-Out
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedBooking(booking);
                          navigate("/booking-details");
                        }}
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          {booking?.guest?.name || "N/A"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {booking.roomNumber || "N/A"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {booking.checkInDate
                            ? new Date(booking.checkInDate).toLocaleDateString(
                                "en-GB"
                              )
                            : "N/A"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {booking.checkOutDate
                            ? new Date(booking.checkOutDate).toLocaleDateString(
                                "en-GB"
                              )
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <Pagination
                  currentPage={bookingsPage}
                  totalPages={totalBookingsPages}
                  onPageChange={setBookingsPage}
                />
              </div>
            ) : (
              <p className="text-gray-700">No bookings available.</p>
            )}
          </div>

          {/* Meetings Section */}
          <div className="overflow-x-auto">
            {/* Header with Add Meeting Button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Meetings</h3>
              {hasPermission("meeting:create") && (
                <button
                  onClick={() => setIsAddMeetingModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-300 shadow flex items-center gap-2 cursor-pointer"
                >
                  <AiOutlinePlus size={20} />
                  Add Meeting
                </button>
              )}
            </div>

            {isLoadingMeetings ? (
              <p className="text-gray-700">Loading meetings...</p>
            ) : meetings?.length > 0 ? (
              <div>
                <table className="w-full border-collapse border border-gray-300 shadow-md rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Meeting Date
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Attendies
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.map((meeting) => (
                      <tr
                        key={meeting?._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={
                          hasPermission("meeting:update")
                            ? () => handleEditMeeting(meeting)
                            : undefined
                        }
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          {meeting.date
                            ? new Date(meeting.date).toLocaleDateString("en-GB")
                            : "N/A"}
                        </td>

                        <td className="border border-gray-300 px-4 py-2">
                          {meeting?.attendies?.join(",") || "N/A"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {meeting?.remarks || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <Pagination
                  currentPage={meetingsPage}
                  totalPages={totalMeetingsPages}
                  onPageChange={setMeetingsPage}
                />
              </div>
            ) : (
              <p className="text-gray-700">No meetings available.</p>
            )}
          </div>
          {isAddMeetingModalOpen && (
            <AddMeetingModal
              onClose={() => setIsAddMeetingModalOpen(false)}
              setMeetings={setMeetings}
            />
          )}
          {isEditMeetingModalOpen && (
            <EditMeetingModal
              onClose={() => {
                setIsEditMeetingModalOpen(false);
                setSelectedMeeting(null);
              }}
              setMeetings={setMeetings}
              meetingDetails={selectedMeeting}
            />
          )}
        </div>
      </div>

      {/* Edit Booking Modal */}
      {isEditModalOpen && (
        <EditProspectiveGuestModal onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  );
};

export default ProspectiveGuestDetails;
