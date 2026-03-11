import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Memecoin Intel",
  description: "AI-powered memecoin news intelligence dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <nav className="border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-emerald-400 text-xl font-bold">&#9883;</span>
              <span className="text-white font-bold text-lg">Memecoin Intel</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/sources"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Sources
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
