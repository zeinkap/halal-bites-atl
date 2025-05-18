import { Card } from './Card';
import { Button, CloseButton } from './Button';
import { ExclamationTriangleIcon } from './icons';
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BannerProps {
  message: React.ReactNode;
  buttonLabel: string;
  onButtonClick: () => void;
  onClose: () => void;
}

export const Banner: React.FC<BannerProps> = ({ message, buttonLabel, onButtonClick, onClose }) => (
  <Card className="sticky top-0 z-50 bg-gradient-to-r from-green-200 to-emerald-300 border-0 rounded-none shadow-none px-0 py-0">
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2 text-green-700">
        <ExclamationTriangleIcon className="h-5 w-5 text-green-700" />
        <span className="text-sm font-medium text-green-800">{message}</span>
      </div>
      <div className="flex items-center gap-2">
        <CloseButton
          onClick={onClose}
          aria-label="Dismiss banner"
          className="text-green-900 hover:text-green-700"
        >
          <XMarkIcon className="h-6 w-6" />
          <span className="sr-only">Dismiss banner</span>
        </CloseButton>
      </div>
    </div>
  </Card>
); 