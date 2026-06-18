"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("naukaair error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-amber-400" />
      <h1 className="text-xl font-bold text-white">Coś poszło nie tak</h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Serwer chwilowo nie wczytał strony (Render Free potrafi się przycinać). Spróbuj
        ponownie albo wróć do logowania.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-slate-600">#{error.digest}</p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-400"
        >
          Spróbuj ponownie
        </button>
        <a
          href="/login"
          className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          Strona logowania
        </a>
      </div>
    </div>
  );
}
