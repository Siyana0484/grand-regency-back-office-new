import React, { useCallback, useState } from "react";
import { useFormik } from "formik";
import { useDropzone } from "react-dropzone";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { AiOutlineClose } from "react-icons/ai";
import { GuestListType } from "../../types";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { editGuestSchema } from "../../schemas";
import {
  deleteGuest,
  editGuest,
  saveGuestFiles,
  uploadToS3,
} from "../../apis/guestApi";
import { Success } from "../../helpers/popup";
import { usePermissionStore } from "../../stores/permissionStore";

interface EditGuestModalProps {
  guest: GuestListType;
  onClose: () => void;
  setGuest: (
    updateFn: (prevGuests: GuestListType[]) => GuestListType[]
  ) => void;
}

const EditGuestModal: React.FC<EditGuestModalProps> = ({
  guest,
  onClose,
  setGuest,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { hasPermission } = usePermissionStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const formik = useFormik({
    initialValues: {
      name: guest?.name,
      email: guest?.email,
      phone: guest?.phone,
      address: guest?.address,
      dob: guest?.dob,
      documents: guest?.documents || [],
    },
    validationSchema: editGuestSchema,
    onSubmit: async (values) => {
      const removedFiles = guest?.documents?.filter(
        (doc) => !values.documents.includes(doc)
      );
      const newFiles = uploadedFiles.map((file) => file.name);

      const modifiedValues = {
        ...values,
        folder: "guest",
        documents: newFiles,
      };

      // Step 1: Call editGuest API to get signed URLs for new document uploads

      const { signedUrls, updatedGuest } = await editGuest(
        axiosPrivate,
        modifiedValues,
        guest._id,
        removedFiles
      );
      if (!signedUrls) throw new Error("Guest updation failed.");

      // Step 2: Upload documents to S3

      const newUploadedFiles = await uploadToS3(signedUrls, uploadedFiles);

      // Step 3: Save uploaded file references in the database

      const resp = await saveGuestFiles(axiosPrivate, {
        guestId: guest?._id,
        uploadedFiles: newUploadedFiles,
      });
      if (resp.success) {
        // Step 4: Update local guest state
        const finalUpdatedGuest = {
          ...updatedGuest,
          documents: resp.guest.documents,
        };

        setGuest((prevGuests) =>
          prevGuests.map((g) =>
            g._id === finalUpdatedGuest._id ? finalUpdatedGuest : g
          )
        );
        Success("guest updated success fully");
      }
      onClose();
    },
    enableReinitialize: true,
  });

  //handle delete
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this guest?"
    );
    if (!confirmDelete) return;
    try {
      setIsDeleting(true);
      const response = await deleteGuest(axiosPrivate, guest._id);
      if (response.success) {
        setGuest((prevGuests) => prevGuests.filter((g) => g._id !== guest._id));
        Success(response.message);
        onClose();
      }
    } catch (err) {
      console.log("err:", err);
    } finally {
      setIsDeleting(false);
    }
  };

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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[80vh]">
        <h2 className="text-xl font-semibold">Edit Guest Details</h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <AiOutlineClose className="text-2xl" />
        </button>
        <form
          onSubmit={formik.handleSubmit}
          className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Guest Name
            </label>
            <input
              type="text"
              name="name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm">{formik.errors.name}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Guest Email
            </label>
            <input
              type="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Guest Phone
            </label>
            {/* Phone Input with Country Code */}
            <PhoneInput
              country={"in"} // Default country India (+91)
              value={formik.values.phone}
              enableSearch={true} // Allows searching for country code
              inputStyle={{
                width: "100%",
                height: "40px",
                borderRadius: "5px",
                paddingLeft: "48px",
                border: "1px solid",
              }}
              containerStyle={{ width: "100%" }}
              buttonStyle={{ borderRadius: "5px 0 0 5px", border: "1px solid" }}
              onChange={(value) => formik.setFieldValue("phone", value)}
              onBlur={formik.handleBlur}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-red-500 text-sm">{formik.errors.phone}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Guest Address
            </label>
            <textarea
              name="address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address}
              className="w-full p-2 border rounded-lg"
              rows={4} // You can adjust rows as needed
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-red-500 text-sm">
                {formik.errors.address}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Guest Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={
                formik.values.dob
                  ? new Date(formik.values.dob).toISOString().split("T")[0]
                  : ""
              }
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.dob && formik.errors.dob && (
              <div className="text-red-500 text-sm">
                {String(formik.errors.dob)}
              </div>
            )}
          </div>

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

          <div className="col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 cursor-pointer"
            >
              Cancel
            </button>
            {hasPermission("guest:delete") && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg text-white cursor-pointer ${
                  isDeleting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Delete Guest
              </button>
            )}
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

export default EditGuestModal;
