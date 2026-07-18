import type { ComponentType } from "react";
import { Ledger } from "@/components/ledger";
import { getLedgerRowIds, resolveFactOrLedgerRow } from "@/lib/facts/store";
import type { Source } from "@/lib/facts/types";

/**
 * The module registry. /modules renders this list and nothing else; adding a
 * module is one entry here, not a page refactor.
 *
 * A module is a record, like everything else on this site: it has an id, a
 * revision, an updated date, and a set of input records. Status is two
 * fields, not one: `status` is editorial (live or draft, set by hand), and
 * the rendered status is computed, because a live module whose inputs are
 * past stale_after is STALE whether or not anyone got around to saying so
 * (data-model.md section 5). The instrument reports its own fault.
 */

export type ModuleBaseStatus = "live" | "draft";
export type ModuleStatus = "live" | "draft" | "stale";

export interface ModuleRecord {
  id: string;
  title: string;
  /** The claim sentence, Instrument Serif on the page. Voice is Enzo's. */
  claim: string;
  /** Editorial status. STALE is never set by hand; it is computed. */
  status: ModuleBaseStatus;
  rev: string;
  updated: string;
  /** Title block doc code. */
  doc: string;
  /**
   * Every record the module renders. Drives the computed staleness and the
   * title block's source list. A module with no inputs would be a module
   * with no numbers, which is not a module.
   */
  inputIds: string[];
  /** Null while a module is in drafting; the registry entry exists first. */
  Component: ComponentType | null;
}

export const modules: ModuleRecord[] = [
  {
    id: "moonbase-ledger",
    title: "The Moon Base ledger",
    // TODO(Enzo): placeholder claim sentence, agent-proposed so the page
    // reads complete. Rewrite before anything publishes.
    claim: "Every award, every zero, and the date each number was last worth trusting.",
    status: "live",
    rev: "01",
    updated: "2026-07-17",
    doc: "BR-MOD-LEDGER",
    inputIds: [
      ...getLedgerRowIds(),
      "moonbase.committed.habitat",
      "moonbase.committed.power",
      "moonbase.committed.total",
      "moonbase.committed.base",
    ],
    Component: Ledger,
  },
];

/**
 * The rendered status. Editorial status, overridden to STALE when any input
 * record is past its stale_after. Derived inputs inherit staleness from
 * their own inputs in the store, so this check composes.
 */
export function moduleStatus(record: ModuleRecord, today: Date = new Date()): ModuleStatus {
  if (record.status === "draft") return "draft";
  const anyStale = record.inputIds.some((id) => resolveFactOrLedgerRow(id, today).stale);
  return anyStale ? "stale" : "live";
}

/** Every source behind a module's inputs, deduped by URL, for its title block. */
export function moduleSources(record: ModuleRecord): Source[] {
  const collected: Source[] = [];
  for (const id of record.inputIds) {
    const resolved = resolveFactOrLedgerRow(id);
    if (resolved.kind === "fact") collected.push(...resolved.sources);
  }
  const seen = new Set<string>();
  return collected.filter((source) => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}
