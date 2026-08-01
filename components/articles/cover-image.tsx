// The full-width breakout the article template's own comment anticipates: the
// measure stays centered at 64 characters for reading, and this is the variant
// that steps outside it without restructuring the page around it.
//
// A hairline border, same as every panel in this system. No shadow, no rounded
// corner standing in for one.
export function CoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="cover-image">
      {/* eslint-disable-next-line @next/next/no-img-element -- covers are
          hand-built SVG vector art, not photographs. next/image's raster
          pipeline (responsive srcset, format conversion) has nothing to do
          for a vector, and enabling dangerouslyAllowSVG in next.config to use
          it anyway would turn on SVG optimization sitewide for two decorative
          uses, which is a real XSS surface to open for no benefit here. */}
      <img src={src} alt={alt} />
    </div>
  );
}
