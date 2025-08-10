import mongoose, { Schema, Document } from "mongoose";

export interface IProspectiveGuest extends Document {
  name: string;
  email?: string;
  phone: string;
  company: string;
  description?: string;
}

const ProspectiveGuestSchema = new Schema<IProspectiveGuest>(
  {
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: true, unique: true },
    company: { type: String, required: true },
    description: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IProspectiveGuest>(
  "ProspectiveGuest",
  ProspectiveGuestSchema
);
