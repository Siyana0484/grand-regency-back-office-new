import mongoose, { Schema, Document, Types } from "mongoose";

export interface CoStayer {
  name: string;
  phone: string;
  relation: string;
  dob: string;
}

export interface AdditionalPurchase {
  item: string;
  cost: string;
}

export interface DamageCost {
  item: string;
  cost: string;
}

export interface IBooking extends Document {
  guestId: Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  coStayers?: CoStayer[];
  grcNumber: string;
  roomNumber: string;
  documents?: string[];
  additionalPurchase?: AdditionalPurchase[];
  damageCost?: DamageCost[];
  prospectiveGuest?: {
    _id: mongoose.Types.ObjectId;
    name: string;
  };
}

const BookingSchema = new Schema<IBooking>(
  {
    guestId: { type: Schema.Types.ObjectId, ref: "Guest", required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    coStayers: [
      {
        name: { type: String, required: false },
        relation: { type: String, required: false },
        dob: { type: String, required: false },
      },
    ],
    grcNumber: { type: String, required: true },
    roomNumber: { type: String, required: true },
    documents: [{ type: String, required: false }],
    additionalPurchase: [
      {
        item: { type: String, required: false },
        cost: { type: String, required: false },
      },
    ],
    damageCost: [
      {
        item: { type: String, required: false },
        cost: { type: String, required: false },
      },
    ],
    prospectiveGuest: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "ProspectiveGuest" },
      name: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", BookingSchema);
