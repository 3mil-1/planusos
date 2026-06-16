"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface ExamTimerProps {
  initialSeconds: number;
  onExpire: () => void;
}

export function ExamTimer({ initialSeconds, onExpire }: ExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const urgent = secondsLeft < 300;

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-sm ${
        urgent
          ? "border-red-500/50 bg-red-500/10 text-red-300"
          : "border-slate-700 bg-slate-800/80 text-slate-200"
      }`}
    >
      <Clock className="h-4 w-4" />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
