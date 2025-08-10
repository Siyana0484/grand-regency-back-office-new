import { FormikErrors, useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useCallback } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { BookingFormValues, CoStayer } from "../../types";
import { bookingSchema } from "../../schemas";
import { createBooking, saveBookingFiles } from "../../apis/bookingApi";
import { uploadToS3 } from "../../apis/guestApi";
import { Success } from "../../helpers/popup";
import { useDropzone } from "react-dropzone";

const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const initialValues: BookingFormValues = {
    phone: location.state?.guest?.phone,
    guestName: location.state?.guest?.name,
    grcNumber: "",
    checkInDate: "",
    checkOutDate: "",
    roomNumber: "",
    coStayers: [{ name: "", dob: "", relation: "" }],
    documents: [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: bookingSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const modifiedValues = {
          ...values,
          documents: values.documents.map((file) => file.name),
        };

        // Remove guestName and phone dynamically
        delete modifiedValues.guestName;
        delete modifiedValues.phone;

        const { bookingId, signedUrls } = await createBooking(
          axiosPrivate,
          modifiedValues,
          "booking",
          location.state?.guest?.guestId
        );
        if (!bookingId || !signedUrls) throw new Error("Booking failed.");

        // Step 2: Upload documents to S3

        const uploadedFiles = await uploadToS3(signedUrls, values.documents);
        const resp = await saveBookingFiles(axiosPrivate, {
          bookingId,
          uploadedFiles,
        });
        if (resp.success) {
          Success("guest created success fully");
          navigate("/bookings");
        }
      } catch (error) {
        console.error("Error creating booking", error);
        setErrors({ roomNumber: "Something went wrong. Please try again." });
      } finally {
        setSubmitting(false);
      }
    },
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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      formik.setFieldValue("documents", [
        ...formik.values.documents,
        ...acceptedFiles,
      ]);
    },
    [formik.values.documents]
  );

  const removeFile = (index: number) => {
    const updatedFiles = formik.values.documents.filter((_, i) => i !== index);
    formik.setFieldValue("documents", updatedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div className="flex justify-center items-center min-h-screen ">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-6">Create Booking</h2>

        {/* Customer Details Card */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{formik.values.guestName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{formik.values.phone}</p>
            </div>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GRC Number */}
            <div className="flex flex-col">
              <label
                htmlFor="grcNumber"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                GRC Number
              </label>
              <input
                id="grcNumber"
                name="grcNumber"
                type="text"
                value={formik.values.grcNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {formik.touched.grcNumber && formik.errors.grcNumber && (
                <p className="text-red-500 text-sm">
                  {formik.errors.grcNumber as string}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="roomNumber"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Room Number
              </label>
              <input
                id="roomNumber"
                name="roomNumber"
                type="text"
                value={formik.values.roomNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {formik.touched.roomNumber && formik.errors.roomNumber && (
                <p className="text-red-500 text-sm">
                  {formik.errors.roomNumber as string}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="checkInDate"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Check-in Date
              </label>
              <input
                id="checkInDate"
                name="checkInDate"
                type="date"
                value={formik.values.checkInDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {formik.touched.checkInDate && formik.errors.checkInDate && (
                <p className="text-red-500 text-sm">
                  {formik.errors.checkInDate as string}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="checkOutDate"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Check-out Date
              </label>
              <input
                id="checkOutDate"
                name="checkOutDate"
                type="date"
                value={formik.values.checkOutDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {formik.touched.checkOutDate && formik.errors.checkOutDate && (
                <p className="text-red-500 text-sm">
                  {formik.errors.checkOutDate as string}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8">
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
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
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
                Only PDFs files are allowed
              </p>
            </div>
            {formik.touched.documents && formik.errors.documents && (
              <p className="text-red-500 text-sm mt-2">
                {formik.errors.documents as string}
              </p>
            )}

            {/* Display Selected Files */}
            {formik.values.documents.length > 0 && (
              <ul className="mt-3 space-y-2">
                {formik.values.documents.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                  >
                    <span className="text-sm">{file.name}</span>
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

          <div className="mt-8">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none transition duration-150 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed font-medium cursor-pointer"
            >
              {formik.isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Continue to Booking"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
