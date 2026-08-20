import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Manrope } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { CartSheet } from "@/components/layout/CartSheet";
import { Footer } from "@/components/layout/Footer";
import { BackToTop, WhatsAppFab } from "@/components/layout/FloatingActions";
import { ThemeProvider, Toast } from "@/components/providers/AppProviders";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aurea.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AUREA | Joias & Acessórios Premium em Moçambique",
    template: "%s | AUREA",
  },
  description:
    "Elegância que brilha em cada detalhe. Joias e acessórios femininos premium com pedido fácil via WhatsApp. Maputo, Moçambique.",
  keywords: [
    "joias Moçambique",
    "AUREA",
    "acessórios femininos",
    "anéis Maputo",
    "ouro rosa",
    "pulseiras",
    "brincos",
  ],
  openGraph: {
    type: "website",
    locale: "pt_MZ",
    siteName: "AUREA",
    title: "AUREA | Joias & Acessórios Premium",
    description:
      "Elegância que brilha em cada detalhe. Peça online e finalize pelo WhatsApp.",
    images: [
      {
        url: "/brand/aurea-logo-og.svg",
        width: 400,
        height: 120,
        alt: "AUREA",
      },
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "AUREA Joias",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AUREA | Joias Premium",
    description: "Elegância que brilha em cada detalhe.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt"
      className={`${display.variable} ${sans.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemeProvider>
          <Header />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <CartSheet />
          <WhatsAppFab />
          <BackToTop />
          <Toast />
        </ThemeProvider>
      </body>
    </html>
  );
}
