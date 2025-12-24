import { Router } from "express";
import { createFolder, getFolders } from "../controllers/folder.controller.js";
import { isAuthUser } from "../middlewares/auth.js";
const router = Router();

router.use(isAuthUser);

router.post("/", createFolder);
router.get("/", getFolders);

export default router;
