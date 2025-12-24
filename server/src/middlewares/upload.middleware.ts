import multer from "multer";
import path from "path";
import { ensureDir } from "../utils/ensureuploadDir.js";

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const folderName = req.params.folderId;
    const uploadPath = path.join("uploads", "folders", folderName!);

    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });
