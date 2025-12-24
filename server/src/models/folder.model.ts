import mongoose, { Schema } from "mongoose";
import type { IFolder } from "../types/folder.types.js";

const folderSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Folder = mongoose.model<IFolder>("Folder", folderSchema);
export default Folder;
