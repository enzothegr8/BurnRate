import Link from "next/link";
import { Counter } from "@/components/counter";
import { GapModule } from "@/components/gap-module";
import { Ledger } from "@/components/ledger";
import { TitleBlock } from "@/components/ui/title-block";
import { getLedger, resolveFact } from "@/lib/facts/store";
import type { Source } from "@/lib/facts/types";

/**
 * The home page. Three tiers per data-model.md section 7, read top to bottom
 * as a rate, a gap, a ledger. Scale contrast, not tiles: the counter is
 * enormous, the gap module is wide, the ledger is dense. The page renders
 * almost entirely dashed and dotted, which is correct and is the point; the
 * notation is the caveat, per number, at the site of the claim. No banner.
 */

/** Every source behind every figure on this page, deduped, for the title block. */
function pageSources(): Source[] {
  const factSources = (id: string): Source[] => {
    const resolved = resolveFact(id);
    return resolved.kind === "fact" ? resolved.sources : [];
  };
  const collected: Source[] = [
    ...factSources("economy.global.2024"),
    ...factSources("moonbase.program.total"),
    ...getLedger().flatMap((row) => row.sources),
  ];
  const seen = new Set<string>();
  return collected.filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });
}

export default function Home() {
  const rate = resolveFact("economy.burn_per_second");
  if (rate.kind !== "derived") throw new Error("economy.burn_per_second must be derived");
  const source = resolveFact("economy.global.2024");

  return (
    <main className="mx-auto w-full max-w-5xl px-6">
      <header className="border-b border-rule py-10">
        <h1 className="font-display text-4xl text-ink">Burn Rate</h1>
        <p className="mt-2 max-w-xl font-sans text-sm text-secondary">
          Space is the new frontier of human investment. Money is propellant, and it
          burns first.
        </p>
        <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          Figures as of July 17, 2026
        </p>
        <nav className="mt-4 space-x-4 font-mono text-[0.65rem] uppercase tracking-widest">
          <Link href="/articles">Articles</Link>
          <Link href="/modules">Modules</Link>
        </nav>
      </header>

      <section className="border-b border-rule py-20">
        <Counter rate={rate} source={source} />
      </section>

      <section className="border-b border-rule py-20">
        <GapModule />
      </section>

      <section className="py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          The Moon Base ledger · every award, every zero
        </p>
        {/* TODO(Enzo): placeholder claim sentence, agent-proposed so the page
            reads complete. Rewrite before anything publishes. The counts are
            spelled out, not typed as numerals, and go stale the day an award
            lands; that is one more reason this line is yours to replace. */}
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-ink sm:text-4xl">
          Seven awards, two zeros, and the zeros are the ones to watch.
        </h2>
        <div className="mt-6">
          <Ledger />
        </div>
      </section>

      <TitleBlock
        doc="BR-HOME"
        rev="01"
        updated="2026-07-17"
        sources={pageSources()}
      />
      <div className="h-10" />
    </main>
  );
}
