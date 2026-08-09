import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Newsreader } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/site/Analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Marketing display face. Inter and Inter Tight stay for the dashboard, where a
 * serif would hurt density and legibility at small sizes.
 */
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display-serif",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lintel Squared, tax, compliance & rent for UK landlords",
    template: "%s · Lintel Squared",
  },
  description:
    "Lintel keeps tax records, compliance, rent and documents in one place for UK landlords, with the right rules for England, Scotland, Wales and Northern Ireland.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Lintel Squared" },
  alternates: { canonical: "/" },
  icons: { apple: "/apple-touch-icon.png" },
  keywords: ["landlord software", "property management", "rental compliance", "Making Tax Digital", "tenant portal", "rent tracking", "court-ready evidence", "UK landlords", "Renters Rights Act"],
  openGraph: {
    type: "website",
    siteName: "Lintel Squared",
    title: "Lintel Squared, tax, compliance & rent for UK landlords",
    description: "Tax records, compliance, rent and documents in one place for UK landlords. Free until 31 August 2026.",
    locale: "en_GB",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://lintelsquared.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lintel Squared, UK landlord software",
    description: "Tax records, compliance, rent and documents in one place for UK landlords. Free until 31 August 2026.",
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
    <html lang="en-GB" className={`${inter.variable} ${interTight.variable} ${newsreader.variable}`}>
      <body className="font-sans antialiased">{children}<CookieConsent /><Analytics /></body>
    </html>
  );
}
