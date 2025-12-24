import type { NextFunction, Request, Response } from "express";
import jwt, { type Secret } from "jsonwebtoken";

import { ENV } from "../config/env.js";
import User from "../models/user.model.js";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import ApiError from "../utils/apiError.js";

export const isAuthUser = catchAsyncErrors(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authToken =
      req.cookies?.access_token || req.headers.authorization?.split(" ")[1];

    if (!authToken) {
      return next(
        new ApiError(
          401,
          "Unauthorized: Please log in to access this resource."
        )
      );
    }

    let decodedData;
    try {
      decodedData = jwt.verify(authToken, ENV.JWT_SECRET as Secret) as {
        id: string;
        email: string;
      };
    } catch (error) {
      return next(
        new ApiError(401, "Invalid or expired token. Please log in again.")
      );
    }

    const user = await User.findById(decodedData.id);
    if (!user) {
      return next(new ApiError(401, "User not found."));
    }

    req.user = user;
    next();
  }
);
