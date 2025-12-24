import express from "express";

import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validators/auth.schemas.js";

const router = express.Router();

router.route("/register").post(validate(registerSchema), register);
router.route("/login").post(validate(loginSchema), login);
router.route("/logout").post(logout);

router
  .route("/password/forgot")
  .post(validate(forgotPasswordSchema), forgotPassword);
router.route("/reset/otp/verify").post(validate(verifyOtpSchema), verifyOtp);
router.route("/reset/:token").put(validate(resetPasswordSchema), resetPassword);

export default router;
