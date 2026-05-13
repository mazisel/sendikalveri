import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://sendikalveri.com"),
  title: {
    default: "Sendikal Veri | Sendika Veri Platformu",
    template: "%s | Sendikal Veri",
  },
  description: "Türkiye'deki işçi ve kamu sendikaları, konfederasyonlar ve iş kolları hakkında en güncel üye sayıları ve istatistiklerin yer aldığı veri analiz platformu.",
  keywords: ["sendika", "sendikalar", "işçi sendikaları", "kamu sendikaları", "sendika üye sayısı", "iş kolları", "konfederasyon", "çalışma bakanlığı verileri"],
  authors: [{ name: "Sendikal Veri" }],
  creator: "Sendikal Veri",
  publisher: "Sendikal Veri",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Sendikal Veri | Sendika Veri Platformu",
    description: "Türkiye sendikalar, iş kolları ve konfederasyon güncel veri analiz platformu.",
    url: "https://sendikalveri.com",
    siteName: "Sendikal Veri",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sendikal Veri | Sendika Veri Platformu",
    description: "Türkiye sendikalar, iş kolları ve konfederasyon güncel veri analiz platformu.",
  },
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
