import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import FileDropzone from "../components/FileDropzone";
import LoadingOverlay from "../components/LoadingOverlay";
import { extractResumeText, FileValidationError } from "../lib/fileParser";
import { analyzeResume } from "../lib/api";

const MIN_JOB_DESCRIPTION_LENGTH = 40;
const STEP_LABELS = ["Resume", "Job Description", "Review & Analyze"];

function wordCount(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

function resumeLengthNote(words: number): string {
  if (words < 100) return "A little short — you'll get the most accurate results with more detail.";
  if (words < 300) return "Nice, that's a solid amount of detail.";
  return "Great — plenty of detail for a thorough analysis.";
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

export default function Upload() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const [fileError, setFileError] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resumeWordCount = wordCount(resumeText);
  const jobDescriptionLength = jobDescription.trim().length;
  const jobDescriptionProgress = Math.min(100, Math.round((jobDescriptionLength / MIN_JOB_DESCRIPTION_LENGTH) * 100));

  const isStep0Valid = resumeText.trim().length > 0 && !isParsingFile;
  const isStep1Valid = jobDescriptionLength >= MIN_JOB_DESCRIPTION_LENGTH;
  const canAnalyze = isStep0Valid && isStep1Valid && !isAnalyzing;

  function goToStep(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  async function handleAnalyze() {
    if (!canAnalyze) return;
    setSubmitError(null);
    setIsAnalyzing(true);
    try {
      const result = await analyzeResume(resumeText, jobDescription);
      navigate("/results", { state: { result, fileName, jobUrl } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong while analyzing your resume.");
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      {isAnalyzing && <LoadingOverlay />}

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Analyze Your Resume</h1>
        <p className="mt-2 text-slate-600">A couple of quick steps and your personalized report is ready.</p>
      </div>

      <Stepper step={step} />

      {step === 0 && (
        <div key="step-0" className="animate-fade-in-up space-y-6">
          <Card
            title="Upload your resume"
            accent="indigo"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
              </svg>
            }
          >
            <FileDropzone onFileSelected={handleFileSelected} selectedFileName={fileName} disabled={isParsingFile || isAnalyzing} />
            {isParsingFile && <p className="mt-3 text-sm text-indigo-600">Extracting text from your file...</p>}
            {fileError && <p className="mt-3 text-sm text-rose-600">{fileError}</p>}
            {resumeText && !isParsingFile && !fileError && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-700">✓ Extracted {resumeWordCount} words from your resume</p>
                <p className="mt-1 text-xs text-emerald-600">{resumeLengthNote(resumeWordCount)}</p>
                <p className="mt-3 line-clamp-2 rounded-lg bg-white/70 p-2.5 font-mono text-xs text-slate-500">
                  {resumeText.trim().slice(0, 220)}…
                </p>
              </div>
            )}

            <details className="mt-4 text-sm">
              <summary className="cursor-pointer font-medium text-slate-500 hover:text-slate-700">
                Or paste your resume text manually
              </summary>
              <textarea
                className="mt-3 h-32 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Paste your resume text here..."
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

          <div className="flex flex-col items-center gap-3 pt-2">
            <Button onClick={() => goToStep(1)} disabled={!isStep0Valid} className="w-full sm:w-auto sm:min-w-[220px]">
              Continue
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            {!isStep0Valid && <p className="text-xs text-slate-400">Upload or paste your resume to continue</p>}
          </div>
        </div>
      )}

      {step === 1 && (
        <div key="step-1" className="animate-fade-in-up space-y-6">
          <Card
            title="Paste the job description"
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
            <textarea
              className="h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              disabled={isAnalyzing}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${
                    isStep1Valid ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-indigo-500 to-violet-500"
                  }`}
                  style={{ width: `${jobDescriptionProgress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {isStep1Valid
                  ? "✓ Looks good — enough detail to compare against your resume."
                  : `Add ${MIN_JOB_DESCRIPTION_LENGTH - jobDescriptionLength} more characters for an accurate analysis.`}
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
                We don't fetch external pages in this demo — please paste the description text above too.
              </p>
            </div>
          </Card>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button variant="secondary" onClick={() => goToStep(0)}>
              Back
            </Button>
            <Button onClick={() => goToStep(2)} disabled={!isStep1Valid} className="min-w-[220px]">
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
            <Card title="Your Resume" accent="emerald" icon={<CheckIcon />}>
              <p className="text-sm font-medium text-slate-800">{fileName || "Pasted text"}</p>
              <p className="mt-1 text-xs text-slate-500">{resumeWordCount} words</p>
              <button
                onClick={() => goToStep(0)}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Edit resume
              </button>
            </Card>
            <Card title="Job Description" accent="emerald" icon={<CheckIcon />}>
              <p className="text-sm font-medium text-slate-800">{jobDescriptionLength} characters</p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{jobDescription.trim().slice(0, 60)}…</p>
              <button
                onClick={() => goToStep(1)}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Edit job description
              </button>
            </Card>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">Everything looks ready</h2>
            <p className="mt-1.5 text-sm text-slate-600">
              We'll compare your resume against the job description and generate your match score, gaps, and improvements.
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
              <Button onClick={handleAnalyze} disabled={!canAnalyze} className="w-full shadow-lg shadow-indigo-600/30 sm:w-auto sm:min-w-[220px]">
                {isAnalyzing ? "Analyzing..." : "Analyze My Resume"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
