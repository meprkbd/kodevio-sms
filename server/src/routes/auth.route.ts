import express from "express";

import {
  forgotPassword,
  login,
  logout,
  register,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.schemas.js";

const router = express.Router();

router.route("/register").post(validate(registerSchema), register);
router.route("/login").post(validate(loginSchema), login);
router.route("/logout").post(logout);

router.route("/password/forgot").post(forgotPassword);
router.route("/reset/otp/verify").post(verifyOtp);

export default router;
