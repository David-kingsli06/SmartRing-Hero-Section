import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aura Ring — Precision Health on Your Finger",
  description: "Track every night. Recover every day. Sleep, heart rate, and recovery in one titanium ring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} bg-[#0A0A0B] text-[#F2F0EB] antialiased`}
    >
      <body className="min-h-full bg-[#0A0A0B] text-[#F2F0EB] font-sans">{children}</body>
    </html>
  );
}
