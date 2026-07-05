import { useState, type ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import ScoreGauge from "../components/ScoreGauge";
import type { AnalysisResult } from "../types";
import { getCandidates, getHiringDecision, updateCandidate, type HiringDecision } from "../lib/candidateStore";
import { getLinkedInSearchUrl } from "../lib/linkedin";
import { useToast } from "../context/ToastContext";

interface HiringReportLocationState {
  result: AnalysisResult;
  fileName: string | null;
  jobUrl: string;
  candidateName?: string;
  jobTitle?: string;
  candidateId?: string;
}

const DECISION_STYLES: Record<HiringDecision, { border: string; bg: string; text: string; iconBg: string; icon: string }> = {
  Hire: { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", iconBg: "bg-emerald-100 text-emerald-700", icon: "✓" },
  Maybe: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", iconBg: "bg-amber-100 text-amber-700", icon: "◐" },
  Reject: { border: "border-rose-200", bg: "bg-rose-50", text: "text-rose-700", iconBg: "bg-rose-100 text-rose-700", icon: "✕" },
};

function ListCard({
  title,
  items,
  accent,
  icon,
  emptyText,
}: {
  title: string;
  items: string[];
  accent: "indigo" | "emerald" | "amber" | "rose" | "slate";
  icon: ReactNode;
  emptyText?: string;
}) {
  return (
    <Card title={title} accent={accent} icon={icon}>
      {items.length > 0 ? (
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-slate-700">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">{emptyText || "Nothing to show"}</p>
      )}
    </Card>
  );
}

export default function HiringReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const state = location.state as HiringReportLocationState | null;

  const candidateId = state?.candidateId;
  const [shortlisted, setShortlisted] = useState<boolean>(() => {
    if (!candidateId) return false;
    return getCandidates().find((c) => c.id === candidateId)?.shortlisted ?? false;
  });

  if (!state?.result) {
    return <Navigate to="/upload" replace />;
  }

  const { result, candidateName, jobTitle } = state;
  const decision = getHiringDecision(result.matchScore);
  const decisionStyle = DECISION_STYLES[decision];

  function toggleShortlist() {
    if (!candidateId) return;
    const next = !shortlisted;
    setShortlisted(next);
    updateCandidate(candidateId, { shortlisted: next });
    showToast(next ? "Added to shortlist." : "Removed from shortlist.", next ? "success" : "info");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hiring Report</h1>
          <p className="mt-1 text-slate-600">
            {candidateName ? `Candidate: ${candidateName}` : "Based on the submitted candidate profile"}
            {jobTitle ? ` · ${jobTitle}` : ""}
          </p>
          {candidateName && (
            <a
              href={getLinkedInSearchUrl(candidateName)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
            >
              Search "{candidateName}" on LinkedIn ↗
            </a>
          )}
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard">
            <Button variant="ghost">View Dashboard</Button>
          </Link>
          <Link to="/upload">
            <Button variant="secondary">Screen Another Candidate</Button>
          </Link>
        </div>
      </div>

      <div
        className={`mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center ${decisionStyle.border} ${decisionStyle.bg}`}
      >
        <div className="flex items-center gap-4">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold ${decisionStyle.iconBg}`}>
            {decisionStyle.icon}
          </span>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${decisionStyle.text}`}>Hiring Recommendation</p>
            <p className={`text-xl font-bold ${decisionStyle.text}`}>{decision}</p>
          </div>
        </div>
        <Button variant={shortlisted ? "primary" : "secondary"} onClick={toggleShortlist} disabled={!candidateId}>
          {shortlisted ? "★ Shortlisted" : "☆ Add to Shortlist"}
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[auto_1fr] lg:items-center">
        <ScoreGauge score={result.matchScore} />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Hiring Summary</h2>
          <p className="mt-2 text-slate-600">{result.summary}</p>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Requirement Coverage</span>
              <span>
                {result.keywordCoverage.matched} / {result.keywordCoverage.total} matched
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out"
                style={{ width: `${result.keywordCoverage.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ListCard
          title="Candidate Strengths"
          items={result.strengths}
          accent="emerald"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          }
        />
        <ListCard
          title="Missing Requirements"
          items={result.missingSkills}
          accent="rose"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        />
        <ListCard
          title="Hiring Risks"
          items={result.weaknesses}
          accent="amber"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          }
        />
        <ListCard
          title="Development Areas"
          items={result.improvements}
          accent="indigo"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
              />
            </svg>
          }
        />
      </div>

      <div className="mt-6">
        <ListCard
          title="Suggested Training for Candidate"
          items={result.certifications}
          accent="slate"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          }
        />
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-center shadow-sm sm:flex-row sm:text-left">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-indigo-50">
            Next Step
          </span>
          <h2 className="mt-3 text-xl font-bold text-white">Ready to prep for the interview?</h2>
          <p className="mt-1.5 text-sm text-indigo-100">
            Generate a categorized interview kit with {result.interviewQuestions.length} technical, behavioral, and
            skill-gap questions based on this report.
          </p>
        </div>
        <Button
          variant="secondary"
          className="w-full shrink-0 sm:w-auto"
          onClick={() =>
            navigate("/interview-kit", { state: { questions: result.interviewQuestions, candidateName, jobTitle } })
          }
        >
          Generate Interview Kit
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link to="/upload">
          <Button variant="secondary">Screen Another Candidate</Button>
        </Link>
        <Link to="/">
          <Button variant="ghost">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
