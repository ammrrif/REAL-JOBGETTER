import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const INPUT_CLASSES =
  "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || "/upload";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Something went wrong. Please try again.");
      return;
    }

    showToast("Welcome back!", "success");
    navigate(from, { replace: true });
  }

  return (
    <AuthLayout title="Log in to your account" subtitle="Pick up right where you left off.">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className={INPUT_CLASSES}
            placeholder="you@example.com"
            value={email}
            disabled={isSubmitting}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className={INPUT_CLASSES}
            placeholder="••••••••"
            value={password}
            disabled={isSubmitting}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Logging in..." : "Log In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Sign up for free
        </Link>
      </p>
    </AuthLayout>
  );
}
