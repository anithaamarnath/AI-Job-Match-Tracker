import { Router } from "express";

import {
  login,
  register,
} from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  loginSchema,
  registerSchema,
} from "../validators/authValidator.js";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  register
);

router.post(
  "/login",
  validateRequest(loginSchema),
  login
);

export default router;