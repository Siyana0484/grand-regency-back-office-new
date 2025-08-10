import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  roleName: string;
  permissions: string[];
}

const RoleSchema = new Schema<IRole>(
  {
    roleName: { type: String, required: true, unique: true },
    permissions: [
      {
        type: String,
        enum: [
          "user:create",
          "user:read",
          "user:update",
          "user:delete",
          "role:create",
          "role:read",
          "role:update",
          "role:delete",
          "booking:read",
          "booking:read:single",
          "booking:create",
          "booking:update",
          "booking:delete",
          "guest:read",
          "guest:update",
          "guest:delete",
          "vendor:read",
          "vendor:update",
          "vendor:delete",
          "purchase:read",
          "purchase:create",
          "purchase:update",
          "purchase:delete",
          "prospective-guest:create",
          "prospective-guest:read",
          "prospective-guest:update",
          "prospective-guest:delete",
          "meeting:create",
          "meeting:update",
          "meeting:delete",
          "guest:files:read",
          "booking:files:read",
          "purchase:files:read",
          "guest:file:download",
          "booking:file:download",
          "purchase:file:download",
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IRole>("Role", RoleSchema);
