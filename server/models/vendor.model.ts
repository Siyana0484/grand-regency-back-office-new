import mongoose, { Schema, Document } from "mongoose";

export interface IVendor extends Document {
  name: string;
  email?: string;
  phone: string;
  gstin: string;
  address?: string;
  contactPerson: string;
}

const VendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: true, unique: true },
    gstin: { type: String, required: true },
    address: { type: String, required: false },
    contactPerson: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IVendor>("Vendor", VendorSchema);
