"use client";

import Link from "next/link";
import "./globals.css";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Ẩn thanh điều hướng nếu là trang Login
  const isLoginPage = pathname === "/login";

  // Hàm check active link để đổi màu
  const isActive = (path: string) => pathname === path;

  return (
    <html lang="vi">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
