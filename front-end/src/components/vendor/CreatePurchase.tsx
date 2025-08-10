import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { phoneSchema } from "../../schemas";
import { verifieVendorNumber } from "../../apis/vendorApi";

const CreatePurchase = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      phoneNumber: "",
    },
    validationSchema: phoneSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const resp = await verifieVendorNumber(axiosPrivate, values);
        if (resp.exists) {
          navigate("/purchase-form", {
            state: {
              vendor: {
                name: resp.vendor[0].name,
                phone: resp.vendor[0].phone,
                vendorId: resp.vendor[0]._id,
              },
            },
          });
        } else {
          navigate("/vendor-creation", {
            state: { phone: values.phoneNumber },
          });
        }
      } catch (error) {
        console.error("Verification failed:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center mb-4">
          Enter Vendor Mobile Number
        </h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
        <input type="text" style={{ display: "none" }} />
          {/* Phone Input with Country Code */}
          <PhoneInput
            country={"in"} // Default country India (+91)
            value={formik.values.phoneNumber}
            enableSearch={true} // Allows searching for country code
            inputStyle={{
              width: "100%",
              height: "40px",
              borderRadius: "5px",
              paddingLeft: "48px",
              border: "1px solid #ccc",
            }}
            containerStyle={{ width: "100%" }}
            buttonStyle={{ borderRadius: "5px 0 0 5px" }}
            onChange={(value) => formik.setFieldValue("phoneNumber", value)} // ✅ Correct way to update Formik state
            onBlur={formik.handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                formik.handleSubmit();
              }
            }}
          />
          {formik.errors.phoneNumber && formik.touched.phoneNumber && (
            <div className="text-red-500 text-sm">
              {formik.errors.phoneNumber}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchase;
