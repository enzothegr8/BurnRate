import { flags } from "@/lib/flags";
import { resolveFactOrLedgerRow } from "@/lib/facts/store";
import { markFor, type UnderlineMark } from "@/lib/facts/types";

/**
 * CONFIDENCE MIX: an article's facts array counted by mark and rendered as a
 * small solid/dashed/dotted key, e.g. "5 dashed · 3 dotted". The counts are
 * computed from the records at render time, never typed.
 *
 * Behind flags.confidenceMix, default off. Built and wired; enabling it is
 * an editorial decision, not a code change.
 */

const SAMPLE_CLASS: Record<UnderlineMark, string> = {
  solid: "border-solid border-ink",
  dashed: "border-dashed border-muted",
  dotted: "border-dotted border-ochre",
};

const MARK_ORDER: UnderlineMark[] = ["solid", "dashed", "dotted"];

export function ConfidenceMix({ factIds }: { factIds: string[] }) {
  if (!flags.confidenceMix) return null;

  const counts: Record<UnderlineMark, number> = { solid: 0, dashed: 0, dotted: 0 };
  for (const id of factIds) {
    counts[markFor(resolveFactOrLedgerRow(id))] += 1;
  }
  const present = MARK_ORDER.filter((mark) => counts[mark] > 0);
  if (present.length === 0) return null;

  return (
    <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
      {" · "}
      {present.map((mark, index) => (
        <span key={mark}>
          {index > 0 && " · "}
          <span
            aria-hidden
            className={`mr-1 inline-block w-4 border-b-[1.5px] align-middle ${SAMPLE_CLASS[mark]}`}
          />
          {counts[mark]} {mark}
        </span>
      ))}
    </span>
  );
}
