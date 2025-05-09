'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { CloseButton } from './ui/Button';

interface ImageWithLightboxProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function ImageWithLightbox({ src, alt, width, height, className = '' }: ImageWithLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

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
          buttonClose: () => <CloseButton onClick={() => setIsOpen(false)} />,
        }}
        toolbar={{
          buttons: [
            <CloseButton key="close" onClick={() => setIsOpen(false)} />
          ]
        }}
      />
    </>
  );
} 