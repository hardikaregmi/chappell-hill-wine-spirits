import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import TawkTo from "../components/TawkTo";
import { BRANDING, FACEBOOK_URL, STORE } from "../lib/storeConfig";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${STORE.name} | Petal, MS`,
  description: `${STORE.tagline}. Browse our selection and visit us on Chappell Hill Road in Petal, Mississippi.`,
  openGraph: {
    title: STORE.name,
    description: STORE.tagline,
    url: FACEBOOK_URL,
    images: [{ url: BRANDING.heroBanner, width: 1400, height: 560 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} min-h-screen antialiased`}
      >
        {children}
        <TawkTo />
      </body>
    </html>
  );
}
