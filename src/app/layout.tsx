import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "업무추진비 관리",
  description: "업무추진비 카드 사용내역 관리 및 HWPX 서식 생성",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
