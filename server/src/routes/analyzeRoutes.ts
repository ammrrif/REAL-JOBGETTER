import { Router } from "express";
import { analyzeHandler } from "../controllers/analyzeController";

const router = Router();

router.post("/analyze", analyzeHandler);

export default router;
