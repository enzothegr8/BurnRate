import { Figure } from "@/components/ui/figure";
import { getLedger, resolveFact, resolveLedgerRow } from "@/lib/facts/store";
import type { LedgerRow, ResolvedFact } from "@/lib/facts/types";

/**
 * The ledger (brand-bible.md section 9): recipient, descriptor, date, value
 * with notation. Hairline separated, no cards. The zero rows render at the
 * same visual weight as the funded rows; they are not a footnote to the
 * ledger, they are the argument the ledger is making (data-model.md
 * section 4).
 */

function descriptorFor(row: LedgerRow): string {
  if (row.status === "solicitation") {
    return row.category === "power"
      ? "No award. NextSTEP-3 Appendix B directed call open since June 30, 2026."
      : "No award. No solicitation open; listed as a follow-on directed topic.";
  }
  return row.payload ?? row.category;
}

/**
 * A solicitation row displays two different records (data-model.md section 4):
 * the solicitation itself, reported and sourced on the ledger row, and the
 * dollar figure, which is a derived fact, Burn Rate's own count of an empty
 * award category. The zero renders dotted while funded rows render dashed,
 * which is the honest relationship: nobody told Burn Rate this, Burn Rate
 * counted.
 */
const ZERO_FACT_BY_CATEGORY: Partial<Record<LedgerRow["category"], string>> = {
  habitat: "moonbase.committed.habitat",
  power: "moonbase.committed.power",
};

function valueFactFor(row: LedgerRow): ResolvedFact {
  if (row.status === "solicitation") {
    const derivedId = ZERO_FACT_BY_CATEGORY[row.category];
    if (!derivedId) {
      throw new Error(`No derived committed sum exists for category '${row.category}'`);
    }
    return resolveFact(derivedId);
  }
  return resolveLedgerRow(row.id);
}

function optionFact(row: LedgerRow): ResolvedFact | null {
  if (!row.option_value) return null;
  return {
    kind: "fact",
    id: `${row.id}.option`,
    value: row.option_value,
    unit: "USD",
    label: `${row.recipient}, option period`,
    as_of: row.date,
    confidence: row.confidence,
    sources: row.sources,
    notes: row.notes,
    stale: false,
    stale_after: row.stale_after,
  };
}

export function Ledger() {
  const rows = getLedger();
  const awards = rows
    .filter((r) => r.status === "award")
    .sort((a, b) => b.value - a.value);
  const solicitations = rows.filter((r) => r.status === "solicitation");
  const ordered = [...awards, ...solicitations];

  return (
    <div id="ledger">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        The Moon Base ledger · every award, every zero
      </p>
      {/* TODO(Enzo): claim sentence slot for the ledger. Proposal: "Seven
          awards, two zeros, and the zeros are the ones to watch." Slot stays
          empty until you write or approve one. */}
      <ul className="mt-6 border-t border-rule">
        {ordered.map((row) => {
          const option = optionFact(row);
          return (
            <li
              key={row.id}
              className="grid grid-cols-1 gap-2 border-b border-rule py-4 sm:grid-cols-[1fr_auto] sm:items-baseline"
            >
              <div>
                <p className="font-sans text-base font-medium text-ink">
                  {row.recipient}
                </p>
                <p className="mt-0.5 font-sans text-sm text-secondary">
                  {descriptorFor(row)}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="font-mono text-lg text-ink">
                  <Figure fact={valueFactFor(row)} />
                </p>
                {option && (
                  <p className="mt-0.5 font-mono text-xs text-secondary">
                    + <Figure fact={option} /> option, unexercised
                  </p>
                )}
                <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
                  {row.date}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
