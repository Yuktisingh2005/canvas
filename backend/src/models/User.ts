import { Schema, model, type Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Compare a plaintext password against the stored hash — used by the login controller.
userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Never leak the hash if a User document is ever serialized directly.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const { passwordHash, ...rest } = ret;
    return rest;
  },
});

export const User = model<IUser>("User", userSchema);