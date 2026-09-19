import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "MEDATLAS 3D — Anatomia Humana Interativa",
    template: "%s | MEDATLAS 3D",
  },
  description:
    "Atlas de anatomia humana interativo: modelo 3D navegável no navegador, conteúdo clínico por estrutura, quiz com explicação e flashcards com repetição espaçada.",
  keywords: [
    "anatomia humana",
    "atlas anatômico",
    "3D interativo",
    "medicina",
    "estudante de medicina",
    "corpo humano",
    "sistemas anatômicos",
    "residência médica",
    "quiz anatomia",
    "MEDATLAS",
  ],
  authors: [{ name: "MEDATLAS Team" }],
  creator: "MEDATLAS 3D",
  publisher: "MEDATLAS 3D",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "MEDATLAS 3D — Anatomia Humana Interativa",
    description:
      "Atlas de anatomia humana interativo, com modelo 3D navegável no navegador.",
    siteName: "MEDATLAS 3D",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MEDATLAS 3D",
    description: "Explore o corpo humano em 3D interativo.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050a14" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
