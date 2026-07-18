import { useId } from "react";
import { formatValue, type FigureFormat } from "@/lib/facts/format";
import { resolveFactOrLedgerRow } from "@/lib/facts/store";
import { markFor, type ResolvedFact, type UnderlineMark } from "@/lib/facts/types";

/**
 * The notation primitive. Every number on the site renders through this.
 *
 * The underline comes from the record's confidence and from nothing else.
 * There is deliberately no className prop and no style prop: a caller cannot
 * override the mark. If a number needs a different mark, the record is wrong;
 * fix the record (data-model.md section 2).
 *
 * Confidence is read from the resolved fact on every render, so a fact whose
 * confidence changes at runtime changes its underline with it. Nothing here
 * is memoized, on purpose: a later module needs numbers to visibly lose
 * confidence when a user edits them.
 */

const UNDERLINE_CLASS: Record<UnderlineMark, string> = {
  solid: "border-b-[1.5px] border-solid border-ink",
  dashed: "border-b-[1.5px] border-dashed border-muted",
  dotted: "border-b-[1.5px] border-dotted border-ochre",
};

interface FigureProps {
  /** Resolve from the store by id. Facts, derived facts, and ledger rows all resolve; a ledger row is a record with provenance like any other. */
  factId?: string;
  /** Or pass an already resolved fact, e.g. one whose confidence is changing at runtime. */
  fact?: ResolvedFact;
  format?: FigureFormat;
  /** Display suffix such as "/sec". Formatting is a render concern; the underline is not. */
  suffix?: string;
}

export function Figure({ factId, fact, format = "compact", suffix }: FigureProps) {
  const noteId = useId();

  const resolved = fact ?? (factId ? resolveFactOrLedgerRow(factId) : null);
  if (!resolved) {
    throw new Error("<Figure /> requires a factId or a resolved fact");
  }

  const mark = markFor(resolved);
  const hasNotes = resolved.notes.trim().length > 0;

  return (
    <span className="group relative inline-block">
      <span
        tabIndex={hasNotes ? 0 : undefined}
        aria-describedby={hasNotes ? noteId : undefined}
        className={`font-mono pb-px outline-none ${UNDERLINE_CLASS[mark]}`}
      >
        {formatValue(resolved.value, resolved.unit, format)}
        {suffix}
      </span>
      {resolved.stale && (
        <span className="ml-1 align-super font-mono text-[0.6em] tracking-widest text-muted">
          STALE
        </span>
      )}
      {hasNotes && (
        <span
          role="tooltip"
          id={noteId}
          className="pointer-events-none invisible absolute bottom-full left-1/2 z-10 mb-2 w-72 -translate-x-1/2 border border-rule bg-card p-3 text-left group-hover:visible group-focus-within:visible"
        >
          <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-muted">
            {resolved.kind === "derived"
              ? `derived · ${resolved.formula}`
              : `${resolved.confidence} · as of ${resolved.as_of}`}
          </span>
          <span className="mt-1 block font-sans text-xs leading-relaxed text-secondary">
            {resolved.notes}
          </span>
        </span>
      )}
    </span>
  );
}
