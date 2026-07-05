import { Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    title: "Instant Match Score",
    description: "Get a 0-100 compatibility score between your resume and any job description in seconds.",
    accent: "indigo" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Skill Gap Detection",
    description: "See exactly which required skills and keywords are missing from your resume.",
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
    title: "Actionable Improvements",
    description: "Receive concrete suggestions to strengthen your resume for this specific role.",
    accent: "emerald" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Mock Interview Prep",
    description: "Practice with 8-10 tailored interview questions generated from the job and your background.",
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
  { step: "01", title: "Create your account", description: "Sign up in seconds — no credit card, just your name and email." },
  { step: "02", title: "Upload & paste the job", description: "Drop in your resume and the job description you're targeting." },
  { step: "03", title: "Get instant AI insights", description: "View your match score, strengths, and skill gaps in one clean report." },
  { step: "04", title: "Practice your interview", description: "Move into a dedicated mock interview stage built from your results." },
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
              ✨ AI-Powered Resume Analysis
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Land your next job with a resume that actually matches
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              Create a free account, upload your resume, and get an instant AI-style breakdown of your match score,
              skill gaps, and a guided interview practice stage — all in under a minute.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={primaryCtaTarget}>
                <Button className="w-full sm:w-auto">
                  {isAuthenticated ? "Analyze My Resume" : "Get Started Free"}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-700">
                  Already have an account? <span className="text-indigo-600">Log in</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Everything you need to apply with confidence</h2>
          <p className="mt-3 text-slate-600">Built to give you the same signal recruiters and ATS systems look for.</p>
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
            <p className="mt-3 text-slate-400">Four simple steps between you and your next interview.</p>
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
        <h2 className="text-3xl font-bold text-slate-900">Ready to see your match score?</h2>
        <p className="mt-3 text-slate-600">Create your free account — it takes less than a minute.</p>
        <div className="mt-8">
          <Link to={primaryCtaTarget}>
            <Button>{isAuthenticated ? "Analyze My Resume" : "Get Started Free"}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
