import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  roles: mongoose.Schema.Types.ObjectId[]; // Multiple Roles
  isAdmin: Boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
