import type { AnalysisResult } from "../types";

export type HiringDecision = "Hire" | "Maybe" | "Reject";

export interface CandidateRecord {
  id: string;
  candidateName: string;
  fileName: string | null;
  jobTitle: string;
  jobOpeningId?: string;
  result: AnalysisResult;
  evaluatedAt: string;
  shortlisted: boolean;
}

const CANDIDATES_KEY = "hiring_assistant_candidates";

export function getHiringDecision(score: number): HiringDecision {
  if (score >= 80) return "Hire";
  if (score >= 60) return "Maybe";
  return "Reject";
}

export function getCandidates(): CandidateRecord[] {
  try {
    const raw = localStorage.getItem(CANDIDATES_KEY);
    return raw ? (JSON.parse(raw) as CandidateRecord[]) : [];
  } catch {
    return [];
  }
}

function writeCandidates(candidates: CandidateRecord[]): void {
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
}

export function saveCandidate(input: {
  candidateName: string;
  fileName: string | null;
  jobTitle: string;
  jobOpeningId?: string;
  result: AnalysisResult;
}): CandidateRecord {
  const record: CandidateRecord = {
    id: crypto.randomUUID(),
    candidateName: input.candidateName,
    fileName: input.fileName,
    jobTitle: input.jobTitle,
    jobOpeningId: input.jobOpeningId,
    result: input.result,
    evaluatedAt: new Date().toISOString(),
    shortlisted: false,
  };
  writeCandidates([...getCandidates(), record]);
  return record;
}

export function updateCandidate(id: string, patch: Partial<CandidateRecord>): void {
  writeCandidates(getCandidates().map((c) => (c.id === id ? { ...c, ...patch } : c)));
}

export function removeCandidate(id: string): void {
  writeCandidates(getCandidates().filter((c) => c.id !== id));
}

export function getRankedCandidates(): CandidateRecord[] {
  return [...getCandidates()].sort((a, b) => b.result.matchScore - a.result.matchScore);
}
