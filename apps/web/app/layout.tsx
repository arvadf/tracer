import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tracer Study PPG dan Studi Lanjut — PTI FKIP UMS",
  description:
    "Sistem Tracer Study Alumni Program Studi Pendidikan Teknik Informatika, Fakultas Keguruan dan Ilmu Pendidikan, Universitas Muhammadiyah Surakarta",
  keywords: [
    "tracer study",
    "alumni",
    "PTI",
    "UMS",
    "Pendidikan Teknik Informatika",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
