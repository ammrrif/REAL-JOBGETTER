import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import ScoreGauge from "../components/ScoreGauge";
import type { AnalysisResult } from "../types";

interface ResultsLocationState {
  result: AnalysisResult;
  fileName: string | null;
  jobUrl: string;
}

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

export default function Results() {
  const location = useLocation();
  const state = location.state as ResultsLocationState | null;

  if (!state?.result) {
    return <Navigate to="/upload" replace />;
  }

  const { result, fileName } = state;

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Analysis Results</h1>
          <p className="mt-1 text-slate-600">{fileName ? `Based on ${fileName}` : "Based on your submitted resume"}</p>
        </div>
        <Link to="/upload">
          <Button variant="secondary">Analyze Another Resume</Button>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[auto_1fr] lg:items-center">
        <ScoreGauge score={result.matchScore} />
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Match Summary</h2>
          <p className="mt-2 text-slate-600">{result.summary}</p>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Keyword Coverage</span>
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
          title="Strengths"
          items={result.strengths}
          accent="emerald"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          }
        />
        <ListCard
          title="Missing Skills"
          items={result.missingSkills}
          accent="rose"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
        />
        <ListCard
          title="Weaknesses"
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
          title="Suggested Improvements"
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
          title="Recommended Certifications"
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

      <div className="mt-6">
        <Card
          title="Mock Interview Questions"
          accent="indigo"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          }
        >
          <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {result.interviewQuestions.map((q, i) => (
              <li key={i} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {i + 1}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link to="/upload">
          <Button>Analyze Another Resume</Button>
        </Link>
        <Link to="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
