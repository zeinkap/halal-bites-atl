'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { Toaster } from 'react-hot-toast';
import { Banner } from './ui/Banner';
import { useState } from 'react';
import FeatureRestaurantModal from './FeatureRestaurantModal.tsx';
import { Button } from './ui/Button';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname ? pathname.startsWith('/admin') : false;
  const [showBanner, setShowBanner] = useState(true);
  const [showFeatureModal, setShowFeatureModal] = useState(false);

  return (
    <>
      {!isAdmin && showBanner && (
        <Banner
          message={
            <>
              Interested in having your restaurant featured? Please reach out to us{' '}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFeatureModal(true)}
                className="text-green-800 underline px-0 py-0 h-auto min-w-0 align-baseline inline"
              >
                here
              </Button>
            </>
          }
          buttonLabel={undefined as any}
          onButtonClick={() => {}}
          onClose={() => setShowBanner(false)}
        />
      )}
      {!isAdmin && <Navbar showBanner={showBanner} />}
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