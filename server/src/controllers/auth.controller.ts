import type { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { clearCookie, setCookie } from "../utils/cookies.js";

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
