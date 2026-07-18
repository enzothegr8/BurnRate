#!/usr/bin/env node
/**
 * Bare-numeral lint for MDX articles.
 *
 * Body copy is a view onto the fact store, not a place where numbers get
 * typed in (data-model.md section 1). Every number renders through
 * <Figure /> from a record; a digit sitting in prose is an unmarked claim,
 * and an unmarked figure reads as asserted (brand-bible.md section 4).
 *
 * This script strips everything that legitimately contains digits, then
 * fails the build on any digit left in the prose:
 *   stripped: YAML frontmatter, MDX comments, import/export lines, fenced
 *   and inline code, JSX tags including their attributes (fact ids and
 *   dates live there).
 *
 * Escape hatch: a line is exempt when it, or the line directly above it,
 * carries an MDX comment containing "numerals-ok". Use it for digits that
 * are typography rather than claims, and say why in the comment.
 *
 * WHAT IT CATCHES: any literal digit in rendered prose. A typed "$1.6B", a
 * year, a date, a phone-number-shaped anything, a numeral pasted in from a
 * source.
 *
 * WHAT IT CANNOT CATCH: spelled-out numbers ("seven awards", "twenty
 * billion"), which are still claims and still Enzo's to police; a <Figure />
 * pointing at the wrong record, which is a provenance error, not a typing
 * error; digits hidden inside JSX attributes or code spans, which are
 * stripped on purpose; and lines waved through with numerals-ok. It is a
 * tripwire, not a verifier.
 */

import fs from "node:fs";
import path from "node:path";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

/** Blank a matched region, preserving newlines so line numbers survive. */
function blank(match) {
  return match.replace(/[^\n]/g, " ");
}

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

function lintFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");

  // Record numerals-ok directives before comments are blanked. The directive
  // exempts its own line and the line below it.
  const allowed = new Set();
  for (const match of source.matchAll(/\{\/\*[\s\S]*?\*\/\}/g)) {
    if (/numerals-ok/.test(match[0])) {
      const line = lineOf(source, match.index + match[0].length - 1);
      allowed.add(line);
      allowed.add(line + 1);
    }
  }

  const prose = source
    .replace(/^---\n[\s\S]*?\n---/, blank)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, blank)
    .replace(/^(?:import|export)\s[^\n]*/gm, blank)
    .replace(/```[\s\S]*?```/g, blank)
    .replace(/`[^`\n]*`/g, blank)
    .replace(/<\/?[A-Za-z][^<>]*>/g, blank);

  const violations = [];
  prose.split("\n").forEach((text, i) => {
    const line = i + 1;
    if (/\d/.test(text) && !allowed.has(line)) {
      violations.push({ line, text: text.trim() });
    }
  });
  return violations;
}

if (!fs.existsSync(ARTICLES_DIR)) {
  console.log("[lint-mdx-numerals] no content/articles directory; nothing to lint");
  process.exit(0);
}

const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx"));
let failed = false;

for (const file of files) {
  const violations = lintFile(path.join(ARTICLES_DIR, file));
  for (const v of violations) {
    failed = true;
    console.error(
      `content/articles/${file}:${v.line} bare numeral in prose: "${v.text}"\n` +
        `  Numbers render through <Figure factId="..." /> from a record, never typed into copy.`
    );
  }
}

if (failed) {
  process.exit(1);
}
console.log(`[lint-mdx-numerals] ${files.length} article(s) clean: no bare numerals in prose`);
