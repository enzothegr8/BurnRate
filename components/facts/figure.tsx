// The confidence mark. Solid is confirmed, dashed is reported, dotted is
// derived, and confidence is the only thing in this system that maps to an
// underline. No consumer may override it, which is why there is no className
// prop here: a caller that could restyle the mark could make the notation lie.
//
// The marks are kinds, not degrees. Dotted asserts that Burn Rate did the
// arithmetic. If it did not, dotted is a lie, just a self-deprecating one.
//
// This renders a value that is already a string. The real component reads a
// record from the fact store, formats the raw value at render, and refuses to
// render at all when there are no sources. That arrives with the fact store.

export type Confidence = "confirmed" | "reported" | "derived";

const MARK: Record<Confidence, string> = {
  confirmed: "cf",
  reported: "rp",
  derived: "dv",
};

export function Figure({
  value,
  confidence,
}: {
  value: string;
  confidence: Confidence;
}) {
  return <span className={`num ${MARK[confidence]}`}>{value}</span>;
}
