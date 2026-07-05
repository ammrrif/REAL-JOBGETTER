import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useToast } from "../context/ToastContext";
import {
  getHiringDecision,
  getRankedCandidates,
  removeCandidate,
  updateCandidate,
  type CandidateRecord,
  type HiringDecision,
} from "../lib/candidateStore";
import { getJobOpenings, type JobOpening } from "../lib/jobOpeningStore";
import { getLinkedInSearchUrl } from "../lib/linkedin";

const DECISION_BADGE: Record<HiringDecision, string> = {
  Hire: "bg-emerald-100 text-emerald-700",
  Maybe: "bg-amber-100 text-amber-700",
  Reject: "bg-rose-100 text-rose-700",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState<CandidateRecord[]>(() => getRankedCandidates());
  const [jobOpenings] = useState<JobOpening[]>(() => getJobOpenings());
  const [filter, setFilter] = useState<"all" | "shortlisted">("all");
  const [jobOpeningFilter, setJobOpeningFilter] = useState<string | "all">("all");

  const shortlistedCount = candidates.filter((c) => c.shortlisted).length;
  const visibleCandidates = candidates.filter(
    (c) => (filter === "all" || c.shortlisted) && (jobOpeningFilter === "all" || c.jobOpeningId === jobOpeningFilter)
  );

  function refresh() {
    setCandidates(getRankedCandidates());
  }

  function handleToggleShortlist(candidate: CandidateRecord) {
    updateCandidate(candidate.id, { shortlisted: !candidate.shortlisted });
    refresh();
  }

  function handleRemove(candidate: CandidateRecord) {
    removeCandidate(candidate.id);
    refresh();
    showToast(`Removed ${candidate.candidateName} from the dashboard.`, "info");
  }

  function handleViewReport(candidate: CandidateRecord) {
    navigate("/results", {
      state: {
        result: candidate.result,
        fileName: candidate.fileName,
        jobUrl: "",
        candidateName: candidate.candidateName,
        jobTitle: candidate.jobTitle,
        candidateId: candidate.id,
      },
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Talent Screening Dashboard</h1>
          <p className="mt-2 text-slate-600">Every candidate you've screened, ranked by hiring match score.</p>
        </div>
        <Link to="/upload">
          <Button>Screen a Candidate</Button>
        </Link>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <p className="font-medium text-slate-600">No candidates screened yet.</p>
          <p className="mt-1 text-sm text-slate-400">Screen your first candidate to see them ranked here.</p>
          <Link to="/upload" className="mt-6 inline-block">
            <Button>Screen a Candidate</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === "all" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Candidates ({candidates.length})
              </button>
              <button
                onClick={() => setFilter("shortlisted")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === "shortlisted" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Shortlisted ({shortlistedCount})
              </button>
            </div>

            {jobOpenings.length > 0 && (
              <select
                value={jobOpeningFilter}
                onChange={(e) => setJobOpeningFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">All Job Openings</option>
                {jobOpenings.map((opening) => (
                  <option key={opening.id} value={opening.id}>
                    {opening.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {visibleCandidates.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              {filter === "shortlisted" ? "No shortlisted candidates yet." : "No candidates match these filters."}
            </p>
          ) : (
            <div className="space-y-3">
              {visibleCandidates.map((candidate, i) => {
                const decision = getHiringDecision(candidate.result.matchScore);
                return (
                  <div
                    key={candidate.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{candidate.candidateName}</p>
                        <p className="text-xs text-slate-500">
                          {candidate.jobTitle} · {new Date(candidate.evaluatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-bold text-slate-900">
                        {candidate.result.matchScore}
                        <span className="text-xs font-normal text-slate-400">/100</span>
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${DECISION_BADGE[decision]}`}>{decision}</span>
                      <button
                        onClick={() => handleToggleShortlist(candidate)}
                        aria-label="Toggle shortlist"
                        title="Toggle shortlist"
                        className={`text-lg transition-colors ${candidate.shortlisted ? "text-amber-500" : "text-slate-300 hover:text-amber-400"}`}
                      >
                        {candidate.shortlisted ? "★" : "☆"}
                      </button>
                      <a
                        href={getLinkedInSearchUrl(candidate.candidateName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        LinkedIn ↗
                      </a>
                      <Button variant="secondary" onClick={() => handleViewReport(candidate)}>
                        View Report
                      </Button>
                      <button
                        onClick={() => handleRemove(candidate)}
                        className="text-xs font-medium text-slate-400 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
