import { useEffect, useState } from "react";

const STEPS = [
  "Reading your resume...",
  "Scanning job description keywords...",
  "Comparing skills and experience...",
  "Generating personalized insights...",
];

export default function LoadingOverlay() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1 < STEPS.length ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="mx-4 flex w-full max-w-sm flex-col items-center rounded-2xl bg-white px-8 py-10 text-center shadow-2xl">
        <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
          <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-indigo-500" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
            <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </span>
        </div>

        <h3 className="text-lg font-semibold text-slate-900">Analyzing your resume</h3>
        <p className="mt-2 min-h-[20px] text-sm text-slate-500">{STEPS[stepIndex]}</p>

        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
