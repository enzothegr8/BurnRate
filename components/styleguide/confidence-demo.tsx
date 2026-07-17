"use client";

import { useState } from "react";
import { Figure } from "@/components/ui/figure";
import type { Confidence, ResolvedFact } from "@/lib/facts/types";

/**
 * Demonstrates that confidence is runtime state and the underline follows it.
 * A later module needs numbers to visibly lose confidence the moment a user
 * edits a preset field, so Figure must re-derive its mark on every render.
 * This demo mutates a copy; the stored record is untouched.
 */

const LEVELS: Confidence[] = ["confirmed", "reported", "derived"];

export function ConfidenceDemo({ initial }: { initial: ResolvedFact }) {
  if (initial.kind !== "fact") {
    throw new Error("ConfidenceDemo requires a stored fact, not a derived one");
  }
  return <Demo initial={initial} />;
}

function Demo({ initial }: { initial: Extract<ResolvedFact, { kind: "fact" }> }) {
  const [confidence, setConfidence] = useState<Confidence>(initial.confidence);

  const fact: ResolvedFact = { ...initial, confidence };

  return (
    <div>
      <p className="font-sans text-sm text-secondary">
        {fact.label}: <Figure fact={fact} />
      </p>
      <div className="mt-3 flex gap-px border border-rule w-fit">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setConfidence(level)}
            aria-pressed={confidence === level}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest ${
              confidence === level
                ? "bg-ink text-vellum"
                : "bg-card text-secondary hover:text-ink"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
        Demo state only. The stored record keeps its confidence: {initial.confidence}. In
        production, only E. Carvalho promotes a number to confirmed.
      </p>
    </div>
  );
}
