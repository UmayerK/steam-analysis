import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Steam Sentiment Analyzer",
  description: "Analyze Steam game reviews with AI-powered sentiment analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
