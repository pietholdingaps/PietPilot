import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PietPilot — AI Marketing for Tradespeople",
  description:
    "Stop paying $1,000/month to marketing agencies. Get a professional website, Google Ads, and automated lead follow-up — all powered by AI for $149/month.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
