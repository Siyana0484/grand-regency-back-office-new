import mongoose, { Schema, Document } from "mongoose";

export interface IGuest extends Document {
  name: string;
  email?: string;
  phone: string;
  dob?: Date;
  address?: string;
  documents?: string[];
  prospectiveGuest?: mongoose.Schema.Types.ObjectId;
}

const GuestSchema = new Schema<IGuest>(
  {
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: true, unique: true },
    dob: { type: Date, required: false },
    address: { type: String, required: false },
    documents: [{ type: String }],
    prospectiveGuest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProspectiveGuest",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IGuest>("Guest", GuestSchema);
