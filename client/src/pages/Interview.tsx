import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";

interface InterviewLocationState {
  questions: string[];
  fileName: string | null;
}

const STAR_TIP =
  "Structure your answer with the STAR method: Situation (context), Task (your goal), Action (what you did), Result (the outcome).";

export default function Interview() {
  const location = useLocation();
  const state = location.state as InterviewLocationState | null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [practiced, setPracticed] = useState<Set<number>>(new Set());
  const [showTip, setShowTip] = useState(false);
  const [finished, setFinished] = useState(false);

  if (!state?.questions?.length) {
    return <Navigate to="/upload" replace />;
  }

  const { questions, fileName } = state;
  const total = questions.length;
  const isLast = currentIndex === total - 1;

  function markPracticedAndAdvance() {
    setPracticed((prev) => new Set(prev).add(currentIndex));
    setShowTip(false);
    if (isLast) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function goTo(index: number) {
    setShowTip(false);
    setCurrentIndex(index);
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="animate-fade-in-up mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Interview prep complete!</h1>
        <p className="mt-3 text-slate-600">
          You practiced all {total} questions{fileName ? ` based on ${fileName}` : ""}. Review your notes anytime by starting again.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            onClick={() => {
              setFinished(false);
              setCurrentIndex(0);
              setPracticed(new Set());
            }}
          >
            Practice Again
          </Button>
          <Link to="/upload">
            <Button variant="secondary">Analyze Another Resume</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
          Stage 2 · Mock Interview Practice
        </span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Practice your interview</h1>
        <p className="mt-2 text-slate-600">Work through each question at your own pace. Jot down notes as you go.</p>
      </div>

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            Question {currentIndex + 1} of {total}
          </span>
          <span>{practiced.size} practiced</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to question ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
              i === currentIndex
                ? "w-6 bg-indigo-600"
                : practiced.has(i)
                  ? "bg-emerald-400"
                  : "bg-slate-200 hover:bg-slate-300"
            }`}
          />
        ))}
      </div>

      <Card
        key={currentIndex}
        title={`Question ${currentIndex + 1}`}
        accent="indigo"
        className="animate-fade-in-up"
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
        <p className="text-base font-medium text-slate-800">{questions[currentIndex]}</p>

        <button
          onClick={() => setShowTip((v) => !v)}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
        >
          {showTip ? "Hide tip" : "Show answer tip"}
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${showTip ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showTip && (
          <div className="animate-fade-in-up mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{STAR_TIP}</div>
        )}

        <textarea
          className="mt-4 h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder="Jot down how you'd answer this question..."
          value={notes[currentIndex] || ""}
          onChange={(e) => setNotes((prev) => ({ ...prev, [currentIndex]: e.target.value }))}
        />
      </Card>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => goTo(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Button onClick={markPracticedAndAdvance}>{isLast ? "Finish Practice" : "Next Question"}</Button>
      </div>
    </div>
  );
}
