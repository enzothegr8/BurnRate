import type { Confidence } from "@/lib/facts/types";
import { type Band, dashArray, lineCap, strokeWidth } from "@/lib/marks";

// The confidence notation drawn as SVG, for charts, diagrams, and any scene
// carrying numbers where border-bottom does not exist: canvas, WebGL, an
// exported PDF. Geometry reads from lib/marks.ts, the same source
// app/globals.css reads for the CSS version, so a CSS mark and a MarkLine at
// the same band are the same rule.
//
// Stroke is jet, or page white when inverted for the jet surface used on
// social cards and video, exactly as the logo segments invert there.

type MarkLineProps = {
  confidence: Confidence;
  band: Band;
  /** The rule's length in px. */
  length: number;
  inverted?: boolean;
};

export function MarkLine({
  confidence,
  band,
  length,
  inverted = false,
}: MarkLineProps) {
  const width = strokeWidth(confidence, band);
  const dash = dashArray(confidence, band);
  const cap = lineCap(confidence);
  const y = width / 2;

  return (
    <svg
      width={length}
      height={width}
      viewBox={`0 0 ${length} ${width}`}
      role="presentation"
      aria-hidden
    >
      <line
        x1={0}
        y1={y}
        x2={length}
        y2={y}
        stroke={inverted ? "var(--color-page)" : "var(--color-jet)"}
        strokeWidth={width}
        strokeLinecap={cap}
        strokeDasharray={dash ? dash.join(" ") : undefined}
      />
    </svg>
  );
}
