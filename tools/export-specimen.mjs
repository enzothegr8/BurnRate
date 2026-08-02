// Regenerates docs/brand/specimen/ from the live /specimen route.
//
// This export is a snapshot of a live route, which makes it the one artifact
// in the section 7 table of docs/brand-foundation.md that can go stale
// without anybody editing it. A snapshot nobody can cheaply regenerate will
// not be regenerated, and the re-sync rule in section 7 is only followable
// if this command exists. Run it after any BR-FOUND revision touching color,
// type, space, the notation, the logo, layout, or motion.
//
// Run with: npm run export:specimen

import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT_DIR = join(ROOT, "docs", "brand", "specimen");
const NEXT_BIN = join(ROOT, "node_modules", "next", "dist", "bin", "next");
const PORT = 4471;
const ORIGIN = `http://127.0.0.1:${PORT}`;

// Per docs/brand-foundation.md section 3: serif is 400 at every size; sans
// carries 400 and 600; mono carries 400, with 600 reserved for labels and
// tags. Static single-weight faces outside this set are dropped.
const NEEDED_WEIGHTS = {
  Gelasio: [400],
  "Cascadia Mono": [400, 600],
  selawik: [400, 600],
};

function readFoundationRev() {
  const doc = readFileSync(join(ROOT, "docs", "brand-foundation.md"), "utf8");
  const line3 = doc.split("\n")[2] ?? "";
  const match = line3.match(/\*\*Rev\*\*\s*(\d+)/);
  if (!match) {
    throw new Error(
      `Could not read a Rev number from docs/brand-foundation.md line 3: "${line3}"`,
    );
  }
  return match[1];
}

function runSync(args) {
  const result = spawnSync(process.execPath, [NEXT_BIN, ...args], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`next ${args.join(" ")} exited ${result.status}`);
  }
}

function killServer(child) {
  if (!child || child.killed || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
  } else {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
  }
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server did not come up at ${url} within ${timeoutMs}ms`);
}

// Filters @font-face blocks in a stylesheet down to NEEDED_WEIGHTS, downloads
// the font files the surviving blocks reference, rewrites their url()s to a
// local relative path, and reports what it dropped.
async function localizeStylesheet(cssText, cssUrl, fontsDir) {
  mkdirSync(fontsDir, { recursive: true });
  const dropped = [];
  const kept = [];

  const filtered = cssText.replace(/@font-face\{[^}]*\}/g, (block) => {
    const familyMatch = block.match(/font-family:([^;]+);/);
    const family = familyMatch ? familyMatch[1].replace(/["']/g, "").trim() : null;
    const weightMatch = block.match(/font-weight:([^;]+);/);
    const needed = family ? NEEDED_WEIGHTS[family] : undefined;

    if (!needed) return block; // unrecognized family: keep, untouched

    const hasUrl = /url\(/.test(block);
    if (!hasUrl) return block; // local()-only fallback face: always keep

    if (weightMatch) {
      const parts = weightMatch[1].trim().split(/\s+/).map(Number);
      const [lo, hi] = parts.length === 2 ? parts : [parts[0], parts[0]];
      const isVariableRange = hi > lo;
      const covers = needed.some((w) => w >= lo && w <= hi);
      if (isVariableRange) {
        // A single variable file covers a weight range; nothing to slice.
        if (covers) {
          kept.push(`${family} ${lo}-${hi} (variable, covers ${needed.join("/")})`);
          return block;
        }
      } else if (needed.includes(lo)) {
        kept.push(`${family} ${lo}`);
        return block;
      } else {
        dropped.push(`${family} ${lo}`);
        return "";
      }
    }
    return block;
  });

  // Download every font file the surviving CSS still references.
  const urls = [...filtered.matchAll(/url\((\.\.\/media\/[^)]+)\)/g)].map((m) => m[1]);
  let rewritten = filtered;
  for (const rel of new Set(urls)) {
    const fileName = rel.split("/").pop();
    const assetUrl = new URL(rel, cssUrl).toString();
    const res = await fetch(assetUrl);
    if (!res.ok) throw new Error(`Failed to fetch font asset ${assetUrl}: ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    writeFileSync(join(fontsDir, fileName), bytes);
    rewritten = rewritten.split(rel).join(`fonts/${fileName}`);
  }

  return { css: rewritten, dropped, kept };
}

async function localizeIcons(page, iconsDir) {
  mkdirSync(iconsDir, { recursive: true });
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]')].map(
      (el) => el.getAttribute("href"),
    ),
  );
  const saved = [];
  for (const href of hrefs) {
    if (!href) continue;
    const fileName = href.split("?")[0].split("/").pop();
    const assetUrl = new URL(href, ORIGIN).toString();
    const res = await fetch(assetUrl);
    if (!res.ok) throw new Error(`Failed to fetch icon ${assetUrl}: ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    writeFileSync(join(iconsDir, fileName), bytes);
    saved.push(fileName);
  }
  await page.evaluate(() => {
    document
      .querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]')
      .forEach((el) => {
        const file = el.getAttribute("href").split("?")[0].split("/").pop();
        el.setAttribute("href", `icons/${file}`);
      });
  });
  return saved;
}

async function main() {
  const rev = readFoundationRev();

  console.log("Building...");
  runSync(["build"]);

  console.log(`Starting server on port ${PORT}...`);
  const server = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
    detached: process.platform !== "win32",
  });

  let browser;
  try {
    await waitForServer(`${ORIGIN}/specimen`);

    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${ORIGIN}/specimen`, { waitUntil: "networkidle0" });

    // Hydration replaces every "…" placeholder (ColorSwatch, TypeSpecimenRow)
    // with a value read back from computed style. Only true once every
    // client component has mounted and its effect has run.
    await page.waitForFunction(() => !document.body.textContent.includes("…"), {
      timeout: 30000,
    });

    rmSync(OUT_DIR, { recursive: true, force: true });
    mkdirSync(OUT_DIR, { recursive: true });

    // Localize the stylesheet and its fonts before touching the DOM further,
    // using the still-original hrefs.
    const cssHref = await page.evaluate(
      () => document.querySelector('link[rel="stylesheet"]')?.getAttribute("href"),
    );
    if (!cssHref) throw new Error("No <link rel=\"stylesheet\"> found on /specimen");
    const cssUrl = new URL(cssHref, ORIGIN).toString();
    const cssRes = await fetch(cssUrl);
    if (!cssRes.ok) throw new Error(`Failed to fetch stylesheet ${cssUrl}: ${cssRes.status}`);
    const { css, dropped, kept } = await localizeStylesheet(
      await cssRes.text(),
      cssUrl,
      join(OUT_DIR, "fonts"),
    );
    writeFileSync(join(OUT_DIR, "specimen.css"), css);

    const savedIcons = await localizeIcons(page, join(OUT_DIR, "icons"));

    // Strip scripts and preloads, and repoint the stylesheet link, all inside
    // the page: nothing needs to hydrate in a static snapshot, and preload
    // hints for hashed build paths that no longer exist would just 404.
    await page.evaluate(() => {
      document.querySelectorAll("script").forEach((el) => el.remove());
      document.querySelectorAll('link[rel="preload"]').forEach((el) => el.remove());
      const sheet = document.querySelector('link[rel="stylesheet"]');
      if (sheet) sheet.setAttribute("href", "specimen.css");
    });

    const html = await page.evaluate(() => document.documentElement.outerHTML);
    const banner = `<!-- Burn Rate specimen · generated by npm run export:specimen · derived from BR-FOUND Rev ${rev} -->\n`;
    writeFileSync(join(OUT_DIR, "index.html"), banner + "<!doctype html>\n" + html + "\n");

    console.log(`\nFont faces kept: ${kept.join(", ") || "(none)"}`);
    console.log(`Font faces dropped: ${dropped.join(", ") || "(none)"}`);
    console.log(`Icons localized: ${savedIcons.join(", ")}`);
    console.log(`\nExported docs/brand/specimen/ from BR-FOUND Rev ${rev}.`);
  } finally {
    if (browser) await browser.close();
    killServer(server);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
