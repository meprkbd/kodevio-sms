import type { Response } from "express";

import { ENV } from "../config/env.js";

export const setCookie = (res: Response, name: string, value: string): void => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: ENV.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: Number(ENV.COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
  });
};
