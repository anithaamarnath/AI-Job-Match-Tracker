import { Router } from "express";
import { getFeatures } from "../controllers/featureController.js";

const router = Router();

router.get("/", getFeatures);

export default router;