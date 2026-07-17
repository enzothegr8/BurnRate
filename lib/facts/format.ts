/**
 * Formatting for fact values. Values are stored raw (data-model.md section 2);
 * everything about their presentation happens here, at render time.
 *
 * Formatting is a render concern and is legitimately variable per site. The
 * underline is not: it comes from confidence alone, in figure.tsx.
 */

import type { Unit } from "./types";

export type FigureFormat =
  /** $1.573B, $297.9M, $19,438. The house default for USD. */
  | "compact"
  /** $1,572,800,000. */
  | "full"
  /** Integer with thousands separators, no currency symbol. */
  | "plain";

function compactUsd(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${trimTrailingZero((value / 1e9).toFixed(3))}B`;
  if (abs >= 1e6) return `$${trimTrailingZero((value / 1e6).toFixed(1))}M`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function trimTrailingZero(fixed: string): string {
  return fixed.replace(/\.?0+$/, "");
}

export function formatValue(
  value: number,
  unit: Unit,
  format: FigureFormat = "compact"
): string {
  switch (unit) {
    case "USD":
      if (format === "full") return `$${Math.round(value).toLocaleString("en-US")}`;
      if (format === "plain") return Math.round(value).toLocaleString("en-US");
      return compactUsd(value);
    case "USD_per_kg":
      return `${compactUsd(value)}/kg`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "days":
      return `${Math.round(value).toLocaleString("en-US")}`;
    case "kg":
      return `${Math.round(value).toLocaleString("en-US")} kg`;
    case "count":
      return Math.round(value).toLocaleString("en-US");
  }
}
