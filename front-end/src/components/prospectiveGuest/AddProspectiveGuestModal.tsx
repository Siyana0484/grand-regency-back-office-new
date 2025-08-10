import { useFormik } from "formik";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { AiOutlineClose } from "react-icons/ai";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { prospectiveGuestSchema } from "../../schemas";
import { Success } from "../../helpers/popup";
import { createProspectiveGuest } from "../../apis/ProspectiveGuestApi";
import { useProspectiveGuestStore } from "../../stores/prospectiveGuestStore";

interface AddProspectiveGuestModalProps {
  onClose: () => void;
}

const AddProspectiveGuestModal: React.FC<AddProspectiveGuestModalProps> = ({
  onClose,
}) => {
  const { setProspectiveGuests, prospectiveGuests } =
    useProspectiveGuestStore();
  const axiosPrivate = useAxiosPrivate();
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      description: "",
    },
    validationSchema: prospectiveGuestSchema,
    onSubmit: async (values) => {
      const resp = await createProspectiveGuest(axiosPrivate, values);

      if (resp.success) {
        const updatedGuestList = [resp.newGuest, ...prospectiveGuests];
        setProspectiveGuests(updatedGuestList);
        Success("Prospective Guest added successfully");
      }
      onClose();
    },
    enableReinitialize: true,
  });

  return (
    <div className="fixed inset-0 modal_bg bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative overflow-y-auto max-h-[80vh]">
        <h2 className="text-xl font-semibold">Add Prospective Guest</h2>
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
              Company
            </label>
            <input
              type="text"
              name="company"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.company}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.company && formik.errors.company && (
              <div className="text-red-500 text-sm">
                {formik.errors.company}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Description
            </label>
            <input
              type="text"
              name="description"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              className="w-full p-2 border rounded-lg"
            />
            {formik.touched.description && formik.errors.description && (
              <div className="text-red-500 text-sm">
                {formik.errors.description}
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

export default AddProspectiveGuestModal;
