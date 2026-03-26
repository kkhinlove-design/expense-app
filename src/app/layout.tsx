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
      <body className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 bg-gradient-animated relative overflow-x-hidden">
        {/* Decorative blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
          <div className="absolute top-1/3 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />
        </div>
        {children}
      </body>
    </html>
  );
}
