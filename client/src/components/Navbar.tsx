import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white">
            AI
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">JobGetter</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className={`hidden text-sm font-medium sm:block ${
              location.pathname === "/" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Home
          </Link>
          <Link
            to="/upload"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500"
          >
            Analyze Resume
          </Link>
        </nav>
      </div>
    </header>
  );
}
