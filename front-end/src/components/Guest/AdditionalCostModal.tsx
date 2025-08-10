import { useFormik } from "formik";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { additionalCostSchema } from "../../schemas";
import { addAdditionalCost } from "../../apis/bookingApi";
import { Success } from "../../helpers/popup";

interface AdditionalCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    newEntry: { item: string; cost: string },
    type: "additionalPurchase" | "damageCost"
  ) => void;
  type: "additionalPurchase" | "damageCost";
  id: string;
}

const AdditionalCostModal: React.FC<AdditionalCostModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  type,
  id,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const formik = useFormik({
    initialValues: { item: "", cost: "" },
    validationSchema: additionalCostSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await addAdditionalCost(
          axiosPrivate,
          values,
          type,
          id
        );
        if (response?.success) {
          onAdd(values, type);
          resetForm();
          Success(response?.message);
          onClose();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center modal_bg bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4">
          Add {type === "damageCost" ? "Damage Cost" : "Additional Purchase"}
        </h2>

        <form onSubmit={formik.handleSubmit}>
          <label className="block text-sm font-medium text-gray-700">
            Item
          </label>
          <input
            type="text"
            name="item"
            value={formik.values.item}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border rounded-lg mb-2"
            placeholder="Enter item name"
          />
          {formik.touched.item && formik.errors.item && (
            <p className="text-red-500 text-xs">{formik.errors.item}</p>
          )}

          <label className="block text-sm font-medium text-gray-700">
            Cost
          </label>
          <input
            type="text"
            name="cost"
            value={formik.values.cost}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full p-2 border rounded-lg mb-4"
            placeholder="Enter cost"
          />
          {formik.touched.cost && formik.errors.cost && (
            <p className="text-red-500 text-xs">{formik.errors.cost}</p>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`px-4 py-2 rounded-lg text-white cursor-pointer ${
                formik.isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {formik.isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdditionalCostModal;
