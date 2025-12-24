import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { isAuthUser } from "../middlewares/auth.js";
import {
  getFiles,
  getFilesByFolder,
  uploadFile,
  toggleFavorite,
  getFavoriteFiles,
  copyFile,
  renameFile,
  duplicateFile,
  deleteFile,
  getRecentFiles,
  updateFileAccess,
  getStorageStats,
  getStorageByType,
} from "../controllers/file.controller.js";

const router = Router();

// All routes require authentication
router.use(isAuthUser);

// Storage & stats routes
router.get("/storage/stats", getStorageStats);
router.get("/storage/type", getStorageByType);

// Special file list routes
router.get("/recent", getRecentFiles);
router.get("/favorites", getFavoriteFiles);

// File operations by ID
router.patch("/:fileId/favorite", toggleFavorite);
router.patch("/:fileId/access", updateFileAccess);
router.patch("/:fileId/rename", renameFile);
router.post("/:fileId/copy", copyFile);
router.post("/:fileId/duplicate", duplicateFile);
router.delete("/:fileId", deleteFile);

// List and upload
router.get("/", getFiles);
router.post("/:folderId", upload.single("file"), uploadFile).get("/:folderId", getFilesByFolder);

export default router;
