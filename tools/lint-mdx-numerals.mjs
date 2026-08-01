// Why this exists.
//
// Body copy is a view onto the fact store, not a place where numbers get typed
// in. Every number renders through <Figure /> from a record that carries its own
// sources and its own confidence. A bare digit sitting in prose is an unmarked
// claim, and an unmarked figure reads as asserted. There is no neutral state:
// the reader has no way to tell a checked number from a remembered one except
// by the mark, so a number without a mark is the publication quietly breaking
// its only promise.
//
// This script strips everything that legitimately contains digits and fails on
// any digit left standing in prose.
//
// Stripped: YAML frontmatter, MDX comments, import and export lines, fenced and
// inline code, and JSX tags including their attributes. That last one matters
// because fact ids, dates, and revision numbers all live in attributes and are
// not prose.
//
// Escape hatch: a line is exempt if it, or the line directly above it, carries
// an MDX comment containing "numerals-ok". That is for digits that are
// typography rather than claims. The comment must say why.
//
// WHAT IT CANNOT DO, stated plainly, because a guard that is trusted past its
// range is worse than no guard:
//
//   1. It cannot catch spelled-out numbers. "Twenty billion dollars" is every
//      bit as much a claim as "$20B" and this script sees only letters.
//   2. It cannot catch a <Figure /> pointing at the wrong record. That is a
//      provenance error, not a typing error, and it looks identical to a
//      correct one from here.
//   3. It waves through anything marked numerals-ok, including a mistake, and
//      it cannot read the reason given.
//
// It is a tripwire, not a verifier. It catches the habit of typing a number
// into a sentence. It does not establish that any number on the site is true.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** Replace a matched region with spaces, keeping newlines, so that line and
 *  column numbers in the masked text still match the original file. */
function blank(match) {
  return match.replace(/[^\n]/g, " ");
}

function mask(text, pattern) {
  return text.replace(pattern, blank);
}

const STRIPPERS = [
  // YAML frontmatter, only at the very top of the file.
  { label: "frontmatter", pattern: /^---\r?\n[\s\S]*?\r?\n---/ },
  // Fenced code, before anything else that might live inside it.
  { label: "fenced code", pattern: /^```[\s\S]*?^```/gm },
  // MDX comments. Multiline, and already read for numerals-ok by this point.
  { label: "mdx comment", pattern: /\{\s*\/\*[\s\S]*?\*\/\s*\}/g },
  // Inline code.
  { label: "inline code", pattern: /`[^`\n]*`/g },
  // Import and export lines.
  { label: "import or export", pattern: /^[ \t]*(?:import|export)\b.*$/gm },
  // JSX tags with their attributes, which may span lines. Fact ids, dates, and
  // rev numbers live in attributes and are not prose.
  { label: "jsx tag", pattern: /<[^<>]*>/g },
];

/** Lines exempted by a numerals-ok comment on themselves or directly above. */
function exemptLines(lines) {
  const exempt = new Set();
  lines.forEach((line, index) => {
    if (/\{\s*\/\*[\s\S]*?numerals-ok[\s\S]*?\*\/\s*\}/.test(line)) {
      exempt.add(index);
      exempt.add(index + 1);
    }
  });
  return exempt;
}

export function findViolations(text) {
  const originalLines = text.split(/\r?\n/);
  const exempt = exemptLines(originalLines);

  let masked = text;
  for (const { pattern } of STRIPPERS) {
    masked = mask(masked, pattern);
  }

  const violations = [];
  masked.split(/\r?\n/).forEach((line, index) => {
    if (exempt.has(index)) return;
    const digit = line.match(/\d/);
    if (!digit) return;
    violations.push({
      line: index + 1,
      column: line.indexOf(digit[0]) + 1,
      text: originalLines[index].trim(),
    });
  });

  return violations;
}

export function lintDirectory(dir) {
  const failures = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
    const path = join(dir, file);
    // Reported relative to the project root and with forward slashes, so the
    // location is clickable in a terminal on any platform.
    const shown = relative(process.cwd(), path).split("\\").join("/");
    for (const violation of findViolations(readFileSync(path, "utf8"))) {
      failures.push({ file: shown, ...violation });
    }
  }
  return failures;
}

// Run only when invoked directly, so the functions above stay testable.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = join(process.cwd(), "content", "articles");
  const failures = lintDirectory(dir);

  if (failures.length > 0) {
    console.error(
      `\nBare numerals in article prose (${failures.length}):\n`,
    );
    for (const f of failures) {
      console.error(`  ${f.file}:${f.line}:${f.column}`);
      console.error(`    ${f.text}`);
    }
    console.error(
      "\nEvery number renders through <Figure /> from a record in the fact",
    );
    console.error(
      "store. If a digit here is typography rather than a claim, mark the line",
    );
    console.error("with an MDX comment containing numerals-ok and say why.\n");
    process.exit(1);
  }

  console.log(`Numeral lint clean across ${readdirSync(dir).length} files.`);
}
