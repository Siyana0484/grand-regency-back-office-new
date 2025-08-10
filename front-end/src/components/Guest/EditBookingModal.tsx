import React, { useCallback, useEffect, useState } from "react";
import { useFormik, FormikErrors } from "formik";
import { AiOutlineClose } from "react-icons/ai";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useBookingStore } from "../../stores/bookingStore";
import { getAllProspectiveGuestNameAndId } from "../../apis/ProspectiveGuestApi";
import { bookingSchema } from "../../schemas";
import { editBooking, saveBookingFiles } from "../../apis/bookingApi";
import { uploadToS3 } from "../../apis/guestApi";
import { Success } from "../../helpers/popup";
import { useDropzone } from "react-dropzone";
import { CoStayer } from "../../types";

interface BookingModalProps {
  onClose: () => void;
}

interface ProspectiveGuestNameId {
  _id: string;
  name: string;
}

const EditBookingModal: React.FC<BookingModalProps> = ({ onClose }) => {
  const axiosPrivate = useAxiosPrivate();
  const { selectedBooking, updateSelectedBooking } = useBookingStore();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [prospectiveGuests, setProspectiveGuests] = useState<
    ProspectiveGuestNameId[]
  >([]);
  const [loadingGuests, setLoadingGuests] = useState(true);

  useEffect(() => {
    const fetchProspectiveGuests = async () => {
      try {
        setLoadingGuests(true);
        const resp = await getAllProspectiveGuestNameAndId(axiosPrivate);
        if (resp.success) {
          setProspectiveGuests(resp.prospectiveGuests ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch prospective guests:", error);
      } finally {
        setLoadingGuests(false);
      }
    };

    fetchProspectiveGuests();
  }, []);
  const formik = useFormik({
    initialValues: {
      roomNumber: selectedBooking?.roomNumber || "",
      grcNumber: selectedBooking?.grcNumber || "",
      coStayers: selectedBooking?.coStayers || [
        { name: "", relation: "", dob: "" },
      ],
      checkInDate: selectedBooking?.checkInDate
        ? new Date(selectedBooking.checkInDate).toISOString().split("T")[0]
        : "",
      checkOutDate: selectedBooking?.checkOutDate
        ? new Date(selectedBooking.checkOutDate).toISOString().split("T")[0]
        : "",

      documents: selectedBooking?.documents || [],
      prospectiveGuest: selectedBooking?.prospectiveGuest || null,
    },
    enableReinitialize: true,
    validationSchema: bookingSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const removedFiles = selectedBooking?.documents?.filter(
          (doc) => !values.documents.includes(doc)
        );
        const newFiles = uploadedFiles.map((file) => file.name);
        const modifiedValues = {
          ...values,
          documents: newFiles,
        };

        // Step 1: Call editGuest API to get signed URLs for new document uploads

        const { signedUrls, updatedBooking } = await editBooking(
          axiosPrivate,
          modifiedValues,
          "booking",
          selectedBooking?._id,
          removedFiles
        );
        if (!signedUrls) throw new Error("Booking updation failed.");

        // Step 2: Upload documents to S3

        const newUploadedFiles = await uploadToS3(signedUrls, uploadedFiles);

        // Step 3: Save uploaded file references in the database

        const resp = await saveBookingFiles(axiosPrivate, {
          bookingId: selectedBooking?._id,
          uploadedFiles: newUploadedFiles,
        });
        if (resp.success) {
          const finalUpdatedBooking = {
            ...updatedBooking,
            documents: resp.updatedFiles,
            guest: {
              name: selectedBooking?.guest?.name,
              email: selectedBooking?.guest.email,
              phone: selectedBooking?.guest.phone,
              address: selectedBooking?.guest.address,
            },
          };

          updateSelectedBooking(finalUpdatedBooking);
          Success("booking updated successfully");
          onClose();
        }
      } catch (err) {
        console.log("errrr:", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => file.name);
      formik.setFieldValue("documents", [
        ...formik.values.documents,
        ...newFiles,
      ]);
      setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
    },
    [formik]
  );

  const removeFile = (index: number) => {
    const updatedFiles = formik.values.documents.filter((_, i) => i !== index);
    formik.setFieldValue("documents", updatedFiles);
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });
  const addCoStayer = () => {
    formik.setValues({
      ...formik.values,
      coStayers: [
        { name: "", dob: "", relation: "" },
        ...formik.values.coStayers,
      ],
    });
  };

  const removeCoStayer = (index: number) => {
    const updatedCoStayers = [...formik.values.coStayers];
    updatedCoStayers.splice(index, 1);
    formik.setValues({
      ...formik.values,
      coStayers: updatedCoStayers,
    });
  };
  return (
    <div className="fixed inset-0 modal_bg bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] p-6 relative overflow-y-auto">
        <h2 className="text-xl font-semibold">Edit Booking</h2>
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={onClose}
        >
          <AiOutlineClose className="text-2xl" />
        </button>

        <form
          onSubmit={formik.handleSubmit}
          className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* set prospective guest */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Prospective Guest
            </label>
            {loadingGuests ? (
              <p className="text-gray-500">Loading guests...</p>
            ) : (
              <select
                name="prospectiveGuest._id"
                value={formik?.values?.prospectiveGuest?._id}
                onChange={(e) => {
                  const selected = prospectiveGuests.find(
                    (guest) => guest._id === e.target.value
                  );
                  formik.setFieldValue("prospectiveGuest", {
                    _id: selected?._id || "",
                    name: selected?.name || "",
                  });
                }}
                onBlur={formik.handleBlur}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select a Guest</option>
                {prospectiveGuests.map(
                  (guest: { _id: string; name: string }) => (
                    <option key={guest._id} value={guest._id}>
                      {guest.name}
                    </option>
                  )
                )}
              </select>
            )}
          </div>

          {/* Room Number */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Room Number
            </label>
            <input
              type="text"
              name="roomNumber"
              value={formik.values.roomNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.roomNumber && formik.errors.roomNumber && (
              <p className="text-red-500 text-sm">{formik.errors.roomNumber}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              GRC Number
            </label>
            <input
              type="text"
              name="grcNumber"
              value={formik.values.grcNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.grcNumber && formik.errors.grcNumber && (
              <p className="text-red-500 text-sm">{formik.errors.grcNumber}</p>
            )}
          </div>

          {/* Check-in & Check-out Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Check-in Date
            </label>
            <input
              type="date"
              name="checkInDate"
              value={formik.values.checkInDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.checkInDate && formik.errors.checkInDate && (
              <p className="text-red-500 text-sm">
                {formik.errors.checkInDate}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Check-out Date
            </label>
            <input
              type="date"
              name="checkOutDate"
              value={formik.values.checkOutDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.checkOutDate && formik.errors.checkOutDate && (
              <p className="text-red-500 text-sm">
                {formik.errors.checkOutDate}
              </p>
            )}
          </div>

          {/* Co-Stayers Section */}
          <div className="col-span-2 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Co-Stayers</h3>
              <button
                type="button"
                onClick={addCoStayer}
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Co-Stayer
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                {formik.values.coStayers.map((_, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-md bg-white"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-700">
                        Co-Stayer {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeCoStayer(index)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          name={`coStayers[${index}].name`}
                          placeholder="Full Name"
                          value={formik.values.coStayers[index].name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {formik.touched.coStayers?.[index]?.name &&
                          formik.errors.coStayers?.[index] &&
                          (
                            formik.errors.coStayers[
                              index
                            ] as FormikErrors<CoStayer>
                          ).name && (
                            <div className="text-red-500 text-sm mt-1">
                              {
                                (
                                  formik.errors.coStayers[
                                    index
                                  ] as FormikErrors<CoStayer>
                                ).name
                              }
                            </div>
                          )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth
                        </label>
                        <input
                          name={`coStayers[${index}].dob`}
                          type="date"
                          value={formik.values.coStayers[index].dob}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {formik.touched.coStayers?.[index]?.dob &&
                          formik.errors.coStayers?.[index] &&
                          (
                            formik.errors.coStayers[
                              index
                            ] as FormikErrors<CoStayer>
                          ).dob && (
                            <div className="text-red-500 text-sm mt-1">
                              {
                                (
                                  formik.errors.coStayers[
                                    index
                                  ] as FormikErrors<CoStayer>
                                ).dob
                              }
                            </div>
                          )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relation
                        </label>
                        <select
                          name={`coStayers[${index}].relation`}
                          value={formik.values.coStayers[index].relation}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select Relation</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Friend">Friend</option>
                          <option value="Colleague">Colleague</option>
                          <option value="Other">Other</option>
                        </select>
                        {formik.touched.coStayers?.[index]?.relation &&
                          formik.errors.coStayers?.[index] &&
                          typeof formik.errors.coStayers[index] === "object" &&
                          "relation" in formik.errors.coStayers[index] && (
                            <div className="text-red-500 text-sm mt-1">
                              {
                                formik.errors.coStayers[index]
                                  ?.relation as string
                              }
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drag and Drop File Upload */}
          <div className="col-span-2">
            {formik.touched.documents && formik.errors.documents && (
              <p className="text-red-500 text-sm mt-2">
                {formik.errors.documents as string}
              </p>
            )}
            <label className="block text-sm font-medium text-gray-600">
              Upload Documents
            </label>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <input {...getInputProps()} />
              <p className="text-gray-500">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-400">
                Only PDF files are allowed
              </p>
            </div>
            {formik.values.documents.length > 0 && (
              <ul className="mt-3 space-y-2">
                {formik.values.documents.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                  >
                    <span className="text-sm">{file.split("-").pop()}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                formik.isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white"
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

export default EditBookingModal;
