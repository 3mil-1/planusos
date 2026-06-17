"use client";

import { useCallback, useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import type { QuestionFigure } from "@/data/questionImages";

interface QuestionFiguresProps {
  figures: QuestionFigure[];
}

export function QuestionFigures({ figures }: QuestionFiguresProps) {
  const [lightbox, setLightbox] = useState<QuestionFigure | null>(null);

  const close = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close]);

  if (figures.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        {figures.map((fig) => (
          <figure
            key={fig.src}
            className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900/60"
          >
            <button
              type="button"
              onClick={() => setLightbox(fig)}
              className="group relative block w-full focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              aria-label={`Powiększ: ${fig.alt}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fig.src}
                alt={fig.alt}
                className="mx-auto max-h-[28rem] w-full object-contain"
                loading="lazy"
              />
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-slate-950/80 px-2 py-1 text-xs text-slate-300 opacity-0 transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-3.5 w-3.5" />
                Powiększ
              </span>
            </button>
            {fig.caption && (
              <figcaption className="border-t border-slate-700/80 px-3 py-2 text-xs text-slate-400">
                {fig.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-lg bg-slate-800 p-2 text-white hover:bg-slate-700"
            aria-label="Zamknij"
          >
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-h-[92vh] max-w-[96vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
