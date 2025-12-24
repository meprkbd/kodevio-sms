import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodError } from "zod";
import ApiError from "../utils/apiError.js";

type ValidationTarget = "body" | "params" | "query";

export const validate =
  (schema: ZodSchema, target: ValidationTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req[target];

      const parsed = schema.parse(data);

      req[target] = parsed;
      next();
    } catch (error) {
      const zodError = error as ZodError;

      const message = zodError.issues?.[0]?.message || "Invalid request data";

      next(new ApiError(400, message));
    }
  };
