import { Router } from "express";

import { matchJob } from "../controllers/jobMatchController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { jobMatchSchema } from "../validators/jobMatchValidator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validateRequest(jobMatchSchema),
  matchJob
);

export default router;