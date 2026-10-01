import React from 'react';
import { Restaurant } from '@/types';
import { HeartIcon } from '@heroicons/react/24/solid';
import { formatCuisineName } from '@/utils/formatCuisineName';
import {
  WineGlassIcon,
  HighChairIcon,
  HalalBadgeIcon,
  PartiallyHalalBadgeIcon,
  OutdoorSeatingIcon,
  MosqueIcon,
} from '../ui/icons';

// Tier 1 — Headline halal-status badge (solid fill, the most important signal)
const HalalBadge = ({
  icon,
  label,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${colorClass}`}
  >
    {icon}
    <span>{label}</span>
  </span>
);

// Tier 2 — Light meta/feature pill
const FeatureChip = ({
  icon,
  label,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
}) => (
  <span
    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${colorClass}`}
  >
    {icon}
    <span>{label}</span>
  </span>
);

// Tier 3 — Icon-only amenity chip (muted, label exposed via tooltip + a11y)
const AmenityChip = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <span
    title={label}
    aria-label={label}
    className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-stone-200 bg-stone-50 text-stone-500"
  >
    {icon}
  </span>
);

export function hasZabihaMeat(r: Restaurant): boolean {
  return Boolean(
    r.isZabiha && (r.zabihaChicken || r.zabihaLamb || r.zabihaBeef || r.zabihaGoat)
  );
}

export function hasPartiallyHalalMeat(r: Restaurant): boolean {
  return Boolean(
    r.isPartiallyHalal &&
      (r.partiallyHalalChicken ||
        r.partiallyHalalLamb ||
        r.partiallyHalalBeef ||
        r.partiallyHalalGoat)
  );
}

/**
 * The tiered badge stack shared by single restaurant cards and grouped brand
 * cards: Tier 1 halal headline, Tier 2 price + cuisine, Tier 3 amenities.
 */
export default function RestaurantBadges({ restaurant }: { restaurant: Restaurant }) {
  const hasZabiha = hasZabihaMeat(restaurant);
  const hasPartiallyHalal = hasPartiallyHalalMeat(restaurant);
  const priceLevel =
    restaurant.priceRange === 'LOW' ? 1 : restaurant.priceRange === 'MEDIUM' ? 2 : 3;
  const priceTitle =
    priceLevel === 1 ? 'Budget-friendly' : priceLevel === 2 ? 'Moderate' : 'Upscale';

  return (
    <>
      {/* Tier 1 — Halal status headline */}
      {(restaurant.isFullyHalal || hasPartiallyHalal || hasZabiha) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {restaurant.isFullyHalal && (
            <HalalBadge
              icon={<HalalBadgeIcon className="h-3.5 w-3.5" />}
              label="Fully Halal"
              colorClass="bg-emerald-600 text-white"
            />
          )}
          {hasPartiallyHalal && !restaurant.isFullyHalal && (
            <HalalBadge
              icon={<PartiallyHalalBadgeIcon className="h-3.5 w-3.5" />}
              label="Partially Halal"
              colorClass="bg-amber-50 text-amber-800 border border-amber-300"
            />
          )}
          {hasZabiha && (
            <HalalBadge
              icon={<HeartIcon className="h-3.5 w-3.5" />}
              label="Zabihah"
              colorClass="bg-amber-500 text-white"
            />
          )}
        </div>
      )}

      {/* Tier 2 — Price + Cuisine pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          title={priceTitle}
          aria-label={`Price: ${priceTitle}`}
          className="inline-flex items-center text-xs font-bold tracking-tight px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200"
        >
          <span className="text-stone-800">{'$'.repeat(priceLevel)}</span>
          <span className="text-stone-300">{'$'.repeat(3 - priceLevel)}</span>
        </span>
        <span data-testid="restaurant-cuisine-badge" className="text-xs font-semibold px-2.5 py-0.5 rounded-full border text-teal-700 bg-white border-teal-200">
          {formatCuisineName(restaurant.cuisineType)}
        </span>
      </div>
    </>
  );
}

/** Tier 3 amenity row — rendered separately because single cards place it
 *  below the description, while brand cards place it right under the meta row. */
export function AmenityRow({ restaurant }: { restaurant: Restaurant }) {
  if (
    !restaurant.servesAlcohol &&
    !restaurant.hasPrayerRoom &&
    !restaurant.hasOutdoorSeating &&
    !restaurant.hasHighChair
  ) {
    return null;
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
      {restaurant.servesAlcohol && (
        <FeatureChip
          icon={<WineGlassIcon className="h-3 w-3" />}
          label="Serves Alcohol"
          colorClass="text-rose-600 bg-rose-50 border-rose-200"
        />
      )}
      {restaurant.hasPrayerRoom && (
        <AmenityChip icon={<MosqueIcon className="h-4 w-4" />} label="Prayer space" />
      )}
      {restaurant.hasOutdoorSeating && (
        <AmenityChip icon={<OutdoorSeatingIcon className="h-4 w-4" />} label="Outdoor seating" />
      )}
      {restaurant.hasHighChair && (
        <AmenityChip icon={<HighChairIcon className="h-4 w-4" />} label="High chairs" />
      )}
    </div>
  );
}
