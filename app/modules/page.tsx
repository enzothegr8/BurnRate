import type { Metadata } from "next";
import Link from "next/link";
import { TitleBlock } from "@/components/ui/title-block";
import {
  modules,
  moduleSources,
  moduleStatus,
  type ModuleRecord,
  type ModuleStatus,
} from "@/lib/modules/registry";

/**
 * /modules, the permanent home for everything interactive on Burn Rate. The
 * page is a view onto the registry; it hardcodes nothing about any module.
 * Vellum, hairlines, scale contrast. No hero imagery; the modules are the
 * imagery.
 */

export const metadata: Metadata = {
  title: "Modules · Burn Rate",
  description: "Burn Rate. The economics of the space industry.",
};

const STATUS_LABEL: Record<ModuleStatus, string> = {
  live: "Live",
  draft: "Draft",
  stale: "Stale",
};

function ModuleSection({ record }: { record: ModuleRecord }) {
  const status = moduleStatus(record);
  const Component = record.Component;

  return (
    <section className="border-b border-rule py-16 last:border-b-0">
      <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
        {record.title} · {STATUS_LABEL[status]} · Updated {record.updated}
      </p>
      {/* Claim sentences carry TODO(Enzo) markers at their registry entries;
          the page renders whatever the registry says. */}
      <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-ink sm:text-4xl">
        {record.claim}
      </h2>

      {status === "stale" && (
        <p className="mt-4 max-w-2xl font-mono text-xs uppercase tracking-widest text-secondary">
          One or more of this module&apos;s input records is past its stale_after
          date. The figures below are flagged, not hidden (data-model section 5).
        </p>
      )}

      {Component ? (
        <div className="mt-10">
          <Component />
        </div>
      ) : (
        <p className="mt-10 font-sans text-sm text-secondary">
          In drafting. The registry entry exists so the page knows what is
          coming; the module does not render until it has something honest to
          show.
        </p>
      )}

      <div className="mt-12">
        <TitleBlock
          doc={record.doc}
          rev={record.rev}
          updated={record.updated}
          sources={moduleSources(record)}
        />
      </div>
    </section>
  );
}

export default function ModulesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6">
      <header className="border-b border-rule py-10">
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          <Link href="/">Burn Rate</Link>
          {" · "}
          <Link href="/articles">Articles</Link>
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Modules</h1>
        <p className="mt-2 max-w-xl font-sans text-sm text-secondary">
          The interactive instruments. Each one renders from the fact store,
          carries a title block, and reports its own staleness.
        </p>
      </header>

      {modules.length === 0 && (
        <p className="py-12 font-mono text-xs uppercase tracking-widest text-muted">
          No modules yet.
        </p>
      )}

      {modules.map((record) => (
        <ModuleSection key={record.id} record={record} />
      ))}

      <div className="h-10" />
    </main>
  );
}
