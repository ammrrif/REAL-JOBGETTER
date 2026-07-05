import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "default" | "light";
  className?: string;
}

export default function Logo({ variant = "default", className = "" }: LogoProps) {
  const isLight = variant === "light";

  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:rotate-[8deg] group-hover:scale-110 ${
          isLight
            ? "bg-white/15 text-white backdrop-blur"
            : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-600/30"
        }`}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      </span>
      <span className={`text-lg font-bold tracking-tight ${isLight ? "text-white" : "text-slate-900"}`}>
        Hiring<span className={isLight ? "text-indigo-100" : "text-indigo-600"}>Assistant</span>
      </span>
    </Link>
  );
}
