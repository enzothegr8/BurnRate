import { GapBars } from "@/components/ui/gap-chart";
import { Figure } from "@/components/ui/figure";
import { resolveFact } from "@/lib/facts/store";

/**
 * The gap module (brand-bible.md section 9), the page's workhorse. In order:
 * kicker, claim sentence in Instrument Serif, hollow bar above solid bar on a
 * shared scale, a paragraph of voice, a link deeper.
 *
 * The hollow bar draws moonbase.program.total at $20B, dashed. That is the
 * decision, not an oversight (data-model.md section 4): the gap module's
 * subject is the headline number, and substituting a tidier in-house sum of
 * the phase figures would quietly remove the very thing the module indicts.
 */
export function GapModule() {
  const pledged = resolveFact("moonbase.program.total");
  const signed = resolveFact("moonbase.committed.total");
  const share = resolveFact("moonbase.committed.share");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        The Moon Base · pledged against signed
      </p>
      <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-ink sm:text-5xl">
        A budget is a promise, and promises are not receipts.
      </h2>

      <div className="mt-10">
        <GapBars
          bars={[
            {
              fact: pledged,
              kind: "pledged",
              label: "Pledged · spoken, March 24, 2026",
            },
            {
              fact: signed,
              kind: "signed",
              label: "Signed · awards to date, incl. unexercised option",
            },
          ]}
        />
        <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          Signed share of the pledge: <Figure fact={share} />
        </p>
      </div>

      {/* TODO(Enzo): the paragraph of voice goes here and stays empty until
          you write it. Proposal, assembled around your reference sentences:
          "Twenty billion is the number NASA says. $1.6 billion is the number
          the contracts say, and $280 million of that is an option nobody has
          exercised. The money so far grades the road. The building has not
          been ordered." */}

      <p className="mt-8 font-sans text-sm text-secondary">
        <a href="#ledger">Every dollar of the signed figure, itemized in the ledger below.</a>
      </p>
    </div>
  );
}
