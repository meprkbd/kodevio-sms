import mongoose, { Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

import type { IUserDocument } from "../types/user.types.js";
import { ENV } from "../config/env.js";
import { generateOTP } from "../utils/otp.js";

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlen: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    resetPasswordOtp: {
      type: String,
    },
    resetPasswordOtpExpires: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordTokenExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre<IUserDocument>("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Verify password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token method
userSchema.methods.generateAuthToken = function (): string {
  const token = jwt.sign(
    {
      id: this._id,
      email: this.email,
    },
    ENV.JWT_SECRET as Secret,
    {
      expiresIn: ENV.JWT_EXPIRES_IN,
      algorithm: "HS256",
    } as SignOptions
  );
  return token;
};

// Generate Reset Password OTP
userSchema.methods.generateResetPasswordOtp = function (): string {
  const otp = generateOTP();
  this.resetPasswordOtp = crypto.createHash("sha256").update(otp).digest("hex");
  this.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  return otp;
};

// User schema indexes
userSchema.index({ resetPasswordOtp: 1 });

const User = mongoose.model("User", userSchema);

export type UserDocument = mongoose.InferSchemaType<typeof userSchema>;

export default User;
