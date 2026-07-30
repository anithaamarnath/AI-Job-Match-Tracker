import { Router } from "express";

import { 
  getJobMatchHistory,
  getJobMatchHistoryById,
  matchJob
 } from "../controllers/jobMatchController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { jobMatchSchema } from "../validators/jobMatchValidator.js";

const router = Router();

router.get(
  "/history/:id",
  authenticate,
  getJobMatchHistoryById
);

router.get(
  "/history",
  authenticate,
  getJobMatchHistory
);

router.post(
  "/",
  authenticate,
  validateRequest(jobMatchSchema),
  matchJob
);

export default router;