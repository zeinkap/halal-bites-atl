import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ExclamationTriangleIcon } from '../ui/icons';

export default function Footer() {
  return (
    <footer aria-label="Site disclaimer" className="w-full mt-8">
      <Card
        className="flex flex-col items-center py-6 bg-gray-50 border-t border-gray-200 shadow-sm"
        padding={false}
      >
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" aria-hidden="true" />
          <Badge color="gray" size="xs" className="mr-2">Disclaimer</Badge>
          <span>
          We strive to keep all restaurant details accurate and up to date. However, information such as menu, features, and halal status may change without notice. We recommend contacting the restaurant directly to confirm the latest details before your visit..
          </span>
        </div>
      </Card>
    </footer>
  );
} 