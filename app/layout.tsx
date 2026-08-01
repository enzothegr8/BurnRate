import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Masthead } from "@/components/layout/masthead";
import { PlaceholderBar } from "@/components/layout/placeholder-bar";
import { fontVariables } from "./fonts";
import "./globals.css";

// Full metadata, Open Graph, and icons arrive with the deployment pass. This is
// the minimum a root layout needs to be honest about what the page is.
export const metadata: Metadata = {
  title: {
    default: "Burn Rate",
    template: "%s · Burn Rate",
  },
  description:
    "The intersection of Space, AI, Robotics, and Energy, through the lens of science, economics, and politics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <PlaceholderBar />
        <div className="shell">
          <Masthead />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
