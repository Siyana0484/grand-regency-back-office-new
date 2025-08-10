import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PurchaseFormValues } from "../../types";
import { purchaseSchema } from "../../schemas";
import { createPurchase, savePurchaseFiles } from "../../apis/purchaseApi";
import { uploadToS3 } from "../../apis/guestApi";
import { Success } from "../../helpers/popup";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const PurchaseForm: React.FC = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const initialValues: PurchaseFormValues = {
    phone: location.state?.vendor?.phone,
    vendorName: location.state?.vendor?.name,
    item: "",
    quantity: "",
    invoiceNumber: "",
    warrantyPeriod: "",
    value: "",
    purchaseDate: "",
    documents: [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: purchaseSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const modifiedValues = {
          ...values,
          documents: values.documents.map((file) => file.name),
        };

        // Remove vendor Name and phone dynamically
        delete modifiedValues.vendorName;
        delete modifiedValues.phone;

        const { purchaseId, signedUrls } = await createPurchase(
          axiosPrivate,
          modifiedValues,
          "purchases",
          location.state?.vendor?.vendorId
        );
        if (!purchaseId || !signedUrls)
          throw new Error("Purchase file upload failed.");

        // Step 2: Upload documents to S3

        const uploadedFiles = await uploadToS3(signedUrls, values.documents);
        const resp = await savePurchaseFiles(axiosPrivate, {
          purchaseId,
          uploadedFiles,
        });
        if (resp.success) {
          Success("purchase created successfully");
          navigate("/purchases");
        }
      } catch (error) {
        console.error("Error creating purchase", error);
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
    <div className="flex justify-center items-center min-h-screen ">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-6">New Purchase</h2>

        {/* Customer Details Card */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{formik.values.vendorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{formik.values.phone}</p>
            </div>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label
                htmlFor="purchaseItem"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Purchase Item
              </label>
              <input
                id="purchaseItem"
                name="item"
                type="text"
                value={formik.values.item}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {formik.touched.item && formik.errors.item && (
                <p className="text-red-500 text-sm">
                  {formik.errors.item as string}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="quantity"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Purchase Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="text"
                value={formik.values.quantity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {formik.touched.quantity && formik.errors.quantity && (
                <p className="text-red-500 text-sm">
                  {formik.errors.quantity as string}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="invoiceNumber"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Invoice Number
              </label>
              <input
                id="invoiceNumber"
                name="invoiceNumber"
                type="text"
                value={formik.values.invoiceNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {formik.touched.invoiceNumber && formik.errors.invoiceNumber && (
                <p className="text-red-500 text-sm">
                  {formik.errors.invoiceNumber as string}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="warrantyPeriod"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Warranty Periond
              </label>
              <input
                id="warrantyPeriod"
                name="warrantyPeriod"
                type="text"
                value={formik.values.warrantyPeriod}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {formik.touched.warrantyPeriod &&
                formik.errors.warrantyPeriod && (
                  <p className="text-red-500 text-sm">
                    {formik.errors.warrantyPeriod as string}
                  </p>
                )}
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="value"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Purchase Value
              </label>
              <input
                id="value"
                name="value"
                type="text"
                value={formik.values.value}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {formik.touched.value && formik.errors.value && (
                <p className="text-red-500 text-sm">
                  {formik.errors.value as string}
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="purchaseDate"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Purchase Date
              </label>
              <input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formik.values.purchaseDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {formik.touched.purchaseDate && formik.errors.purchaseDate && (
                <p className="text-red-500 text-sm">
                  {formik.errors.purchaseDate as string}
                </p>
              )}
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
                "Add Purchase"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseForm;
