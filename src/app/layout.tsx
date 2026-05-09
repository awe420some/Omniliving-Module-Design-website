import type { Metadata } from "next";
import { Playfair_Display, Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
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
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${montserrat.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
