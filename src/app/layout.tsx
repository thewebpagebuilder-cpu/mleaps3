import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Syne, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-syne",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Mleaps Consulting — Six Sigma Green Belt Certification Assessment",
  description:
    "An invitation-only, time-windowed Six Sigma Green Belt certification assessment by Mleaps Consulting, with institutional-grade proctoring and DMAIC analytics.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body
        style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
        className="grain bg-[#04070f] text-[#eef2fb] antialiased min-h-screen overflow-x-hidden selection:bg-[#d9b45b]/30 selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}
