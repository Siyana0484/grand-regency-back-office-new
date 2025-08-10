import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPurchase extends Document {
  vendorId: Types.ObjectId;
  item: string;
  quantity: string;
  invoiceNumber: string;
  warrantyPeriod: string;
  value: string;
  purchaseDate: Date;
  documents: string[];
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    item: { type: String, required: true },
    quantity: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    warrantyPeriod: { type: String, required: true },
    value: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    documents: [{ type: String, required: false }],
  },
  { timestamps: true }
);

export default mongoose.model<IPurchase>("Purchase", PurchaseSchema);
