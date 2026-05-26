import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "产品中心",
  description: "产品生命周期管理系统",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
