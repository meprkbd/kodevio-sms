import mongoose, { Schema } from "mongoose";

const fileSchema = new Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    folder: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    accessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
fileSchema.index({ user: 1, isFavorite: 1 });
fileSchema.index({ user: 1, accessedAt: -1 });
fileSchema.index({ user: 1, mimeType: 1 });

const File = mongoose.model("File", fileSchema);
export default File;
