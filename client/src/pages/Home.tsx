import { Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    title: "Instant Hiring Match Score",
    description: "Get a 0-100 hiring match score between any candidate and your job opening in seconds.",
    accent: "indigo" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Hiring Risk Detection",
    description: "See exactly which required skills and qualifications are missing before you make an offer.",
    accent: "rose" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
    ),
  },
  {
    title: "Candidate Ranking",
    description: "Screen multiple candidates and see them ranked side-by-side on your talent screening dashboard.",
    accent: "emerald" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Interview Kit Generator",
    description: "Generate categorized technical, behavioral, and skill-gap interview questions for any candidate.",
    accent: "amber" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
];

const STEPS = [
  { step: "01", title: "Get HR portal access", description: "Log in to the HR portal in seconds — no credit card needed." },
  { step: "02", title: "Add the job opening", description: "Paste the job requirements you're hiring for, plus a candidate's resume." },
  { step: "03", title: "Get instant hiring insights", description: "View the hiring match score, candidate strengths, and hiring risks in one report." },
  { step: "04", title: "Generate the interview kit", description: "Move into a categorized interview kit built from the candidate's profile." },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const primaryCtaTarget = isAuthenticated ? "/upload" : "/signup";

  return (
    <div className="animate-fade-in-up">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white" />
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
              ✨ AI Hiring Assistant for HR Teams
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Screen candidates smarter with your AI Hiring Assistant
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              Add a job opening and a candidate's resume to get an instant hiring match score, a hiring
              risk breakdown, and a ready-to-use interview kit — built for HR teams who need to move fast.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={primaryCtaTarget}>
                <Button className="w-full sm:w-auto">
                  {isAuthenticated ? "Screen a Candidate" : "Get HR Portal Access"}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                  Already have HR access? <span className="text-indigo-600">Log in</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Everything your team needs to screen with confidence</h2>
          <p className="mt-3 text-slate-600">Built to give HR teams the same signal an ATS looks for, in one dashboard.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} title={feature.title} icon={feature.icon} accent={feature.accent}>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white">How it works</h2>
            <p className="mt-3 text-slate-400">Four simple steps between a resume and a hiring decision.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="text-3xl font-extrabold text-indigo-400">{s.step}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Ready to screen your first candidate?</h2>
        <p className="mt-3 text-slate-600">Create your free HR account — it takes less than a minute.</p>
        <div className="mt-8">
          <Link to={primaryCtaTarget}>
            <Button>{isAuthenticated ? "Screen a Candidate" : "Get HR Portal Access"}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
