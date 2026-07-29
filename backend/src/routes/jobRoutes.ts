import { Router } from "express";

import {
  createJob,
  deleteJob,
  getJobs,
  getJobById,
  updateJob,
} from "../controllers/jobController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

import {
  createJobSchema,
  updateJobSchema,
} from "../validators/jobValidator.js";

const router = Router();

router.use(authenticate);

router.get("/", getJobs);
router.get("/:id", getJobById);

router.post(
  "/",
  validateRequest(createJobSchema),
  createJob
);

router.patch(
  "/:id",
  validateRequest(updateJobSchema),
  updateJob
);

router.delete("/:id", deleteJob);

export default router;