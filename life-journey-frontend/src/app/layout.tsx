import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import "./globals.css";

// Existing Geist fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Google Fonts for the warm memory theme
import { Source_Serif_4 } from 'next/font/google';
import { Inter } from 'next/font/google';

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  weight: ['400', '500', '600'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://life-journey.app"),
  title: {
    template: "%s | Life Journey",
    default: "Life Journey – Bewaar je verhaal",
  },
  description:
    "Leg je levensverhaal stap voor stap vast met een empathische AI-interviewer en deel het veilig met je dierbaren.",
  keywords: [
    "levensverhaal",
    "memoires",
    "familie geschiedenis",
    "AI interviewer",
    "herinneringen bewaren",
    "digitale erfenis",
    "legacy",
    "persoonlijke verhalen",
  ],
  authors: [{ name: "Life Journey" }],
  creator: "Life Journey",
  publisher: "Life Journey",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://life-journey.app",
    title: "Life Journey – Bewaar je verhaal",
    description:
      "Leg je levensverhaal stap voor stap vast met een empathische AI-interviewer en deel het veilig met je dierbaren.",
    siteName: "Life Journey",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Life Journey - Bewaar je levensverhaal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Life Journey – Bewaar je verhaal",
    description:
      "Leg je levensverhaal stap voor stap vast met een empathische AI-interviewer en deel het veilig met je dierbaren.",
    images: ["/og-image.jpg"],
    creator: "@lifejourney",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Life Journey",
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#faf7f2" }, { media: "(prefers-color-scheme: dark)", color: "#121212" }],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          sourceSerif.variable,
          inter.variable,
          geistSans.variable,
          geistMono.variable,
        )}
      >
        {/* Skip links for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-teal focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          Ga naar hoofdinhoud
        </a>
        <a
          href="#main-navigation"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-48 focus:px-4 focus:py-2 focus:bg-teal focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          Ga naar navigatie
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}