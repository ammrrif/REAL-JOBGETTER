import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const INPUT_CLASSES =
  "w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Please enter your name.";
    if (!EMAIL_PATTERN.test(email.trim())) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = signup(name, email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Something went wrong. Please try again.");
      return;
    }

    showToast(`Welcome, ${name.trim().split(" ")[0]}! Your account is ready.`, "success");
    navigate("/upload", { replace: true });
  }

  return (
    <AuthLayout title="Create your free account" subtitle="Sign up in seconds to start analyzing your resume.">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="signup-name">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            className={INPUT_CLASSES}
            placeholder="Jane Doe"
            value={name}
            disabled={isSubmitting}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            className={INPUT_CLASSES}
            placeholder="you@example.com"
            value={email}
            disabled={isSubmitting}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              className={INPUT_CLASSES}
              placeholder="••••••••"
              value={password}
              disabled={isSubmitting}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="signup-confirm-password">
              Confirm password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              autoComplete="new-password"
              className={INPUT_CLASSES}
              placeholder="••••••••"
              value={confirmPassword}
              disabled={isSubmitting}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
