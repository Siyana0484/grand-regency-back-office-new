import React, { useState } from "react";
import { useFormik } from "formik";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { AiOutlineClose } from "react-icons/ai";
import { VendorType } from "../../types";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { vendorSchema } from "../../schemas";
import { deleteVendor, editVendor } from "../../apis/vendorApi";
import { Success } from "../../helpers/popup";
import { usePermissionStore } from "../../stores/permissionStore";

interface EditVendorModalProps {
  vendor: VendorType;
  onClose: () => void;
  setVendor: (updateFn: (prevGuests: VendorType[]) => VendorType[]) => void;
}

const EditVendorModal: React.FC<EditVendorModalProps> = ({
  vendor,
  onClose,
  setVendor,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const { hasPermission } = usePermissionStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const formik = useFormik({
    initialValues: {
      name: vendor?.name,
      email: vendor?.email,
      phone: vendor?.phone,
      address: vendor?.address,
      contactPerson: vendor?.contactPerson,
      gstin: vendor?.gstin,
    },
    validationSchema: vendorSchema,
    onSubmit: async (values) => {
      // Step 1: Call editGuest API to get signed URLs for new document uploads

      const resp = await editVendor(axiosPrivate, values, vendor._id);

      if (resp.success) {
        setVendor((prevVendor) =>
          prevVendor.map((g) =>
            g._id === resp.updatedVendor._id ? resp.updatedVendor : g
          )
        );
        Success("Vendor updated success fully");
      }
      onClose();
    },
    enableReinitialize: true,
  });

  //handle delete
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vendor?"
    );
    if (!confirmDelete) return;
    try {
      setIsDeleting(true);
      const response = await deleteVendor(axiosPrivate, vendor._id);
      if (response.success) {
        setVendor((prevVendors) =>
          prevVendors.filter((g) => g._id !== vendor._id)
        );
        Success(response.message);
        onClose();
      }
    } catch (err) {
      console.log("err:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 modal_bg bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[80vh]">
        <h2 className="text-xl font-semibold">Edit Vendor Details</h2>
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
              Name
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
              Email
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
              Phone
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
              GSTIN
            </label>
            <input
              type="text"
              name="gstin"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.gstin}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.gstin && formik.errors.gstin && (
              <div className="text-red-500 text-sm">{formik.errors.gstin}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Contacted Person
            </label>
            <input
              type="text"
              name="contactPerson"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.contactPerson}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.contactPerson && formik.errors.contactPerson && (
              <div className="text-red-500 text-sm">
                {formik.errors.contactPerson}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Address
            </label>
            <input
              type="text"
              name="address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-red-500 text-sm">
                {formik.errors.address}
              </div>
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

            {hasPermission("vendor:delete") && (
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
                Delete Vendor
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

export default EditVendorModal;
