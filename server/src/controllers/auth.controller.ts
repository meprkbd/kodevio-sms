import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";

import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { clearCookie, setCookie } from "../utils/cookies.js";
import { sendOTP } from "../utils/emails.js";
import { validateAndClearOTP } from "../utils/otp.js";

export const register = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new ApiError(409, "User already exists"));
    }

    await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  }
);

export const login = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    const isPassMatch = await user.comparePassword(password);
    if (!isPassMatch) {
      return next(new ApiError(401, "Invalid email or password"));
    }

    const authToken = user.generateAuthToken();
    setCookie(res, "access_token", authToken);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  }
);

export const logout = catchAsyncErrors(
  async (_req: Request, res: Response, _next: NextFunction) => {
    clearCookie(res, "access_token");
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
);

export const forgotPassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).select(
      "+resetPasswordOtp +resetPasswordOtpExpires"
    );

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    if (
      user.resetPasswordOtp &&
      user.resetPasswordOtpExpires &&
      user.resetPasswordOtpExpires > new Date()
    ) {
      return next(
        new ApiError(
          400,
          "A password reset request is already in progress. Please check your email for the reset OTP."
        )
      );
    }

    const resetOtp = user.generateResetPasswordOtp();
    await user.save({ validateBeforeSave: false });

    await sendOTP(email, resetOtp, user.username);

    res.status(200).json({
      message: `A password reset OTP has been sent to ${user.email}. Please check your inbox to proceed.`,
    });
  }
);

export const verifyOtp = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select(
      "+resetPasswordOtp +resetPasswordOtpExpires"
    );

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    await validateAndClearOTP(user);

    const isOtpValid = user.resetPasswordOtp === hashedOtp;
    if (!isOtpValid) {
      return next(new ApiError(400, "Invalid OTP. Please try again."));
    }

    // Generate reset password token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  }
);

export const resetPassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return next(new ApiError(400, "Password is required"));
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token!)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return next(new ApiError(400, "Invalid or expired reset token"));
    }

    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  }
);
