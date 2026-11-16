import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { formatDistanceMiles, formatDriveTime, DRIVE_TIME_NOTE } from '@/utils/formatDistance';

/**
 * Distance + estimated drive time, shown top-right next to a card's name while Near Me is on
 * (the most important fact when choosing where to eat nearby). Renders nothing without a distance.
 */
export default function DistanceBlock({
  distanceKm,
  testId,
}: {
  distanceKm: number | null | undefined;
  /** Test id for the distance pill (e.g. `restaurant-distance-<id>`); omitted where another element carries it. */
  testId?: string;
}) {
  const distance = formatDistanceMiles(distanceKm);
  if (!distance) return null;
  const drive = formatDriveTime(distanceKm);

  return (
    <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
      <span
        className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap"
        data-testid={testId}
      >
        <MapPinIcon className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
        {distance}
      </span>
      {drive && (
        <span
          className="text-[11px] font-medium text-stone-500 whitespace-nowrap"
          title={DRIVE_TIME_NOTE}
          data-testid={testId ? testId.replace('-distance-', '-drive-time-') : undefined}
        >
          {drive}
        </span>
      )}
    </div>
  );
}
