import { Router } from "express";
import { getFeatures } from "../controllers/featureController";

const router = Router();

router.get("/", getFeatures);

export default router;