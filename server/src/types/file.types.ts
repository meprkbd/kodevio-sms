import type { Document, Types } from "mongoose";

export interface IFile extends Document {
  originalName: string;
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
  folder: Types.ObjectId;
  user: Types.ObjectId;
  isFavorite: boolean;
  accessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageStats {
  totalStorage: number;
  usedStorage: number;
  availableStorage: number;
}

export interface FileTypeStats {
  type: string;
  count: number;
  size: number;
}
