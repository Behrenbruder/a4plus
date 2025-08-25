'use client'

import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCRMPage = pathname?.startsWith('/crm');

  return (
    <html lang="de">
      <body className={`text-gray-900 antialiased ${isCRMPage ? 'bg-gray-50 overflow-hidden' : 'bg-white'}`}>
        {!isCRMPage && <Header />}
        <main className={isCRMPage ? 'h-screen' : ''}>{children}</main>
        {!isCRMPage && <Footer />}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
