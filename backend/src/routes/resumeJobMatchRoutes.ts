import { Router } from "express";

import {
  createResumeJobMatch,
  deleteResumeJobMatch,
  getResumeJobMatchById,
  getResumeJobMatchHistory,
} from "../controllers/resumeJobMatchController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createResumeJobMatchSchema } from "../validators/matchValidator.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validateRequest(createResumeJobMatchSchema),
  createResumeJobMatch
);

router.get("/", getResumeJobMatchHistory);

router.get("/:id", getResumeJobMatchById);

router.delete("/:id", deleteResumeJobMatch);

export default router;