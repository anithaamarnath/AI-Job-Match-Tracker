import { Router } from "express";

import { register } from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema } from "../validators/authValidator.js";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  register
);

export default router;