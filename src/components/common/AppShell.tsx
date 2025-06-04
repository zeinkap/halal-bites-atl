'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import FeatureRestaurantModal from '../modals/FeatureRestaurantModal/index.tsx';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  return (
    <>
      {!isAdmin && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      <ScrollToTop />
      {!isAdmin && <Footer />}
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
      {showFeatureModal && (
        <FeatureRestaurantModal
          isOpen={showFeatureModal}
          onClose={() => setShowFeatureModal(false)}
        />
      )}
    </>
  );
} 