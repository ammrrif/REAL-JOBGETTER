import type { AnalysisResult } from "../types";

const MIN_LOADING_MS = 1200;
const MAX_EXTRA_DELAY_MS = 1500;

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
  const artificialDelay = MIN_LOADING_MS + Math.random() * MAX_EXTRA_DELAY_MS;

  const [response] = await Promise.all([
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobDescription }),
    }),
    new Promise((resolve) => setTimeout(resolve, artificialDelay)),
  ]);

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
