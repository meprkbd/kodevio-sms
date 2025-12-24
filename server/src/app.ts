import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";
import hpp from "hpp";

import type { Request, Response } from "express";
import { ENV } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.route.js";
import folderRoutes from "./routes/folder.route.js";
import fileRoutes from "./routes/file.route.js";

const app = express();

// trust reverse proxy
app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ENV.NODE_ENV === "development" ? true : ENV.CLIENT_URL,
    credentials: true,
  })
);
app.use(helmet());
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 100,
  max: ENV.NODE_ENV === "development" ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server running successfully",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("api/v1/folders", folderRoutes);
app.use("/api/v1/files", fileRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// global error handler
app.use(errorHandler);

export default app;
