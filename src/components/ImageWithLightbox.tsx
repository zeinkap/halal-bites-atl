'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ImageWithLightboxProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function ImageWithLightbox({ src, alt, width, height, className = '' }: ImageWithLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const renderCloseButton = () => (
    <button
      key="close-button"
      onClick={() => setIsOpen(false)}
      className="fixed top-4 right-4 z-50 p-2 bg-black/70 hover:bg-black/90 rounded-full transition-colors"
      aria-label="Close lightbox"
    >
      <XMarkIcon className="h-6 w-6 text-white" />
    </button>
  );

  return (
    <>
      <div className="relative cursor-zoom-in" onClick={() => setIsOpen(true)}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-transform hover:scale-[1.02] ${className}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm">
            Click to zoom
          </span>
        </div>
      </div>
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={[{ src }]}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
          buttonClose: renderCloseButton,
        }}
      />
    </>
  );
} 