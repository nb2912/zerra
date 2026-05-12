import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Zerra — The CLI-first backend framework",
    template: "%s | Zerra"
  },
  description: "Production-grade backend framework built for speed and DX. File-based routing, colocated APIs, and built-in Dev Console.",
  keywords: ["backend", "framework", "node.js", "typescript", "cli", "api", "fastify", "express", "zerra"],
  authors: [{ name: "nb2912" }],
  creator: "nb2912",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zerra.dev",
    title: "Zerra — The CLI-first backend framework",
    description: "Production-grade backend framework built for speed and DX.",
    siteName: "Zerra",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Zerra — Backend. Perfected."
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zerra — The CLI-first backend framework",
    description: "Production-grade backend framework built for speed and DX.",
    images: ["/og-image.png"],
    creator: "@nb2912",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground w-full overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
