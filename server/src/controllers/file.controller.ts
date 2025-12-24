import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import File from "../models/file.model.js";
import ApiError from "../utils/apiError.js";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import { ENV } from "../config/env.js";
import { ensureDir } from "../utils/ensureuploadDir.js";

export const uploadFile = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const { folderId } = req.params;
    if (!folderId) {
      throw new ApiError(400, "Folder ID is required");
    }

    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    const file = await File.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      folder: folderId,
      user: req.user!.id,
    });

    res.status(201).json({
      success: true,
      data: file,
    });
  }
);

export const getFilesByFolder = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const { folderId } = req.params;
    if (!folderId) {
      throw new ApiError(400, "Folder ID is required");
    }

    const files = await File.find({
      folder: folderId,
      user: req.user!.id,
    });
    res.json({ success: true, data: files });
  }
);

export const getFiles = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const { type, folderId, page = "1", limit = "10" } = req.query;

    const filter: any = { user: req.user!.id };

    // Filter by folder
    if (folderId) {
      filter.folder = folderId;
    }

    // Filter by file type
    if (type === "pdf") {
      filter.mimeType = "application/pdf";
    }

    if (type === "image") {
      filter.mimeType = { $regex: "^image/" };
    }

    if (type === "note") {
      filter.mimeType = {
        $in: [
          "text/plain",
          "text/markdown",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      };
    }

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;

    const [files, total] = await Promise.all([
      File.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      File.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      data: files,
    });
  }
);

// Toggle favorite status
export const toggleFavorite = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const file = await File.findOne({
      _id: req.params.fileId,
      user: req.user!.id,
    });

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    file.isFavorite = !file.isFavorite;
    await file.save();

    res.status(200).json({
      success: true,
      message: file.isFavorite ? "Added to favorites" : "Removed from favorites",
      data: file,
    });
  }
);

// Get all favorite files
export const getFavoriteFiles = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const { page = "1", limit = "10" } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * pageSize;

    const filter = { user: req.user!.id, isFavorite: true };

    const [files, total] = await Promise.all([
      File.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(pageSize),
      File.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      data: files,
    });
  }
);

// Copy file to another folder
export const copyFile = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const { targetFolderId } = req.body;

    if (!targetFolderId) {
      throw new ApiError(400, "Target folder ID is required");
    }

    const file = await File.findOne({
      _id: req.params.fileId,
      user: req.user!.id,
    });

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    // Create new file path
    const targetPath = path.join("uploads", "folders", targetFolderId);
    ensureDir(targetPath);

    const newFileName = `${Date.now()}-${file.originalName}`;
    const newFilePath = path.join(targetPath, newFileName);

    // Copy file on disk
    fs.copyFileSync(file.path, newFilePath);

    // Create new file record
    const newFile = await File.create({
      originalName: file.originalName,
      fileName: newFileName,
      path: newFilePath,
      mimeType: file.mimeType,
      size: file.size,
      folder: targetFolderId,
      user: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: "File copied successfully",
      data: newFile,
    });
  }
);

// Rename file
export const renameFile = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const { newName } = req.body;

    if (!newName) {
      throw new ApiError(400, "New name is required");
    }

    const file = await File.findOne({
      _id: req.params.fileId,
      user: req.user!.id,
    });

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    file.originalName = newName;
    await file.save();

    res.status(200).json({
      success: true,
      message: "File renamed successfully",
      data: file,
    });
  }
);

// Duplicate file in same folder
export const duplicateFile = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const file = await File.findOne({
      _id: req.params.fileId,
      user: req.user!.id,
    });

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    // Create new file path in same folder
    const folderPath = path.dirname(file.path);
    const ext = path.extname(file.originalName);
    const baseName = path.basename(file.originalName, ext);
    const newOriginalName = `${baseName} (copy)${ext}`;
    const newFileName = `${Date.now()}-${newOriginalName}`;
    const newFilePath = path.join(folderPath, newFileName);

    // Copy file on disk
    fs.copyFileSync(file.path, newFilePath);

    // Create new file record
    const newFile = await File.create({
      originalName: newOriginalName,
      fileName: newFileName,
      path: newFilePath,
      mimeType: file.mimeType,
      size: file.size,
      folder: file.folder,
      user: req.user!.id,
    });

    res.status(201).json({
      success: true,
      message: "File duplicated successfully",
      data: newFile,
    });
  }
);

// Delete file
export const deleteFile = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const file = await File.findOne({
      _id: req.params.fileId,
      user: req.user!.id,
    });

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    // Delete file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete from database
    await File.deleteOne({ _id: file._id });

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  }
);

// Get recent files (based on accessedAt)
export const getRecentFiles = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const { limit = "10" } = req.query;
    const pageSize = parseInt(limit as string, 10);

    const files = await File.find({ user: req.user!.id })
      .sort({ accessedAt: -1 })
      .limit(pageSize);

    res.status(200).json({
      success: true,
      data: files,
    });
  }
);

// Update file access time (call this when file is opened/viewed)
export const updateFileAccess = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const file = await File.findOneAndUpdate(
      { _id: req.params.fileId, user: req.user!.id },
      { accessedAt: new Date() },
      { new: true }
    );

    if (!file) {
      throw new ApiError(404, "File not found");
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  }
);

// Get storage statistics
export const getStorageStats = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const result = await File.aggregate([
      { $match: { user: req.user!._id } },
      {
        $group: {
          _id: null,
          usedStorage: { $sum: "$size" },
          totalFiles: { $sum: 1 },
        },
      },
    ]);

    const usedStorage = result[0]?.usedStorage || 0;
    const totalStorage = ENV.USER_STORAGE_LIMIT;
    const availableStorage = Math.max(0, totalStorage - usedStorage);

    res.status(200).json({
      success: true,
      data: {
        totalStorage,
        usedStorage,
        availableStorage,
        totalFiles: result[0]?.totalFiles || 0,
        usagePercentage: ((usedStorage / totalStorage) * 100).toFixed(2),
      },
    });
  }
);

// Get storage by file type
export const getStorageByType = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const result = await File.aggregate([
      { $match: { user: req.user!._id } },
      {
        $project: {
          size: 1,
          fileType: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$mimeType", "application/pdf"] },
                  then: "pdf",
                },
                {
                  case: { $regexMatch: { input: "$mimeType", regex: "^image/" } },
                  then: "image",
                },
                {
                  case: { $regexMatch: { input: "$mimeType", regex: "^video/" } },
                  then: "video",
                },
                {
                  case: { $regexMatch: { input: "$mimeType", regex: "^audio/" } },
                  then: "audio",
                },
                {
                  case: {
                    $in: [
                      "$mimeType",
                      [
                        "text/plain",
                        "text/markdown",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      ],
                    ],
                  },
                  then: "document",
                },
              ],
              default: "other",
            },
          },
        },
      },
      {
        $group: {
          _id: "$fileType",
          count: { $sum: 1 },
          size: { $sum: "$size" },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1,
          size: 1,
        },
      },
      { $sort: { size: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);
