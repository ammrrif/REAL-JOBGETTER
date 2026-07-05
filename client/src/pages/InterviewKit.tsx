import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import type { InterviewQuestionCategory, InterviewQuestionItem } from "../types";

interface InterviewKitLocationState {
  questions: InterviewQuestionItem[];
  candidateName?: string;
  jobTitle?: string;
}

const CATEGORY_ORDER: InterviewQuestionCategory[] = ["Behavioral", "Technical", "Skill-Gap"];

const CATEGORY_META: Record<InterviewQuestionCategory, { accent: "indigo" | "emerald" | "amber"; tabActive: string; tip: string }> = {
  Behavioral: {
    accent: "indigo",
    tabActive: "bg-indigo-600 text-white",
    tip: "Listen for a clear Situation, Task, Action, and Result (STAR) in their answer.",
  },
  Technical: {
    accent: "emerald",
    tabActive: "bg-emerald-600 text-white",
    tip: "Listen for specific tools, technical decisions, and concrete outcomes — not just buzzwords.",
  },
  "Skill-Gap": {
    accent: "amber",
    tabActive: "bg-amber-600 text-white",
    tip: "Listen for a realistic, proactive plan to close the gap — not just reassurance.",
  },
};

function QuestionIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
      />
    </svg>
  );
}

export default function InterviewKit() {
  const location = useLocation();
  const state = location.state as InterviewKitLocationState | null;

  const [categoryIndex, setCategoryIndex] = useState(0);
  const [questionIndexInCategory, setQuestionIndexInCategory] = useState(0);
  const [asked, setAsked] = useState<Set<number>>(new Set());
  const [revealedTips, setRevealedTips] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  if (!state?.questions?.length) {
    return <Navigate to="/upload" replace />;
  }

  const { questions, candidateName, jobTitle } = state;
  const total = questions.length;

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: questions.map((q, index) => ({ ...q, index })).filter((q) => q.category === category),
  })).filter((group) => group.items.length > 0);

  const currentCategoryGroup = grouped[categoryIndex];
  const currentQuestion = currentCategoryGroup.items[questionIndexInCategory];
  const isFirstOverall = categoryIndex === 0 && questionIndexInCategory === 0;
  const isLastOverall =
    categoryIndex === grouped.length - 1 && questionIndexInCategory === currentCategoryGroup.items.length - 1;

  function goToCategory(index: number) {
    setCategoryIndex(index);
    setQuestionIndexInCategory(0);
  }

  function handlePrevious() {
    if (questionIndexInCategory > 0) {
      setQuestionIndexInCategory((i) => i - 1);
    } else if (categoryIndex > 0) {
      const prevGroup = grouped[categoryIndex - 1];
      setCategoryIndex((c) => c - 1);
      setQuestionIndexInCategory(prevGroup.items.length - 1);
    }
  }

  function handleNext() {
    setAsked((prev) => new Set(prev).add(currentQuestion.index));
    if (isLastOverall) {
      setFinished(true);
      return;
    }
    if (questionIndexInCategory < currentCategoryGroup.items.length - 1) {
      setQuestionIndexInCategory((i) => i + 1);
    } else {
      setCategoryIndex((c) => c + 1);
      setQuestionIndexInCategory(0);
    }
  }

  function toggleTip(index: number) {
    setRevealedTips((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function restart() {
    setCategoryIndex(0);
    setQuestionIndexInCategory(0);
    setAsked(new Set());
    setRevealedTips(new Set());
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="animate-fade-in-up mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Interview kit complete!</h1>
        <p className="mt-3 text-slate-600">
          You've gone through all {total} questions{candidateName ? ` for ${candidateName}` : ""}.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={restart}>Review Again</Button>
          <Link to="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
          <Link to="/upload">
            <Button variant="ghost">Screen Another Candidate</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
          Stage 2 · Interview Kit
        </span>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Interview Kit Generator</h1>
        <p className="mt-2 text-slate-600">
          Structured questions for HR to ask
          {candidateName ? ` ${candidateName}` : " this candidate"}
          {jobTitle ? `, for the ${jobTitle} opening.` : "."}
        </p>
      </div>

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>{asked.size} of {total} asked</span>
          {asked.size === total && <span className="font-semibold text-emerald-600">✓ All asked</span>}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${(asked.size / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {grouped.map((group, i) => {
          const askedInGroup = group.items.filter((item) => asked.has(item.index)).length;
          return (
            <button
              key={group.category}
              onClick={() => goToCategory(i)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                i === categoryIndex ? CATEGORY_META[group.category].tabActive : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {group.category} ({askedInGroup}/{group.items.length})
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {currentCategoryGroup.items.map((item, i) => (
          <button
            key={item.index}
            onClick={() => setQuestionIndexInCategory(i)}
            aria-label={`Go to question ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
              i === questionIndexInCategory
                ? "w-6 bg-indigo-600"
                : asked.has(item.index)
                  ? "bg-emerald-400"
                  : "bg-slate-200 hover:bg-slate-300"
            }`}
          />
        ))}
      </div>

      <Card
        key={currentQuestion.index}
        title={currentCategoryGroup.category}
        accent={CATEGORY_META[currentCategoryGroup.category].accent}
        className="animate-fade-in-up"
        icon={<QuestionIcon />}
      >
        <p className="text-base font-medium text-slate-800">{currentQuestion.question}</p>

        <button
          onClick={() => toggleTip(currentQuestion.index)}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
        >
          {revealedTips.has(currentQuestion.index) ? "Hide interviewer tip" : "Reveal interviewer tip"}
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${revealedTips.has(currentQuestion.index) ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {revealedTips.has(currentQuestion.index) && (
          <div className="animate-fade-in-up mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {CATEGORY_META[currentCategoryGroup.category].tip}
          </div>
        )}
      </Card>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={handlePrevious} disabled={isFirstOverall}>
          Previous
        </Button>
        <Button onClick={handleNext}>{isLastOverall ? "Finish Interview Kit" : "Mark Asked → Next"}</Button>
      </div>
    </div>
  );
}
