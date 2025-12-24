import type { Request, Response } from "express";
import Folder from "../models/folder.model.js";

// Create Folder
export const createFolder = async (req: Request, res: Response) => {
  const folder = await Folder.create({ name: req.body.name });
  res.status(201).json({ success: true, data: folder });
};

// Get All Folders
export const getFolders = async (_req: Request, res: Response) => {
  const folders = await Folder.find();
  res.json({ success: true, data: folders });
};
