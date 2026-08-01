// The confidence mark. Solid is confirmed, dashed is reported, dotted is
// derived, and confidence is the only thing in this system that maps to an
// underline.
//
// There are exactly two ways to render a number and both of them are named.
//
//   <Figure id="..." />                              a record in the store
//   <Figure placeholder="$000B" confidence="..." />  scaffolding, visibly fake
//
// The union below makes those mutually exclusive, so there is no third way that
// quietly accepts a raw value with a mark somebody typed. That third way is how
// an unmarked claim gets onto a page: not by anyone deciding to publish one, but
// by a component being accommodating.
//
// A caller cannot override the mark on a real record. The confidence comes from
// the store, and for a derived record it comes from the type system, which has
// no confidence field to read.

import { format } from "@/lib/facts/format";
import { resolveFact } from "@/lib/facts/store";
import type { Confidence } from "@/lib/facts/types";

const MARK: Record<Confidence, string> = {
  confirmed: "cf",
  reported: "rp",
  derived: "dv",
};

type FigureProps =
  | { id: string; placeholder?: never; confidence?: never }
  | { placeholder: string; confidence: Confidence; id?: never };

export function Figure(props: FigureProps) {
  if (props.id !== undefined) {
    const fact = resolveFact(props.id);
    // Failing loudly is the point. A figure whose record has gone missing is a
    // claim with no provenance, and rendering a blank or a dash would hide that
    // behind something that looks deliberate.
    if (!fact) {
      throw new Error(
        `<Figure id="${props.id}" /> has no record. Every number renders from the fact store, so a missing record is a build failure rather than an empty span.`,
      );
    }
    return (
      <span
        className={`num ${MARK[fact.confidence]}`}
        title={fact.stale ? `${fact.label}. Verification has aged.` : fact.label}
        data-stale={fact.stale ? "true" : undefined}
      >
        {format(fact.value, fact.unit)}
        {/* Stale figures render flagged, never hidden. */}
        {fact.stale && <span className="stale-flag">*</span>}
      </span>
    );
  }

  return (
    <span className={`num ${MARK[props.confidence]}`}>{props.placeholder}</span>
  );
}
