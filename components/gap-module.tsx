import { GapBars } from "@/components/ui/gap-chart";
import { Figure } from "@/components/ui/figure";
import { resolveFact, resolveLedgerOption } from "@/lib/facts/store";

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
  const option = resolveLedgerOption("moonbase.award.blue-origin.2026-05-26");

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

      {/* TODO(Enzo): placeholder voice paragraph, agent-proposed so the page
          reads complete. Rewrite before anything publishes; voice is not
          delegable. Every figure resolves from the store and keeps its mark. */}
      <p className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-ink">
        <Figure fact={pledged} /> is the number NASA says. <Figure fact={signed} /> is
        the number the contracts say, and <Figure fact={option} /> of that is an
        option nobody has exercised. The money so far grades the road. The
        building has not been ordered.
      </p>

      <p className="mt-8 font-sans text-sm text-secondary">
        <a href="#ledger">Every dollar of the signed figure, itemized in the ledger below.</a>
      </p>
    </div>
  );
}
