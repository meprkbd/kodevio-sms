import type { NextFunction, Request, Response } from "express";

import ApiError from "../utils/apiError.js";

interface MongooseError extends Error {
  path?: string;
  code?: number;
  keyValue?: Record<string, unknown>;
}

export function errorHandler(
  err: Error | ApiError | MongooseError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose bad ObjectId error
  if (err.name === "CastError") {
    message = `Resource not found. Invalid: ${(err as MongooseError).path}`;
    err = new ApiError(400, message);
  }

  // Handle Mongoose Duplicate Key error
  if ((err as MongooseError).code === 11000) {
    message = `Duplicate ${Object.keys(
      (err as MongooseError).keyValue || {}
    )} entered`;
    err = new ApiError(400, message);
  }

  // Handle Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    message = `Json Web Token is invalid. Please try again`;
    err = new ApiError(400, message);
  }

  // Handle JWT Expire error
  if (err.name === "TokenExpiredError") {
    message = `Json Web Token is expired. Please try again`;
    err = new ApiError(400, message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
