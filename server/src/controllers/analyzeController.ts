import { Request, Response } from "express";
import { analyzeResume } from "../services/aiService";
import { AnalyzeRequestBody } from "../types";

export function analyzeHandler(req: Request, res: Response): void {
  const { resumeText, jobDescription }: AnalyzeRequestBody = req.body;

  if (!resumeText || !resumeText.trim()) {
    res.status(400).json({ error: "resumeText is required" });
    return;
  }

  if (!jobDescription || !jobDescription.trim()) {
    res.status(400).json({ error: "jobDescription is required" });
    return;
  }

  const result = analyzeResume(resumeText, jobDescription);

  res.status(200).json(result);
}
