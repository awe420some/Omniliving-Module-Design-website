import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Omniliving Module Design GmbH | Modul. Design. Leben.",
  description:
    "Modulare Containerhäuser in Premium-Qualität. Nachhaltig, flexibel und schnell aufgebaut – Ihr individuelles Zuhause von Omniliving.",
  keywords: [
    "Modulhaus", "Containerhaus", "Nachhaltig Bauen", "Modular", "Omniliving", "Premium Wohnen",
    "modular house", "container home", "sustainable building", "prefab home",
  ],
  authors: [{ name: "Omniliving Module Design GmbH" }],
  icons: {
    icon: "/images/logo-omniliving.png",
  },
  openGraph: {
    title: "Omniliving Module Design GmbH | Modul. Design. Leben.",
    description: "Modulare Containerhäuser in Premium-Qualität – nachhaltig, flexibel, schnell aufgebaut.",
    type: "website",
    images: [{ url: "/images/hero-building.png", width: 1344, height: 896, alt: "Omniliving modulares Containerhaus" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Omniliving Module Design GmbH",
    description: "Modulare Containerhäuser in Premium-Qualität",
    images: ["/images/hero-building.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
