import React, { useCallback, useState } from "react";
import { useFormik } from "formik";
import { AiOutlineClose } from "react-icons/ai";
import { useDropzone } from "react-dropzone";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { usePurchaseStore } from "../../stores/purchaseStore";
import { purchaseSchema } from "../../schemas";
import { editPurchase, savePurchaseFiles } from "../../apis/purchaseApi";
import { uploadToS3 } from "../../apis/guestApi";
import { Success } from "../../helpers/popup";

interface BookingModalProps {
  onClose: () => void;
}

const EditPurchaseModal: React.FC<BookingModalProps> = ({ onClose }) => {
  const axiosPrivate = useAxiosPrivate();
  const { selectedPurchase, updateSelectedPurchase } = usePurchaseStore();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const formik = useFormik({
    initialValues: {
      item: selectedPurchase?.item || "",
      invoiceNumber: selectedPurchase?.invoiceNumber || "",
      warrantyPeriod: selectedPurchase?.warrantyPeriod || "",
      value: selectedPurchase?.value || "",
      quantity: selectedPurchase?.quantity || "",
      purchaseDate: selectedPurchase?.purchaseDate
        ? new Date(selectedPurchase.purchaseDate).toISOString().split("T")[0]
        : "",
      documents: selectedPurchase?.documents || [],
    },
    enableReinitialize: true,
    validationSchema: purchaseSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const removedFiles = selectedPurchase?.documents?.filter(
          (doc) => !values.documents.includes(doc)
        );
        const newFiles = uploadedFiles.map((file) => file.name);
        const modifiedValues = {
          ...values,
          documents: newFiles,
        };

        // Step 1: Call editGuest API to get signed URLs for new document uploads

        const { signedUrls, updatedPurchase } = await editPurchase(
          axiosPrivate,
          modifiedValues,
          "purchases",
          selectedPurchase?._id,
          removedFiles ?? []
        );
        if (!signedUrls) throw new Error("Purchase updation failed.");

        // Step 2: Upload documents to S3

        const newUploadedFiles = await uploadToS3(signedUrls, uploadedFiles);

        // Step 3: Save uploaded file references in the database

        const resp = await savePurchaseFiles(axiosPrivate, {
          purchaseId: selectedPurchase?._id,
          uploadedFiles: newUploadedFiles,
        });
        if (resp.success) {
          const finalUpdatedBooking = {
            ...updatedPurchase,
            documents: resp.updatedFiles,
            vendor: {
              name: selectedPurchase?.vendor?.name,
              email: selectedPurchase?.vendor?.email,
              phone: selectedPurchase?.vendor.phone,
              address: selectedPurchase?.vendor.address,
              gstin: selectedPurchase?.vendor.gstin,
            },
          };

          updateSelectedPurchase(finalUpdatedBooking);
          Success("Purchase updated successfully");
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

  return (
    <div className="fixed inset-0 modal_bg bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] p-6 relative overflow-y-auto">
        <h2 className="text-xl font-semibold">Edit Purchase</h2>
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
          {/* Room Number */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Purchase Item
            </label>
            <input
              type="text"
              name="item"
              value={formik.values.item}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.item && formik.errors.item && (
              <p className="text-red-500 text-sm">{formik.errors.item}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Purchase Quantity
            </label>
            <input
              type="text"
              name="quantity"
              value={formik.values.quantity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.quantity && formik.errors.quantity && (
              <p className="text-red-500 text-sm">{formik.errors.quantity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Invoice Number
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formik.values.invoiceNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.quantity && formik.errors.invoiceNumber && (
              <p className="text-red-500 text-sm">
                {formik.errors.invoiceNumber}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Purchase Value
            </label>
            <input
              type="text"
              name="value"
              value={formik.values.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.quantity && formik.errors.value && (
              <p className="text-red-500 text-sm">{formik.errors.value}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Warranty Period
            </label>
            <input
              type="text"
              name="warrantyPeriod"
              value={formik.values.warrantyPeriod}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.quantity && formik.errors.warrantyPeriod && (
              <p className="text-red-500 text-sm">
                {formik.errors.warrantyPeriod}
              </p>
            )}
          </div>

          {/* purchase date */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formik.values.purchaseDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.purchaseDate && formik.errors.purchaseDate && (
              <p className="text-red-500 text-sm">
                {formik.errors.purchaseDate}
              </p>
            )}
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

export default EditPurchaseModal;
