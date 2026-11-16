const KM_PER_MILE = 1.60934;

/**
 * Format a distance given in kilometers as a short, human-readable miles label.
 * Returns null when the distance is missing, so callers can skip rendering.
 *
 * @param distanceKm Distance in kilometers (as returned by the proximity API), or null/undefined.
 * @returns e.g. "0.3 mi away", "2.4 mi away", or null when there is nothing to show.
 */
export function formatDistanceMiles(distanceKm: number | null | undefined): string | null {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm < 0) return null;
  const miles = distanceKm / KM_PER_MILE;
  const rounded = miles < 10 ? miles.toFixed(1) : Math.round(miles).toString();
  return `${rounded} mi away`;
}
