import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  phoneNumber?: string;
  password?: string; // hashed
  isAdmin?: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: false, trim: true, lowercase: true },
    phoneNumber: { type: String, required: false, trim: true },
    password: { type: String, required: false },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export default model<IUser>("User", UserSchema);
