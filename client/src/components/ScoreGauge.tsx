import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number): { stroke: string; text: string; label: string } {
  if (score >= 80) return { stroke: "#059669", text: "text-emerald-600", label: "Strong Match" };
  if (score >= 55) return { stroke: "#d97706", text: "text-amber-600", label: "Moderate Match" };
  return { stroke: "#e11d48", text: "text-rose-600", label: "Weak Match" };
}

export default function ScoreGauge({ score, size = 176 }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { stroke, text, label } = getScoreColor(score);

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const timeout = setTimeout(() => setAnimatedScore(score), 100);
      return () => clearTimeout(timeout);
    });
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.65, 0, 0.35, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-slate-900">{animatedScore}</span>
          <span className="text-xs font-medium text-slate-400">/ 100</span>
        </div>
      </div>
      <span className={`mt-3 rounded-full bg-slate-50 px-4 py-1 text-sm font-semibold ${text}`}>{label}</span>
    </div>
  );
}
