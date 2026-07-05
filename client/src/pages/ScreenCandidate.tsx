import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import FileDropzone from "../components/FileDropzone";
import LoadingOverlay from "../components/LoadingOverlay";
import { extractResumeText, FileValidationError } from "../lib/fileParser";
import { analyzeResume } from "../lib/api";
import { getCandidates, saveCandidate } from "../lib/candidateStore";
import { getJobOpenings, removeJobOpening, saveJobOpening, updateJobOpening, type JobOpening } from "../lib/jobOpeningStore";

const MIN_JOB_DESCRIPTION_LENGTH = 40;
const STEP_LABELS = ["Job Opening", "Candidate Profile", "Review & Screen"];

function wordCount(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

function resumeLengthNote(words: number): string {
  if (words < 100) return "A little short — you'll get the most accurate screening with more detail.";
  if (words < 300) return "Nice, that's a solid amount of detail.";
  return "Great — plenty of detail for a thorough screening.";
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="mb-10 flex items-center justify-center">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                i < step
                  ? "bg-emerald-500 text-white"
                  : i === step
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {i < step ? <CheckIcon /> : i + 1}
            </div>
            <span className={`mt-2 hidden text-xs font-medium sm:block ${i === step ? "text-indigo-600" : "text-slate-400"}`}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`mx-2 h-0.5 w-10 transition-colors duration-500 sm:w-20 ${i < step ? "bg-emerald-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ScreenCandidate() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>(() => getJobOpenings());
  const [mode, setMode] = useState<"select" | "create">(() => (getJobOpenings().length > 0 ? "select" : "create"));
  const [selectedJobOpeningId, setSelectedJobOpeningId] = useState<string | null>(null);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const [candidateName, setCandidateName] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");

  const [fileError, setFileError] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resumeWordCount = wordCount(resumeText);
  const jobDescriptionLength = jobDescription.trim().length;
  const jobDescriptionProgress = Math.min(100, Math.round((jobDescriptionLength / MIN_JOB_DESCRIPTION_LENGTH) * 100));

  const sortedJobOpenings = [...jobOpenings].sort(
    (a, b) => new Date(b.lastUsedAt || b.createdAt).getTime() - new Date(a.lastUsedAt || a.createdAt).getTime()
  );
  const selectedJobOpening = mode === "select" ? (sortedJobOpenings.find((o) => o.id === selectedJobOpeningId) ?? null) : null;

  const effectiveTitle = mode === "select" ? (selectedJobOpening?.title ?? "") : jobTitle;
  const effectiveDescription = mode === "select" ? (selectedJobOpening?.description ?? "") : jobDescription;
  const effectiveUrl = mode === "select" ? (selectedJobOpening?.url ?? "") : jobUrl;

  const isJobOpeningValid = mode === "select" ? !!selectedJobOpening : jobDescriptionLength >= MIN_JOB_DESCRIPTION_LENGTH;
  const isCandidateProfileValid = resumeText.trim().length > 0 && !isParsingFile;
  const canScreen = isJobOpeningValid && isCandidateProfileValid && !isAnalyzing;

  function goToStep(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteJobOpening(id: string) {
    removeJobOpening(id);
    setJobOpenings(getJobOpenings());
    if (selectedJobOpeningId === id) setSelectedJobOpeningId(null);
  }

  async function handleFileSelected(file: File) {
    setFileError(null);
    setIsParsingFile(true);
    setFileName(file.name);
    try {
      const text = await extractResumeText(file);
      setResumeText(text);
    } catch (err) {
      setResumeText("");
      setFileError(err instanceof FileValidationError ? err.message : "Failed to read this file. Please try again.");
    } finally {
      setIsParsingFile(false);
    }
  }

  async function handleScreen() {
    if (!canScreen) return;
    setSubmitError(null);
    setIsAnalyzing(true);
    try {
      const result = await analyzeResume(resumeText, effectiveDescription);
      const finalCandidateName = candidateName.trim() || fileName || "Unnamed Candidate";

      let jobOpeningId: string;
      let finalJobTitle: string;
      if (mode === "select" && selectedJobOpening) {
        jobOpeningId = selectedJobOpening.id;
        finalJobTitle = selectedJobOpening.title;
        updateJobOpening(jobOpeningId, { lastUsedAt: new Date().toISOString() });
      } else {
        const created = saveJobOpening({
          title: jobTitle.trim() || "Untitled Job Opening",
          description: jobDescription,
          url: jobUrl.trim() || undefined,
        });
        jobOpeningId = created.id;
        finalJobTitle = created.title;
      }

      const candidate = saveCandidate({
        candidateName: finalCandidateName,
        fileName,
        jobTitle: finalJobTitle,
        jobOpeningId,
        result,
      });
      navigate("/results", {
        state: {
          result,
          fileName,
          jobUrl: effectiveUrl,
          candidateName: finalCandidateName,
          jobTitle: finalJobTitle,
          candidateId: candidate.id,
        },
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong while screening this candidate.");
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      {isAnalyzing && <LoadingOverlay />}

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Screen a Candidate</h1>
        <p className="mt-2 text-slate-600">A couple of quick steps and your hiring report is ready.</p>
      </div>

      <Stepper step={step} />

      {step === 0 && (
        <div key="step-0" className="animate-fade-in-up space-y-6">
          <Card
            title="Job opening details"
            accent="rose"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          >
            {jobOpenings.length > 0 && (
              <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setMode("select")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    mode === "select" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Use a saved job opening
                </button>
                <button
                  type="button"
                  onClick={() => setMode("create")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    mode === "create" ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  + New job opening
                </button>
              </div>
            )}

            {mode === "select" ? (
              sortedJobOpenings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No saved job openings yet.{" "}
                  <button
                    type="button"
                    onClick={() => setMode("create")}
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Create one
                  </button>
                </div>
              ) : (
                <div>
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {sortedJobOpenings.map((opening) => {
                      const candidateCount = getCandidates().filter((c) => c.jobOpeningId === opening.id).length;
                      const isSelected = selectedJobOpeningId === opening.id;
                      return (
                        <div
                          key={opening.id}
                          onClick={() => setSelectedJobOpeningId(opening.id)}
                          className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                            isSelected ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{opening.title}</p>
                              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{opening.description}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                Used for {candidateCount} candidate{candidateCount === 1 ? "" : "s"} · Created{" "}
                                {new Date(opening.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteJobOpening(opening.id);
                              }}
                              className="shrink-0 text-xs font-medium text-slate-400 hover:text-rose-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedJobOpening && (
                    <div className="mt-4 rounded-xl bg-white/70 p-3">
                      <p className="whitespace-pre-wrap text-xs text-slate-500">{selectedJobOpening.description}</p>
                      {selectedJobOpening.url && <p className="mt-2 truncate text-xs text-indigo-500">{selectedJobOpening.url}</p>}
                    </div>
                  )}
                </div>
              )
            ) : (
              <>
                <label className="mb-1 block text-xs font-medium text-slate-500">Job title (optional)</label>
                <input
                  type="text"
                  className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobTitle}
                  disabled={isAnalyzing}
                  onChange={(e) => setJobTitle(e.target.value)}
                />

                <label className="mb-1 block text-xs font-medium text-slate-500">Job requirements</label>
                <textarea
                  className="h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Paste the full job opening / requirements here..."
                  value={jobDescription}
                  disabled={isAnalyzing}
                  onChange={(e) => setJobDescription(e.target.value)}
                />

                <div className="mt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ease-out ${
                        isJobOpeningValid
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : "bg-gradient-to-r from-indigo-500 to-violet-500"
                      }`}
                      style={{ width: `${jobDescriptionProgress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">
                    {isJobOpeningValid
                      ? "✓ Looks good — enough detail to screen candidates against."
                      : `Add ${MIN_JOB_DESCRIPTION_LENGTH - jobDescriptionLength} more characters for an accurate screening.`}
                  </p>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Job posting URL (optional reference)</label>
                  <input
                    type="url"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="https://company.com/careers/job-posting"
                    value={jobUrl}
                    disabled={isAnalyzing}
                    onChange={(e) => setJobUrl(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    We don't fetch external pages in this demo — please paste the requirements text above too.
                  </p>
                </div>
              </>
            )}
          </Card>

          <div className="flex flex-col items-center gap-3 pt-2">
            <Button onClick={() => goToStep(1)} disabled={!isJobOpeningValid} className="w-full sm:w-auto sm:min-w-[220px]">
              Continue
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            {!isJobOpeningValid && (
              <p className="text-xs text-slate-400">
                {mode === "select" ? "Select a saved job opening to continue" : "Add the job opening's requirements to continue"}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 1 && (
        <div key="step-1" className="animate-fade-in-up space-y-6">
          <Card
            title="Candidate profile"
            accent="indigo"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
              </svg>
            }
          >
            <label className="mb-1 block text-xs font-medium text-slate-500">Candidate name (optional)</label>
            <input
              type="text"
              className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="e.g. Jane Doe"
              value={candidateName}
              disabled={isAnalyzing}
              onChange={(e) => setCandidateName(e.target.value)}
            />

            <FileDropzone onFileSelected={handleFileSelected} selectedFileName={fileName} disabled={isParsingFile || isAnalyzing} />
            {isParsingFile && <p className="mt-3 text-sm text-indigo-600">Extracting text from the candidate's resume...</p>}
            {fileError && <p className="mt-3 text-sm text-rose-600">{fileError}</p>}
            {resumeText && !isParsingFile && !fileError && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-700">✓ Extracted {resumeWordCount} words from this candidate's profile</p>
                <p className="mt-1 text-xs text-emerald-600">{resumeLengthNote(resumeWordCount)}</p>
                <p className="mt-3 line-clamp-2 rounded-lg bg-white/70 p-2.5 font-mono text-xs text-slate-500">
                  {resumeText.trim().slice(0, 220)}…
                </p>
              </div>
            )}

            <details className="mt-4 text-sm">
              <summary className="cursor-pointer font-medium text-slate-500 hover:text-slate-700">
                Or paste the candidate's resume text manually
              </summary>
              <textarea
                className="mt-3 h-32 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Paste the candidate's resume text here..."
                value={resumeText}
                disabled={isAnalyzing}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setFileName(null);
                  setFileError(null);
                }}
              />
            </details>
          </Card>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="secondary" onClick={() => goToStep(0)}>
              Back
            </Button>
            <Button onClick={() => goToStep(2)} disabled={!isCandidateProfileValid} className="min-w-[220px]">
              Review & Continue
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div key="step-2" className="animate-fade-in-up space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card title="Job Opening" accent="emerald" icon={<CheckIcon />}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-800">{effectiveTitle.trim() || "Untitled Job Opening"}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {mode === "select" ? "Saved opening" : "New opening"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{effectiveDescription.length} characters of requirements</p>
              <button onClick={() => goToStep(0)} className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                Edit job opening
              </button>
            </Card>
            <Card title="Candidate Profile" accent="emerald" icon={<CheckIcon />}>
              <p className="text-sm font-medium text-slate-800">{candidateName.trim() || fileName || "Unnamed Candidate"}</p>
              <p className="mt-1 text-xs text-slate-500">{resumeWordCount} words</p>
              <button onClick={() => goToStep(1)} className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                Edit candidate profile
              </button>
            </Card>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">Ready to screen this candidate</h2>
            <p className="mt-1.5 text-sm text-slate-600">
              We'll compare this candidate's profile against the job opening and generate a hiring match score, risks, and a
              hire / maybe / reject recommendation.
            </p>
            {submitError && (
              <div className="mx-auto mt-4 max-w-md rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </div>
            )}
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="secondary" onClick={() => goToStep(1)} disabled={isAnalyzing}>
                Back
              </Button>
              <Button onClick={handleScreen} disabled={!canScreen} className="w-full shadow-lg shadow-indigo-600/30 sm:w-auto sm:min-w-[220px]">
                {isAnalyzing ? "Screening..." : "Screen Candidate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
