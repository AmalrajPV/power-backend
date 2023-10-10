import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    consumerId: {
      type: String,
      required: true,
      unique: true,
    },
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    expireAt: { type: Date, default: Date.now, expires: 360 },
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);
