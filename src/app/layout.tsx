import { Geist, Geist_Mono } from "next/font/google";
import type { Viewport } from "next";
import "./globals.css";
import Script from "next/script";
import { metadata } from "./metadata";
import { ModalProvider } from '@/components/ui/ModalContext';
import AppShell from '../components/common/AppShell';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export { metadata };

/** Mobile-first: proper viewport and theme for phones/tablets */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover", // safe-area insets for notched devices
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0f766e" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-stone-50`}
      >
        <ModalProvider>
          <AppShell>{children}</AppShell>
        </ModalProvider>
        {/* Analytics: load after page is idle to avoid blocking layout chunk */}
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-0GR5ED5JGG"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0GR5ED5JGG');
            `,
          }}
        />
        {process.env.NODE_ENV === 'production' && (
          <Script
            id="cloudflare-analytics"
            strategy="lazyOnload"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "20389085e7e44917b63b5307437e21f2"}'
          />
        )}
      </body>
    </html>
  );
}
