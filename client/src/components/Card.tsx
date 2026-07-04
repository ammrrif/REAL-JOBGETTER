import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  accent?: "indigo" | "emerald" | "amber" | "rose" | "slate";
}

const ACCENT_CLASSES: Record<NonNullable<CardProps["accent"]>, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function Card({ title, icon, children, className = "", accent = "slate" }: CardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {title && (
        <div className="mb-4 flex items-center gap-3">
          {icon && (
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ACCENT_CLASSES[accent]}`}>
              {icon}
            </span>
          )}
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}
