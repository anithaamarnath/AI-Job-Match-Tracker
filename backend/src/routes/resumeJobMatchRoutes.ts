import { Router } from "express";

import {
  createResumeJobMatch,
  deleteResumeJobMatch,
  getResumeJobMatch,
  getResumeJobMatches,
} from "../controllers/resumeJobMatchController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createResumeJobMatchSchema } from "../validators/matchValidator.js";

const router = Router();

router.use(authenticate);

router.get("/", getResumeJobMatches);
router.get("/:id", getResumeJobMatch);

router.post(
  "/",
  validateRequest(createResumeJobMatchSchema),
  createResumeJobMatch
);

router.delete("/:id", deleteResumeJobMatch);

export default router;