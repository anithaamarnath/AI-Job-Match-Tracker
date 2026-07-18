import { Router } from "express";
import { createJob } from "../controllers/jobController";
import { validateRequest } from "../middleware/validateRequest";
import { createJobSchema } from "../validators/jobValidator";

const router = Router();

router.post(
  "/",
  validateRequest(createJobSchema),
  createJob
);

export default router;