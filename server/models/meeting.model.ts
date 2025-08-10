import mongoose, { Schema, Document } from "mongoose";

export interface IMeeting extends Document {
  prospectiveGuestId: string;
  date: Date;
  remarks: string;
  attendies: string[];
}

const MeetingSchema = new Schema<IMeeting>(
  {
    prospectiveGuestId: { type: String, required: true },
    date: { type: Date, required: true },
    remarks: { type: String, required: false },
    attendies: { type: [String], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMeeting>("Meeting", MeetingSchema);
