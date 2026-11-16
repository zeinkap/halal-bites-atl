const KM_PER_MILE = 1.60934;

function toMiles(distanceKm: number | null | undefined): number | null {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm < 0) return null;
  return distanceKm / KM_PER_MILE;
}

/**
 * Format a distance given in kilometers as a short miles label for badges.
 * Returns null when the distance is missing, so callers can skip rendering.
 *
 * @param distanceKm Distance in kilometers (as returned by the proximity API), or null/undefined.
 * @returns e.g. "0.3 mi", "2.4 mi", "14 mi", or null when there is nothing to show.
 */
export function formatDistanceMiles(distanceKm: number | null | undefined): string | null {
  const miles = toMiles(distanceKm);
  if (miles == null) return null;
  const rounded = miles < 10 ? miles.toFixed(1) : Math.round(miles).toString();
  return `${rounded} mi`;
}

/** Roads are longer than the straight line between two points; ~1.35x is typical for a US metro. */
const ROAD_DETOUR_FACTOR = 1.35;
/** Minutes for getting going and parking, added to every trip. */
const TRIP_OVERHEAD_MIN = 2;

/** Average driving speed by trip length: short trips are surface streets, longer ones use highways. */
function averageSpeedMph(roadMiles: number): number {
  if (roadMiles <= 4) return 20;
  if (roadMiles <= 12) return 28;
  return 38;
}

/**
 * Rough driving time for a straight-line distance. This is an estimate, not a route: it assumes
 * typical Atlanta road detours and speeds and ignores live traffic.
 *
 * @param distanceKm Straight-line distance in kilometers, or null/undefined.
 * @returns Whole minutes (at least 1), or null when the distance is missing.
 */
export function estimateDriveMinutes(distanceKm: number | null | undefined): number | null {
  const miles = toMiles(distanceKm);
  if (miles == null) return null;
  const roadMiles = miles * ROAD_DETOUR_FACTOR;
  const minutes = (roadMiles / averageSpeedMph(roadMiles)) * 60 + TRIP_OVERHEAD_MIN;
  return Math.max(1, Math.round(minutes));
}

/** Tooltip text explaining that the drive time is estimated. */
export const DRIVE_TIME_NOTE = 'Estimated from distance; actual time depends on route and traffic';

/**
 * Format the estimated driving time as a short label ("~ " marks it as an estimate).
 *
 * @param distanceKm Straight-line distance in kilometers, or null/undefined.
 * @returns e.g. "~6 min drive", "~1 hr 5 min drive", or null when the distance is missing.
 */
export function formatDriveTime(distanceKm: number | null | undefined): string | null {
  const minutes = estimateDriveMinutes(distanceKm);
  if (minutes == null) return null;
  if (minutes < 60) return `~${minutes} min drive`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `~${hours} hr drive` : `~${hours} hr ${rest} min drive`;
}
