import { Restaurant } from '@/types';

/**
 * A single item to render in the list: either a standalone restaurant or a
 * brand with multiple locations collapsed into one card.
 */
export type CardEntry =
  | { kind: 'single'; key: string; restaurant: Restaurant }
  | {
      kind: 'brand';
      key: string;
      brandName: string;
      representative: Restaurant;
      locations: Restaurant[];
    };

/** Brand display name = the part of the name before the first " - ". */
export function brandDisplayName(name: string): string {
  const i = name.indexOf(' - ');
  return (i === -1 ? name : name.slice(0, i)).trim();
}

/**
 * Human label for a single location within a brand card.
 * Prefers the " - <suffix>" part of the name; falls back to the city parsed
 * from the address (handles suffix-less records), then "Main location".
 */
export function locationLabel(r: Restaurant): string {
  const i = r.name.indexOf(' - ');
  if (i !== -1) {
    const suffix = r.name.slice(i + 3).trim();
    if (suffix) return suffix;
  }
  // Address shape is typically: "<street>, <city>, <state> <zip>, <country>"
  const parts = r.address.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 3) return parts[parts.length - 3];
  if (parts.length === 2) return parts[0];
  return 'Main location';
}

/** Grouping key: authoritative brandId when present, else the name prefix. */
function groupKey(r: Restaurant): string {
  return r.brandId
    ? `brand:${r.brandId}`
    : `name:${brandDisplayName(r.name).toLowerCase()}`;
}

/**
 * Collapse an already-filtered-and-sorted restaurant list into card entries.
 * Order is preserved, so the first occurrence of a brand (the nearest one when
 * sorted by distance, or alphabetically first otherwise) becomes the
 * representative. A key shared by 2+ restaurants becomes a brand card.
 */
export function groupRestaurants(list: Restaurant[]): CardEntry[] {
  const order: string[] = [];
  const buckets = new Map<string, Restaurant[]>();

  for (const r of list) {
    const k = groupKey(r);
    if (!buckets.has(k)) {
      buckets.set(k, []);
      order.push(k);
    }
    buckets.get(k)!.push(r);
  }

  return order.map((k) => {
    const locs = buckets.get(k)!;
    if (locs.length < 2) {
      return { kind: 'single', key: locs[0].id, restaurant: locs[0] };
    }
    return {
      kind: 'brand',
      key: k,
      brandName: brandDisplayName(locs[0].name),
      representative: locs[0],
      locations: locs,
    };
  });
}
