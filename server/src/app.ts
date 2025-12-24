import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";
import hpp from "hpp";

import type { Request, Response } from "express";
import { ENV } from "./config/env.js";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  })
);
app.use(helmet());
app.use(hpp());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 100,
  max: ENV.NODE_ENV === "development" ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req: Request, res: Response) => {
  res.send("Server running successfully!");
});

export default app;
