import katex from "katex";
import { cn } from "@/lib/utils";
import { escapeHtml, parseMathSegments } from "@/lib/mathText";

import "katex/dist/katex.min.css";

type MathTextProps = {
  text: string;
  className?: string;
  as?: "span" | "p" | "div";
};

function renderSegmentHtml(
  segment: ReturnType<typeof parseMathSegments>[number],
): string {
  if (segment.type === "text") {
    return escapeHtml(segment.value);
  }

  try {
    const html = katex.renderToString(segment.value, {
      throwOnError: false,
      displayMode: segment.type === "block",
      strict: "ignore",
    });
    if (html.includes('class="katex-error"')) {
      return escapeHtml(segment.value);
    }
    return html;
  } catch {
    return escapeHtml(segment.value);
  }
}

export function renderMathTextHtml(text: string): string {
  return parseMathSegments(text).map(renderSegmentHtml).join("");
}

export function MathText({ text, className, as: Tag = "span" }: MathTextProps) {
  const html = renderMathTextHtml(text);

  return (
    <Tag
      className={cn("math-text leading-relaxed", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
