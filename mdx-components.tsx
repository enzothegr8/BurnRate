import type { MDXComponents } from "mdx/types";
import { Inset } from "@/components/articles/inset";
import { DomainTag, DomainTags } from "@/components/brand/domain-tag";
import { Figure } from "@/components/facts/figure";

// Required by @next/mdx in the App Router. It will not work without this file.
//
// This is the whole vocabulary an article body has. Anything not listed here is
// plain markdown, which is the point: a piece cannot reach for a component that
// was never approved, and it cannot style its way around the system.
//
// <Figure /> is the only way a number reaches the page. It takes either a record
// id or an explicit placeholder, and the numeral lint fails the build on any
// digit typed into prose beside it.
const components: MDXComponents = {
  Figure,
  Inset,
  DomainTag,
  DomainTags,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
