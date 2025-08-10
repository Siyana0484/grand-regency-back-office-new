import mongoose, { Schema, Document } from "mongoose";

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IToken>("Token", TokenSchema);
