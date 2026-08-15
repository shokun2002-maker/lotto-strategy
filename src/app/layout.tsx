import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EntitlementProvider } from "@/components/subscription/EntitlementContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LOTTO STRATEGY | 스마트 로또 번호 조합 & 개인화 전략",
  description: "데이터 분석과 맞춤 전략으로 만드는 나만의 로또 번호 스마트 조합 서비스",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-slate-50 antialiased font-sans">
        <EntitlementProvider>{children}</EntitlementProvider>
      </body>
    </html>
  );
}
