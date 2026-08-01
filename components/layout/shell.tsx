"use client";

import { usePathname } from "next/navigation";

// Rev 14: article routes bound at the narrower breakout width; every other
// route bounds at the page width. .shell is rendered once, here, in the
// root layout, wrapping the masthead and footer along with the page content
// on every route, so a nested route's own layout has no ancestor element to
// modify: this has to decide at the one place .shell exists. Reads the path
// the same way Masthead already derives its active item, rather than
// introducing a second mechanism for the same kind of decision.
function isArticlePage(pathname: string): boolean {
  return /^\/articles\/[^/]+$/.test(pathname);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={isArticlePage(pathname) ? "shell shell-article" : "shell"}>
      {children}
    </div>
  );
}
