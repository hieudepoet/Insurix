import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { PhoneFrame } from "@/components/PhoneFrame";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Insurix — Attestation Passport",
  description:
    "PoC: instant parametric insurance payouts, trust made visible as a stamped attestation passport.",
};

export const viewport: Viewport = {
  themeColor: "#0f0a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${plexMono.variable}`}>
      <body>
        <PhoneFrame>{children}</PhoneFrame>
      </body>
    </html>
  );
}
