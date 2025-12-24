import type { NextFunction, Request, Response } from "express";

type AsyncErrorType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const catchAsyncErrors =
  (fn: AsyncErrorType) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
