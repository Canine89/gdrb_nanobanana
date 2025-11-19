import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/Toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });
const notoSansKR = Noto_Sans_KR({ 
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "나노바나나 AI 프롬프트",
  description: "나노바나나 AI 비포&애프터 미친 활용법 71제 슈퍼 프롬프트 복붙 시트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} ${notoSansKR.variable}`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

