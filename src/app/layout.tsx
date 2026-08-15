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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "로또전략 | LOTTO STRATEGY",
  description:
    "과거 로또 6/45 공개 데이터를 기반으로 번호 조합과 통계적 특성을 확인하고 나만의 전략을 관리하는 참고용 도구.",
  openGraph: {
    title: "로또전략 | LOTTO STRATEGY",
    description:
      "과거 로또 6/45 공개 데이터를 기반으로 번호 조합과 통계적 특성을 확인하고 나만의 전략을 관리하는 참고용 도구.",
    siteName: "LOTTO STRATEGY",
    locale: "ko_KR",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
