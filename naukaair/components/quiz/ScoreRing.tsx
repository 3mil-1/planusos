"use client";

interface ScoreRingProps {
  percent: number;
  size?: number;
}

export function ScoreRing({ percent, size = 160 }: ScoreRingProps) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const color =
    percent >= 80 ? "#34d399" : percent >= 60 ? "#38bdf8" : percent >= 40 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold text-white">{percent}%</div>
        <div className="text-xs text-slate-400">wynik</div>
      </div>
    </div>
  );
}
