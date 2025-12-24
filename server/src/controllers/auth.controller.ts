import type { NextFunction, Request, Response } from "express";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

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
