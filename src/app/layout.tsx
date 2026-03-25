import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "데이터로 레벨업! — 배지 스토리텔링",
  description: "디지털새싹 프로그램 '데이터로 레벨업! 건강을 지키는 간식 생활' 배지 성장 여정",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Jua&family=Noto+Sans+KR:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-deep-navy text-light-gray font-['Noto_Sans_KR',sans-serif]">
        {children}
      </body>
    </html>
  );
}
