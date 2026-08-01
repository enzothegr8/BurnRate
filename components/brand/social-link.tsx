// Hand-built inline SVG. No icon library: this is a bespoke editorial design and
// pulling in a whole icon package for one glyph would be the first crack in that.
//
// The glyph inherits currentColor rather than carrying a color of its own, so it
// sits at the muted weight of the metadata line it lives in and darkens to jet on
// hover. Deliberately not blue bright: that is the link color, but the palette
// spec restricts it to twelve pixels and above, and this mark is smaller than
// that.
//
// Links are never underlined here, which is the house rule, so the hover is a
// change of ink instead.

const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z";

export function LinkedInLink({
  href,
  label,
  size = 13,
}: {
  href: string;
  label: string;
  size?: number;
}) {
  return (
    <a
      className="social-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        focusable="false"
      >
        <path d={LINKEDIN_PATH} />
      </svg>
    </a>
  );
}
