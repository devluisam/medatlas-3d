import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "MEDATLAS 3D — Atlas de anatomia humana",
    template: "%s | MEDATLAS 3D",
  },
  description:
    "Atlas de anatomia humana no navegador: esqueleto 3D navegável, conteúdo por estrutura, questões comentadas, flashcards com repetição espaçada e tutor de IA opcional.",
  keywords: ["anatomia humana", "atlas anatômico", "anatomia 3D", "esqueleto 3D", "quiz de anatomia", "flashcards", "estudo de medicina"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: appUrl,
    title: "MEDATLAS 3D — Atlas de anatomia humana",
    description: "Esqueleto 3D navegável ligado a conteúdo, questões e flashcards.",
    siteName: "MEDATLAS 3D",
  },
};

export const viewport: Viewport = {
  themeColor: "#070b14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen font-sans antialiased`}>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
