import type { Metadata } from "next";
import { fontClasses } from './fonts';
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "KomaSnap — Your face. Four panels. Your story.",
  description: "A little drama. A strip worth keeping. A private, manga-inspired photobooth that turns your photos into something worth sharing. No sign-up, no uploads.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    title: "KomaSnap — Your face. Four panels. Your story.",
    description: "A manga-inspired photobooth. No sign-up. No uploads. Just you.",
    images: [{ url: "/social-preview.png", width: 1200, height: 630, alt: "KomaSnap original four-panel illustration" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={fontClasses}
    >
      <body>{children}</body>
    </html>
  );
}
