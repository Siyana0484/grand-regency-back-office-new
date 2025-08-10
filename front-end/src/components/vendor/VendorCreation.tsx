import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { vendorSchema } from "../../schemas";
import { VendorType } from "../../types";
import { Success } from "../../helpers/popup";
import { createVendor } from "../../apis/vendorApi";

const VendorCreation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();

  const initialValues: VendorType = {
    name: "",
    email: "",
    phone: location.state?.phone || null,
    address: "",
    contactPerson: "",
    gstin: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema: vendorSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const resp = await createVendor(axiosPrivate, values);

        if (resp.success) {
          Success("vendor created success fully");
          navigate("/purchase-form", {
            state: {
              vendor: {
                name: resp.vendor.name,
                phone: resp.vendor.phone,
                vendorId: resp.vendor._id,
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

  return (
    <div className="flex justify-center items-center min-h-screen overflow-auto bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full min-h-screen">
        <h2 className="text-2xl font-bold text-center mb-6">
          Vendor Registration
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GSTIN */}
            <div className="flex flex-col">
              <label
                htmlFor="gstin"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                GSTIN<span className="text-red-600">*</span>
              </label>
              <input
                id="gstin-number"
                name="gstin"
                type="text"
                value={formik.values.gstin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border p-3 rounded-md shadow-sm focus:ring-blue-500"
              />
              {formik.touched.gstin && formik.errors.gstin && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.gstin}
                </p>
              )}
            </div>
            {/* contact person */}
            <div className="flex flex-col">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Contact Person<span className="text-red-600">*</span>
              </label>
              <input
                id="contactPerson"
                name="contactPerson"
                type="text"
                value={formik.values.contactPerson}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="border p-3 rounded-md shadow-sm focus:ring-blue-500"
              />
              {formik.touched.contactPerson && formik.errors.contactPerson && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.contactPerson}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 cursor-pointer mt-3"
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

export default VendorCreation;
