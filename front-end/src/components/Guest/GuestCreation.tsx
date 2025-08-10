import React, { useCallback } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { GuestCreationType } from "../../types";
import { guestSchema } from "../../schemas";
import { createGuest, saveGuestFiles, uploadToS3 } from "../../apis/guestApi";
import { Success } from "../../helpers/popup";

const GuestCreation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();

  const initialValues: GuestCreationType = {
    name: "",
    email: "",
    phone: location.state?.phone || null,
    dob: "",
    address: "",
    documents: [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: guestSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const modifiedValues = {
          ...values,
          documents: values.documents.map((file) => file.name),
          folder: "guest",
        };
        const { guestId, signedUrls } = await createGuest(
          axiosPrivate,
          modifiedValues
        );
        if (!guestId || !signedUrls) throw new Error("Guest creation failed.");

        // Step 2: Upload documents to S3

        const uploadedFiles = await uploadToS3(signedUrls, values.documents);

        const resp = await saveGuestFiles(axiosPrivate, {
          guestId,
          uploadedFiles,
        });
        if (resp.success) {
          Success("guest created success fully");
          navigate("/booking-form", {
            state: {
              guest: {
                name: resp.guest.name,
                phone: resp.guest.phone,
                guestId: resp.guest._id,
              },
            },
          });
        }
      } catch (error) {
        console.error("Error creating guest:", error);
        setErrors({ name: "Something went wrong. Please try again." });
      } finally {
        setSubmitting(false);
      }
    },
  });
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
    <div className="flex justify-center items-center min-h-screen overflow-auto bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full min-h-screen">
        <h2 className="text-2xl font-bold text-center mb-6">
          Guest Registration
        </h2>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Name<span className="text-red-600">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border p-3 rounded-md shadow-sm focus:ring-blue-500"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Email<span className="text-red-600">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border p-3 rounded-md shadow-sm focus:ring-blue-500"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>
          </div>
          {/* second row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DOB */}
            <div className="flex flex-col">
              <label htmlFor="dob">
                Date of Birth <span className="text-red-600">*</span>
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={formik.values.dob}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border p-3 rounded-md"
              />
              {formik.touched.dob && formik.errors.dob && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.dob}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="flex flex-col col-span-2">
              <label htmlFor="address">
                Address <span className="text-red-600">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border p-3 rounded-md"
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.address}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Phone<span className="text-red-600">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={formik.values.phone}
              readOnly
              className="border p-3 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
            />
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestCreation;
