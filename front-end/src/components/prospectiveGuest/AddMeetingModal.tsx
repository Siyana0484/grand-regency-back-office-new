import { useFormik } from "formik";
import "react-phone-input-2/lib/style.css";
import { AiOutlineClose, AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Success } from "../../helpers/popup";
import { useProspectiveGuestStore } from "../../stores/prospectiveGuestStore";
import { meetingSchema } from "../../schemas";
import { createMeeting } from "../../apis/meetingApi";
import { Meeting } from "../../types";
import { useState } from "react";

interface AddMeetingModalProps {
  onClose: () => void;
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
}

const AddMeetingModal: React.FC<AddMeetingModalProps> = ({
  onClose,
  setMeetings,
}) => {
  const { selectedProspectiveGuest } = useProspectiveGuestStore();
  const [attendeeInput, setAttendeeInput] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const formik = useFormik({
    initialValues: {
      date: "",
      remarks: "",
      attendies: [],
    },
    validationSchema: meetingSchema,
    onSubmit: async (values) => {
      const payload = {
        ...values,
        prospectiveGuestId: selectedProspectiveGuest?._id,
      };
      const resp = await createMeeting(axiosPrivate, payload);

      if (resp.success) {
        setMeetings((prev) => [...prev, resp.newMeeting]);
        Success("meeting added successfully");
        onClose();
      }
    },
    enableReinitialize: true,
  });

  // Function to add attendee to the list
  const addAttendee = () => {
    if (attendeeInput.trim() !== "") {
      formik.setFieldValue("attendies", [
        ...formik.values.attendies,
        attendeeInput.trim(),
      ]);
      setAttendeeInput(""); // Reset input
    }
  };

  // Function to remove an attendee from the list
  const removeAttendee = (index: number) => {
    formik.setFieldValue(
      "attendies",
      formik.values.attendies.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="fixed inset-0 modal_bg bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold">Add Meeting</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Meeting Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Meeting Date
            </label>
            <input
              type="date"
              name="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.date}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.date && formik.errors.date && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.date}</p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Remarks
            </label>
            <textarea
              name="remarks"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.remarks}
              className="w-full p-2 border rounded-lg h-20 resize-none"
              placeholder="Enter meeting remarks..."
            />
            {formik.touched.remarks && formik.errors.remarks && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.remarks}
              </p>
            )}
          </div>

          {/* Attendees List */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Attendees
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter attendee name"
              />
              <button
                type="button"
                onClick={addAttendee}
                className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <AiOutlinePlus size={24} />
              </button>
            </div>

            {/* List of added attendees */}
            <div className="mt-2 space-y-1">
              {formik.values.attendies.map((attendee, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <span>{attendee}</span>
                  <button
                    type="button"
                    onClick={() => removeAttendee(index)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <AiOutlineDelete size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Validation Error */}
            {formik.touched.attendies && formik.errors.attendies && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.attendies.toString()}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`px-4 py-2 rounded-lg text-white cursor-pointer ${
                formik.isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {formik.isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMeetingModal;
