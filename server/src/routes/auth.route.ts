import express from "express";

import { register } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema } from "../validators/auth.schemas.js";

const router = express.Router();

router.route("/register").post(validate(registerSchema), register);

export default router;
