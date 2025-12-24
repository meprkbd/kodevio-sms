import express from "express";

import { login, register } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.schemas.js";

const router = express.Router();

router.route("/register").post(validate(registerSchema), register);
router.route("/login").post(validate(loginSchema), login);

export default router;
