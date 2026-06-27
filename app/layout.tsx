import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lintel — tax, compliance & rent for landlords worldwide",
  description:
    "Lintel keeps tax records, compliance, rent and documents in one place — tuned to your country's rules across the UK, US, Europe, the Gulf, Asia and beyond.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Lintel" },
  icons: { apple: "/apple-touch-icon.png" },
  keywords: ["landlord software", "property management", "rental compliance", "Making Tax Digital", "tenant portal", "rent tracking", "court-ready evidence", "international landlords"],
  openGraph: {
    type: "website",
    siteName: "Lintel",
    title: "Lintel — tax, compliance & rent for landlords worldwide",
    description: "Tax records, compliance, rent and documents in one place, tuned to your country's rules. Free for 30 days.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://lintelsquared.com",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Lintel" }],
  },
  twitter: {
    card: "summary",
    title: "Lintel — landlord software, worldwide",
    description: "Tax records, compliance, rent and documents in one place. Free for 30 days.",
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#16233A",
};

import { CookieConsent } from "@/components/site/CookieConsent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${interTight.variable}`}>
      <body className="font-sans antialiased">{children}<CookieConsent /></body>
    </html>
  );
}
