import type { MDXComponents } from "mdx/types";
import { Figure } from "@/components/ui/figure";

/*
 * Global MDX component map, required by @next/mdx with the App Router.
 *
 * Figure is provided globally so article body copy renders numbers from the
 * fact store without an import line in every file. Body copy is a view onto
 * the store, not a place where numbers get typed in (data-model.md section 1);
 * tools/lint-mdx-numerals.mjs enforces the typing half of that at build time.
 *
 * Element styles follow the house type system: Instrument Serif for display,
 * IBM Plex Sans for running copy, hairlines for structure. No prose plugin;
 * the map is the stylesheet.
 */

const components: MDXComponents = {
  Figure,
  h2: (props) => (
    <h2 className="mt-12 font-display text-2xl text-ink sm:text-3xl" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-8 font-sans text-base font-medium text-ink" {...props} />
  ),
  p: (props) => (
    <p className="mt-5 font-sans text-base leading-relaxed text-ink" {...props} />
  ),
  ul: (props) => (
    <ul className="mt-5 list-disc space-y-2 pl-5 font-sans text-base leading-relaxed text-ink" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-5 list-decimal space-y-2 pl-5 font-sans text-base leading-relaxed text-ink" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="mt-6 border-l-2 border-rule pl-4 font-sans text-base italic leading-relaxed text-secondary" {...props} />
  ),
  hr: () => <hr className="mt-10 border-rule" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
