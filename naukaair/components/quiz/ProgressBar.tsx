"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm text-slate-400">
          <span>{label}</span>
          <span>
            {current}/{total} ({percent}%)
          </span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
