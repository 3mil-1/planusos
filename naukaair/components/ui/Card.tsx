import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20",
        className,
      )}
    >
      {children}
    </div>
  );
}
