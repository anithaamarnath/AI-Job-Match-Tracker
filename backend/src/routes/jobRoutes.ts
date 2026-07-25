import { Router } from "express";
import {
  createJob,
  getAllJobs,
} from "../controllers/jobController";
import { validateRequest } from "../middleware/validateRequest";
import { createJobSchema } from "../validators/jobValidator";

const router = Router();

router.get("/", getAllJobs);

router.post(
  "/",
  validateRequest(createJobSchema),
  createJob
);

export default router;