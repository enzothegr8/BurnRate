"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";

// Home, Articles, separator, the four domains in their fixed order, separator,
// Contact.
const NAV = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { sep: true },
  { href: "/space", label: "Space" },
  { href: "/ai", label: "AI" },
  { href: "/robotics", label: "Robotics" },
  { href: "/energy", label: "Energy" },
  { sep: true },
  { href: "/contact", label: "Contact" },
] as const;

export function Masthead() {
  const pathname = usePathname();

  // An article sits under Articles, so the section stays lit while reading one.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="mast">
      <Logo size="md" />
      <nav className="nav">
        {NAV.map((item, i) =>
          "sep" in item ? (
            <span key={`sep-${i}`} className="sep" />
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "on" : undefined}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
