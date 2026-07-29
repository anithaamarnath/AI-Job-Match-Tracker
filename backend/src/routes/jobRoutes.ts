import { Router } from "express";

import {
  createJob,
  deleteJob,
  getAllJobs,
  getJobById,
  updateJob,
} from "../controllers/jobController";

import { validateRequest } from "../middleware/validateRequest";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createJobSchema,
  updateJobSchema,
} from "../validators/jobValidator";

const router = Router();

router.use(authenticate);

router.get("/", getAllJobs);
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