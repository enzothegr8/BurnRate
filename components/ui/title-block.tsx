/**
 * The title block. Engineering drawing convention at the foot of anything
 * with numbers in it: DOC, REV, UPDATED, DRAWN, SOURCES (brand-bible.md
 * section 9). Hairline rules, no card, no shadow. The revision number is
 * orange, because the revision is the thing that changed.
 */

interface TitleBlockSource {
  name: string;
  url?: string;
  tier?: number;
  retrieved_at?: string;
}

interface TitleBlockProps {
  doc: string;
  rev: string;
  updated: string;
  drawn?: string;
  sources: TitleBlockSource[];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 border-l border-rule px-3 py-2 first:border-l-0 first:pl-0">
      <div className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">{label}</div>
      <div className="mt-0.5 font-mono text-xs text-ink">{children}</div>
    </div>
  );
}

export function TitleBlock({ doc, rev, updated, drawn = "E. CARVALHO", sources }: TitleBlockProps) {
  return (
    <footer className="border-t border-rule">
      <div className="flex border-b border-rule">
        <Field label="Doc">{doc}</Field>
        <Field label="Rev">
          <span className="text-orange">{rev}</span>
        </Field>
        <Field label="Updated">{updated}</Field>
        <Field label="Drawn">{drawn}</Field>
      </div>
      <div className="py-2">
        <div className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">Sources</div>
        <ul className="mt-1 space-y-0.5">
          {sources.map((source) => (
            <li key={source.name} className="font-mono text-xs text-secondary">
              {source.url ? <a href={source.url}>{source.name}</a> : source.name}
              {source.tier ? ` · T${source.tier}` : null}
              {source.retrieved_at ? ` · retrieved ${source.retrieved_at}` : null}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
