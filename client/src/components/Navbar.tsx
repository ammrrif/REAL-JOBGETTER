import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  function handleLogout() {
    logout();
    showToast("You've been logged out.", "info");
    setTimeout(() => navigate("/", { replace: true }), 0);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/"
            className={`hidden text-sm font-medium sm:block ${
              location.pathname === "/" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`hidden text-sm font-medium sm:block ${
                  location.pathname === "/dashboard" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/upload"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500"
              >
                Screen a Candidate
              </Link>
              <div className="hidden items-center gap-3 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-medium ${
                  location.pathname === "/login" ? "text-indigo-600" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                HR Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500"
              >
                HR Portal Access
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
