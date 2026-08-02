// What counts as prose in an MDX file, shared by every lint that has an
// opinion about prose.
//
// Two guards now read the same article files and both need the same answer to
// the same question: which characters here are something a reader will read,
// and which are machinery. A fact id, a fenced code sample, and a frontmatter
// date all contain characters that would be violations in a sentence and are
// not violations where they sit. If the two linters answered that question
// separately they would drift, and the one that drifted would either miss
// things or cry wolf. So the answer lives once, here.
//
// Masking rather than deleting: every stripped region is replaced by spaces of
// the same length, newlines kept, so line and column numbers in the masked
// text still point at the right place in the original file.

/** Replace a matched region with spaces, keeping newlines, so that line and
 *  column numbers in the masked text still match the original file. */
export function blank(match) {
  return match.replace(/[^\n]/g, " ");
}

export function mask(text, pattern) {
  return text.replace(pattern, blank);
}

export const STRIPPERS = [
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

/** Everything that is not prose, blanked out. */
export function maskNonProse(text) {
  let masked = text;
  for (const { pattern } of STRIPPERS) {
    masked = mask(masked, pattern);
  }
  return masked;
}
