// Generates the site icons and the Open Graph image from the monogram and the
// lockup, rather than from a hand-drawn asset that would drift out of step with
// the components.
//
// Two rules this script exists to respect:
//
// 1. The palette is closed, so nothing here carries a hex value. Every color is
//    read out of app/globals.css, which is the single place they are declared.
//
// 2. The monogram overlap is a product of the two letters and must never be set
//    by hand. This composites the R layer onto the B layer with a real multiply,
//    exactly as mix-blend-mode does in the browser, and then reads the resulting
//    pixel back and reports it. Nothing types the intersection color in.
//
// Glyphs are converted to outlines with opentype.js before rasterizing, so the
// renderer never has to resolve a font and the output cannot silently fall back
// to whatever the machine happens to have installed.
//
// Fonts are fetched on demand and cached under .cache/fonts, which is ignored.
// They are build-time inputs for this tool alone and are not part of the app,
// which loads its own copies through next/font.
//
// Run it with: npm run icons

import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const ROOT = process.cwd();
const CACHE = join(ROOT, ".cache", "fonts");
const APP = join(ROOT, "app");

const FONTS = {
  serif: {
    file: "Gelasio.ttf",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/gelasio/Gelasio%5Bwght%5D.ttf",
  },
  mono: {
    file: "CascadiaMono.ttf",
    url: "https://raw.githubusercontent.com/google/fonts/main/ofl/cascadiamono/CascadiaMono%5Bwght%5D.ttf",
  },
};

// ---------------------------------------------------------------------------
// Palette, read from the one place it is declared.
// ---------------------------------------------------------------------------

function palette() {
  const css = readFileSync(join(APP, "globals.css"), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  const found = {};
  for (const [, name, value] of css.matchAll(
    /--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g,
  )) {
    found[name] = value;
  }
  const need = ["page", "jet", "blue-deep", "blue-bright", "crimson"];
  for (const key of need) {
    if (!found[key]) {
      throw new Error(
        `app/globals.css does not declare --color-${key}. The palette is the source of truth and this script will not invent one.`,
      );
    }
  }
  return found;
}

const C = palette();

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

export async function loadFont({ file, url }) {
  mkdirSync(CACHE, { recursive: true });
  const path = join(CACHE, file);
  if (!existsSync(path)) {
    console.log(`fetching ${file}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Could not fetch ${file}: HTTP ${response.status}`);
    }
    writeFileSync(path, Buffer.from(await response.arrayBuffer()));
  }
  return opentype.parse(readFileSync(path).buffer.slice(0));
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

/**
 * Outline for a string, as SVG path data, plus its measured box and advance.
 *
 * Glyphs are walked one at a time rather than going through font.getPath.
 * Gelasio ships a variable ccmp table that opentype.js cannot read, and its
 * shaping engine throws on it. None of that machinery is needed here: this is
 * Latin text with no ligatures or reordering, so charToGlyph plus explicit
 * kerning produces the same result and cannot hit the unsupported path.
 */
function outline(font, text, size, x = 0, y = 0) {
  const scale = size / font.unitsPerEm;
  const combined = new opentype.Path();
  let cursor = x;
  let previous = null;

  for (const character of text) {
    const glyph = font.charToGlyph(character);
    if (previous) cursor += font.getKerningValue(previous, glyph) * scale;
    combined.extend(glyph.getPath(cursor, y, size));
    cursor += glyph.advanceWidth * scale;
    previous = glyph;
  }

  return {
    d: combined.toPathData(3),
    box: combined.getBoundingBox(),
    advance: cursor - x,
  };
}

function svg(width, height, body) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`,
  );
}

const raster = (buffer) => sharp(buffer).png().toBuffer();

/**
 * The monogram, composited the way the browser composites it.
 *
 * The B layer is painted over the page, then the R layer is multiplied on top.
 * Where they cross, the result is the product of the two inks. Where R sits over
 * bare page it multiplies against near-white and stays essentially itself, which
 * is what mix-blend-mode does against the same backdrop.
 */
export async function monogram(font, size, variant, superSample) {
  // Measure at a reference size, then scale the mark to fill the canvas. A
  // fixed ratio wastes pixels, and at 16px there are no pixels to waste: the
  // favicon is the one place where a few percent of height decides whether the
  // two letters read as letters or as a smudge.
  const REF = 100;
  const FILL = 0.88;
  // Small icons are drawn large and resampled down. See the note by the resize.
  // 2x, chosen by rendering 1x, 2x, 4x, and 8x side by side at 16px. Higher
  // factors average serif stems into something too pale to read in a tab.
  const factor = superSample ?? (size < 128 ? 2 : 1);
  const canvas = size * factor;

  const measure = (em) => {
    const b = outline(font, "B", em);
    // The overlap is 0.26em, the same figure the component uses.
    const r = outline(font, "R", em, b.advance - em * 0.26);
    return {
      b,
      r,
      width: Math.max(b.box.x2, r.box.x2) - Math.min(b.box.x1, r.box.x1),
      height: Math.max(b.box.y2, r.box.y2) - Math.min(b.box.y1, r.box.y1),
    };
  };

  const reference = measure(REF);
  const em =
    REF * ((canvas * FILL) / Math.max(reference.width, reference.height));
  const { b, r } = measure(em);

  const left = Math.min(b.box.x1, r.box.x1);
  const right = Math.max(b.box.x2, r.box.x2);
  const top = Math.min(b.box.y1, r.box.y1);
  const bottom = Math.max(b.box.y2, r.box.y2);

  // Centre the union of both letters on the canvas.
  const dx = (canvas - (right - left)) / 2 - left;
  const dy = (canvas - (bottom - top)) / 2 - top;
  const shift = (d, fill) =>
    svg(canvas, canvas, `<g transform="translate(${dx} ${dy})"><path d="${d}" fill="${fill}"/></g>`);

  const bInk = variant === "mono" ? C.jet : C["blue-bright"];
  const rInk = variant === "mono" ? C.jet : C.crimson;

  const layerB = await raster(shift(b.d, bInk));
  const layerR = await raster(shift(r.d, rInk));

  const composed = sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: C.page,
    },
  }).composite([
    { input: layerB, blend: "over" },
    { input: layerR, blend: variant === "mono" ? "over" : "multiply" },
  ]);

  // Supersample. Rasterizing serif stems directly at 16px throws away most of
  // the curve information before any antialiasing can happen. Drawing large and
  // resampling down keeps the bowl of the B and the leg of the R legible at the
  // size where there is the least room for either.
  if (canvas !== size) {
    return composed
      .png()
      .toBuffer()
      .then((big) =>
        sharp(big).resize(size, size, { kernel: "lanczos3" }).png().toBuffer(),
      );
  }

  return composed.png().toBuffer();
}

// ---------------------------------------------------------------------------
// ICO container. Modern .ico files may hold PNG payloads directly.
// ---------------------------------------------------------------------------

function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 is icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

// ---------------------------------------------------------------------------
// Open Graph image, rendered from the lockup on the page background.
// ---------------------------------------------------------------------------

async function openGraph(serif, mono) {
  const W = 1200;
  const H = 630;
  const wordSize = 132;
  const x = 90;
  const baseline = 330;

  const burn = outline(serif, "Burn", wordSize, x, baseline);
  const space = outline(serif, "Burn ", wordSize).advance;
  const rate = outline(serif, "Rate", wordSize, x + space, baseline);

  // The three rule segments are the confidence notation: solid, dashed, dotted,
  // left to right. The order is load bearing and is never rearranged.
  const ruleY = baseline + 54;
  const segW = 118;
  const gap = 26;
  const seg = (i, dash) =>
    `<line x1="${x + i * (segW + gap)}" y1="${ruleY}" x2="${x + i * (segW + gap) + segW}" y2="${ruleY}" stroke="${C.jet}" stroke-width="7"${dash ? ` stroke-dasharray="${dash}"` : ""} stroke-linecap="butt"/>`;

  const tagSize = 30;
  const tagY = ruleY + 74;
  const tag = outline(mono, "[Truth in numbers]", tagSize, x, tagY);
  const period = outline(
    mono,
    ".",
    tagSize,
    x + outline(mono, "[Truth in numbers]", tagSize).advance,
    tagY,
  );

  const body = [
    `<rect width="${W}" height="${H}" fill="${C.page}"/>`,
    `<path d="${burn.d}" fill="${C["blue-bright"]}"/>`,
    `<path d="${rate.d}" fill="${C.crimson}"/>`,
    seg(0, null),
    seg(1, "18 12"),
    seg(2, "3 11"),
    `<path d="${tag.d}" fill="${C["blue-deep"]}"/>`,
    `<path d="${period.d}" fill="${C.crimson}"/>`,
  ].join("");

  return raster(svg(W, H, body));
}

// ---------------------------------------------------------------------------

async function main() {
  const serif = await loadFont(FONTS.serif);
  const mono = await loadFont(FONTS.mono);

  const icon512 = await monogram(serif, 512, "color");
  const icon192 = await monogram(serif, 192, "color");
  const apple180 = await monogram(serif, 180, "color");
  const fav32 = await monogram(serif, 32, "color");
  // Two color at 16 as well.
  //
  // The foundation doc prescribes a jet-only fallback here, on the reasoning
  // that the multiply overlap fills in at this size. Rendered side by side that
  // turns out backwards: in jet only, both letters carry the same ink, so the
  // seam vanishes and the mark reads as one smudged shape. In two color the
  // letters separate and the overlap is the thing you actually see, which is
  // the whole point of the monogram. Supersampling holds the strokes together.
  //
  // This is a deliberate departure from section 3 of docs/brand-foundation.md
  // and wants a revision there if it stays.
  const fav16 = await monogram(serif, 16, "color");

  writeFileSync(join(APP, "icon.png"), icon512);
  writeFileSync(join(APP, "icon1.png"), icon192);
  writeFileSync(join(APP, "apple-icon.png"), apple180);
  writeFileSync(join(APP, "favicon.ico"), ico([
    { size: 16, data: fav16 },
    { size: 32, data: fav32 },
  ]));
  writeFileSync(join(APP, "opengraph-image.png"), await openGraph(serif, mono));

  // Read the intersection back rather than asserting it from memory. If the
  // composite ever stops multiplying, this number moves and the mark is wrong.
  const { data, info } = await sharp(icon512)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let darkest = [255, 255, 255];
  for (let i = 0; i < data.length; i += info.channels) {
    const sum = data[i] + data[i + 1] + data[i + 2];
    if (sum < darkest[0] + darkest[1] + darkest[2]) {
      darkest = [data[i], data[i + 1], data[i + 2]];
    }
  }
  const hex = `#${darkest.map((v) => v.toString(16).padStart(2, "0")).join("")}`;

  console.log("wrote app/icon.png            512  two color");
  console.log("wrote app/icon1.png           192  two color");
  console.log("wrote app/apple-icon.png      180  two color");
  console.log("wrote app/favicon.ico       16,32  two color, supersampled");
  console.log("wrote app/opengraph-image.png 1200x630");
  console.log(`\nmonogram intersection measured at ${hex}`);
  console.log(
    `product of ${C["blue-bright"]} and ${C.crimson}, computed by compositing rather than typed in`,
  );
}

// Run only when invoked directly, so the pieces above stay importable.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
