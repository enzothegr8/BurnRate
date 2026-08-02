// Why this exists.
//
// `docs/brand-foundation.md` section 3 prohibits the em dash: not in body copy,
// headlines, standfirsts, captions, source lines, or any generated text. The
// middle dot is the separator this publication uses, and it is the only
// horizontal punctuation mark it uses decoratively.
//
// The rule needs a tripwire because the em dash is the single most reliable
// tell that a machine wrote a sentence, and this repository is built by agents.
// A rule that only lives in a document gets followed until the moment nobody is
// reading the document.
//
// It strips exactly what the numeral lint strips, from the same module, and
// fails on any U+2014 left standing in prose.
//
// THERE IS NO ESCAPE HATCH, and that is the difference from the numeral lint.
// A bare digit in prose can legitimately be typography rather than a claim, so
// that lint has a numerals-ok comment. An em dash has no legitimate use here at
// all: every place one could go, a comma, a colon, a period, a middle dot, or a
// restructured sentence goes instead. A hatch would only ever be used to smuggle
// the thing back in.
//
// WHAT IT CANNOT DO, stated plainly, because a guard that is trusted past its
// range is worse than no guard:
//
//   1. It reads content/articles only. The prohibition covers every word this
//      publication publishes, including component copy, doc headers, and commit
//      messages, and none of those pass through here.
//   2. It sees U+2014 and nothing else. An en dash used as an em dash, or two
//      hyphens standing in for one, both read past it.
//   3. It cannot see an em dash inside a JSX attribute, because attributes are
//      stripped as machinery. A title or alt text passed as a prop is prose
//      wearing an attribute's clothes and this will wave it through.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { maskNonProse } from "./mdx-prose.mjs";

const EM_DASH = "\u2014";

export function findViolations(text) {
  const originalLines = text.split(/\r?\n/);
  const masked = maskNonProse(text);

  const violations = [];
  masked.split(/\r?\n/).forEach((line, index) => {
    let from = 0;
    for (;;) {
      const at = line.indexOf(EM_DASH, from);
      if (at === -1) break;
      violations.push({
        line: index + 1,
        column: at + 1,
        text: originalLines[index].trim(),
      });
      from = at + 1;
    }
  });

  return violations;
}

export function articleFiles(dir) {
  return readdirSync(dir).filter((f) => f.endsWith(".mdx"));
}

export function lintDirectory(dir) {
  const failures = [];
  for (const file of articleFiles(dir)) {
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
    console.error(`\nEm dashes in article prose (${failures.length}):\n`);
    for (const f of failures) {
      console.error(`  ${f.file}:${f.line}:${f.column}`);
      console.error(`    ${f.text}`);
    }
    console.error(
      "\nBR-FOUND section 3 prohibits the em dash. Use a comma, a colon, a",
    );
    console.error(
      "period, or a restructured sentence. The middle dot is the separator in",
    );
    console.error("metadata lines and doc headers. There is no escape hatch.\n");
    process.exit(1);
  }

  console.log(`Em dash lint clean across ${articleFiles(dir).length} files.`);
}
