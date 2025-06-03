import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import ScrollToTop from "@/components/common/ScrollToTop";
import { Toaster } from 'react-hot-toast';
import { ModalProvider } from '@/components/ui/ModalContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white`}>
      <ModalProvider>
        <main className="flex-1">
          {children}
        </main>
        <ScrollToTop />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </ModalProvider>
    </div>
  );
} 