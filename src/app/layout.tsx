import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  title: "Sendikal Veri | Sendika Veri Platformu",
  description: "Türkiye sendikalar, iş kolları ve konfederasyon güncel veri analiz platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.className} antialiased`}>
      <body className="flex min-h-screen flex-col bg-[#09090b] text-zinc-100">
        <Header />
        <main className="ambient-bg relative flex-1">
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
