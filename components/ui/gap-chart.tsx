import { Figure } from "./figure";
import type { ResolvedFact } from "@/lib/facts/types";

/**
 * The shared bar primitive, and the law it encodes (brand-bible.md section 7,
 * principle 3): a pledged figure is drawn as an OUTLINE, ink stroke and no
 * fill. A signed figure is drawn as a FILL. Promises are hollow, receipts are
 * solid. Every chart on this site that draws money draws it through this
 * component. Do not build one-off bars.
 *
 * Bars share one scale. The width of each bar is its raw value over the
 * largest value in the set; the gap between an enormous hollow bar and a thin
 * solid one is the point, so widths are never clamped upward to look better.
 */

export interface GapBarSpec {
  fact: ResolvedFact;
  /** Hollow outline for a promise, solid fill for a receipt. */
  kind: "pledged" | "signed";
  /** Short mono label above the bar, e.g. "PLEDGED · SPOKEN, MARCH 2026". */
  label: string;
}

export function GapBars({ bars }: { bars: GapBarSpec[] }) {
  const scaleMax = Math.max(...bars.map((b) => b.fact.value));

  return (
    <div className="space-y-5">
      {bars.map((bar) => {
        const widthPct = scaleMax > 0 ? (bar.fact.value / scaleMax) * 100 : 0;
        return (
          <div key={bar.fact.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-4">
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
                {bar.label}
              </span>
              <span className="font-mono text-sm text-ink">
                <Figure fact={bar.fact} />
              </span>
            </div>
            <div
              role="img"
              aria-label={`${bar.label}: ${bar.kind === "pledged" ? "hollow bar, a promise" : "solid bar, a receipt"}`}
              className={
                bar.kind === "pledged"
                  ? "h-9 border-[1.5px] border-ink"
                  : "h-9 bg-ink"
              }
              style={{ width: `${Math.max(widthPct, 0.25)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
