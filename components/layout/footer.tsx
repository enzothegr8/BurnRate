import { LinkedInLink } from "@/components/brand/social-link";

export function Footer() {
  return (
    <footer className="site-footer">
      <p className="meta">
        Burn Rate · Enzo Carvalho{" "}
        <LinkedInLink
          href="https://www.linkedin.com/in/enzocvlho/"
          label="Enzo Carvalho on LinkedIn"
        />{" "}
        · burnrate.news
      </p>
      <p className="meta">Placeholder build · Draft 01 · 2026-07-31</p>
    </footer>
  );
}
