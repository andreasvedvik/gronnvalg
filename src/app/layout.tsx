import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";
import ErrorBoundary from "@/components/ErrorBoundary";
import Providers from "@/components/Providers";
import SkipLink from "@/components/SkipLink";
import RouteAnnouncer from "@/components/RouteAnnouncer";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Grønnest - Finn det grønneste valget",
  description: "Skann produkter og se miljøscore. Finn norske alternativer.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Grønnest",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} antialiased`}>
        <ErrorBoundary>
          <Providers>
            <SkipLink />
            <RouteAnnouncer />
            <PWARegister />
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
