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
    "Modulhaus",
    "Containerhaus",
    "Nachhaltig Bauen",
    "Modular",
    "Omniliving",
    "Premium Wohnen",
  ],
  authors: [{ name: "Omniliving Module Design GmbH" }],
  icons: {
    icon: "/images/logo-omniliving.png",
  },
  openGraph: {
    title: "Omniliving Module Design GmbH",
    description: "Modul. Design. Leben. – Modulare Containerhäuser in Premium-Qualität",
    type: "website",
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
