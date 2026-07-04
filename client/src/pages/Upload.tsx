import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import FileDropzone from "../components/FileDropzone";
import LoadingOverlay from "../components/LoadingOverlay";
import { extractResumeText, FileValidationError } from "../lib/fileParser";
import { analyzeResume } from "../lib/api";

const MIN_JOB_DESCRIPTION_LENGTH = 40;

export default function Upload() {
  const navigate = useNavigate();

  const [fileName, setFileName] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  const [fileError, setFileError] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const jobDescriptionTooShort = jobDescription.trim().length > 0 && jobDescription.trim().length < MIN_JOB_DESCRIPTION_LENGTH;
  const canAnalyze = resumeText.trim().length > 0 && jobDescription.trim().length >= MIN_JOB_DESCRIPTION_LENGTH && !isAnalyzing;

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

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Analyze Your Resume</h1>
        <p className="mt-2 text-slate-600">Upload your resume and paste the job description you're targeting.</p>
      </div>

      <div className="space-y-6">
        <Card
          title="1. Upload Resume"
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
            <p className="mt-3 text-sm text-emerald-600">
              ✓ Extracted {resumeText.trim().split(/\s+/).length} words from your resume
            </p>
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

        <Card
          title="2. Job Description"
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
          {jobDescriptionTooShort && (
            <p className="mt-2 text-xs text-amber-600">
              Add a bit more detail ({MIN_JOB_DESCRIPTION_LENGTH - jobDescription.trim().length} more characters) for an accurate
              analysis.
            </p>
          )}

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

        {submitError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</div>
        )}

        <div className="flex flex-col items-center gap-3 pt-2">
          <Button onClick={handleAnalyze} disabled={!canAnalyze} className="w-full sm:w-auto sm:min-w-[220px]">
            {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
          </Button>
          {!canAnalyze && !isAnalyzing && (
            <p className="text-xs text-slate-400">Upload a resume and add a job description to continue</p>
          )}
        </div>
      </div>
    </div>
  );
}
