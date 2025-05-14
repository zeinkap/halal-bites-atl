'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { useModalContext } from './ui/ModalContext';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { anyModalOpen } = useModalContext();

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible || anyModalOpen) return null;

  return (
    <>
      <Button
          onClick={scrollToTop}
        size="icon"
          aria-label="Scroll to top"
        className="fixed bottom-24 sm:bottom-6 right-6 z-50 shadow-md flex items-center justify-center bg-gradient-to-r from-amber-100 to-amber-300 text-amber-900 hover:to-amber-400"
        >
          <svg
          className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 15l7-7 7 7"
            />
          </svg>
      </Button>
    </>
  );
} 