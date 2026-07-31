import { Router } from "express";

import { createResumeJobMatch } from "../controllers/resumeJobMatchController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createResumeJobMatchSchema } from "../validators/matchValidator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validateRequest(createResumeJobMatchSchema),
  createResumeJobMatch
);

export default router;