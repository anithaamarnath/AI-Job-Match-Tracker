import { Router } from "express";

import {
  analyzeResume,
  deleteResume,
  getResume,
  getResumeAnalysis,
  getResumes,
  uploadResumeFile,
} from "../controllers/resumeController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { uploadResume } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post(
  "/upload",
  authenticate,
  uploadResume.single("resume"),
  uploadResumeFile
);

router.get(
  "/",
  authenticate,
  getResumes
);

router.post(
  "/:id/analysis",
  authenticate,
  analyzeResume
);

router.get(
  "/:id/analysis",
  authenticate,
  getResumeAnalysis
);

router.get(
  "/:id",
  authenticate,
  getResume
);

router.delete(
  "/:id",
  authenticate,
  deleteResume
);



export default router;