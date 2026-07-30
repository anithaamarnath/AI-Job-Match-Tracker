import { Router } from "express";

import { uploadResumeFile } from "../controllers/resumeController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { uploadResume } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post(
  "/upload",
  authenticate,
  uploadResume.single("resume"),
  uploadResumeFile
);

export default router;