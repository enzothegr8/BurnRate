// The three type roles from docs/brand-foundation.md section 3.
//
// Serif  Gelasio        headlines, display, standfirsts
// Sans   Selawik        running copy, navigation, UI
// Mono   Cascadia Mono  every figure, unit, label, tag, timestamp, source line
//
// All three are pinned open-licensed webfonts so the type survives leaving
// Enzo's machine. Loaded through next/font, never a CSS @import, so they are
// self hosted and no request reaches Google when a reader visits.
//
// Gelasio and Cascadia Mono are variable fonts, so weight is omitted here and
// the whole axis is available. Cascadia Mono is Microsoft's ligature free cut;
// the Cascadia Code fallback in the build brief did not trigger, which matters
// because a publication about numbers must never render a programming ligature.
//
// Selawik is not on Google Fonts. The woff2 files sit next to this file, taken
// from the 1.01 OFL release at github.com/microsoft/Selawik, with LICENSE.txt
// alongside them as that license requires.

import { Cascadia_Mono, Gelasio } from "next/font/google";
import localFont from "next/font/local";

export const serif = Gelasio({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  // Gelasio is metric compatible with Georgia, so the fallback swaps cleanly.
  fallback: ["Georgia", "ui-serif", "serif"],
});

export const mono = Cascadia_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  // Next has no metric override data for Cascadia Mono and says so at build
  // time, which means it cannot synthesize a size-adjusted fallback. Naming
  // real families here is the available mitigation.
  fallback: ["Consolas", "ui-monospace", "monospace"],
});

// Named for the family, not the role. next/font/local derives the generated
// CSS family name from this binding, and an export called "sans" produces a
// font-family literally named `sans`, one character from the `sans-serif`
// generic keyword. The role still travels as the --font-sans variable below.
export const selawik = localFont({
  src: [
    { path: "./selawkl.woff2", weight: "300", style: "normal" },
    { path: "./selawksl.woff2", weight: "350", style: "normal" },
    { path: "./selawk.woff2", weight: "400", style: "normal" },
    { path: "./selawksb.woff2", weight: "600", style: "normal" },
    { path: "./selawkb.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-sans",
  // Selawik is Microsoft's metric compatible Segoe UI replacement.
  fallback: ["Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
});

export const fontVariables = `${serif.variable} ${selawik.variable} ${mono.variable}`;
