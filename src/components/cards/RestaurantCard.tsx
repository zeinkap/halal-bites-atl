import { Restaurant } from '@/types';
import React, { useState } from 'react';
import {
  MapPinIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import { ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import CommentModal from '../modals/CommentModal/index';
import ReportModal from '../modals/ReportModal';
import Image from 'next/image';
import { Card } from '../ui/Card';
import RestaurantBadges, { AmenityRow, hasZabihaMeat, hasPartiallyHalalMeat } from './RestaurantBadges';
import { formatDistanceMiles } from '@/utils/formatDistance';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

// Tier 1 — Headline halal-status badge (solid fill, the most important signal)
export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [localRestaurant, setLocalRestaurant] = useState(restaurant);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCommentAdded = async () => {
    try {
      const response = await fetch(`/api/restaurants`);
      if (!response.ok) throw new Error('Failed to fetch restaurant');
      const restaurants = await response.json();
      const updatedRestaurant = restaurants.find((r: Restaurant) => r.id === localRestaurant.id);
      if (updatedRestaurant) {
        setLocalRestaurant(updatedRestaurant);
      } else {
        if (confirm('This restaurant is no longer available. Would you like to refresh the page?')) {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error refreshing restaurant data:', error);
    }
  };

  const isFallbackLogo =
    !localRestaurant.imageUrl ||
    localRestaurant.imageUrl.trim() === '' ||
    localRestaurant.imageUrl === '/images/logo.png';

  const isNew = (() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    return new Date(localRestaurant.createdAt) > cutoff;
  })();

  const hasZabiha = hasZabihaMeat(localRestaurant);
  const hasPartiallyHalal = hasPartiallyHalalMeat(localRestaurant);
  const distanceLabel = formatDistanceMiles(localRestaurant.distance);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${localRestaurant.name} ${localRestaurant.address}`
  )}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    localRestaurant.address
  )}`;

  return (
    <>
      {/* One DOM for both layouts (test ids stay unique), arranged by a grid:
          - Phones: a compact row (small thumbnail beside name, distance and halal status), a
            full-width action bar, and the details (address, description, amenities, meat
            breakdown) only after tapping "More".
          - sm and up: image column on the left spanning all rows, everything always shown. */}
      <Card
        hoverable
        onClick={() => setIsExpanded((prev) => !prev)}
        className="cursor-pointer overflow-hidden"
        padding={false}
        data-testid={`restaurant-card-${localRestaurant.id}`}
      >
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 p-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:grid-rows-[auto_1fr_auto] sm:gap-x-0 sm:p-0">
          {/* ── Image ─────────────────────────────────────── */}
          <div
            className={`relative col-start-1 row-start-1 h-[4.5rem] w-[4.5rem] rounded-xl overflow-hidden sm:row-span-3 sm:h-auto sm:w-full sm:min-h-[220px] sm:rounded-none sm:border-r border-stone-100 ${
              isFallbackLogo
                ? 'bg-gradient-to-br from-teal-50 via-stone-50 to-teal-100/60'
                : 'bg-stone-100'
            }`}
          >
            <Image
              src={isFallbackLogo ? '/images/logo.png' : (localRestaurant.imageUrl as string)}
              alt={localRestaurant.name}
              fill
              className={isFallbackLogo ? 'object-contain p-2 sm:p-6 opacity-60' : 'object-cover'}
              sizes="(max-width: 640px) 72px, 176px"
              priority
              quality={85}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/logo.png';
              }}
            />
            {/* "New" badge overlaid on the image */}
            {isNew && (
              <span className="absolute top-1 left-1 sm:top-2.5 sm:left-2.5 inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-700 bg-white/90 backdrop-blur-sm border border-emerald-200 px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm">
                <span className="hidden sm:inline" aria-hidden="true">✨</span> New
              </span>
            )}
          </div>

          {/* ── Headline: name, rating, halal status, distance, price, cuisine ── */}
          <div className="col-start-2 row-start-1 min-w-0 space-y-1.5 sm:space-y-2.5 sm:px-5 sm:pt-5">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="text-[15px] sm:text-lg font-bold text-stone-900 leading-tight line-clamp-2 sm:line-clamp-none"
                data-testid={`restaurant-name-${localRestaurant.id}`}
              >
                {localRestaurant.name}
              </h3>
              {localRestaurant.avgRating != null && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                  <StarIcon className="h-3 w-3 text-amber-400" />
                  {localRestaurant.avgRating.toFixed(1)}
                  {localRestaurant.commentCount > 0 && (
                    <span className="hidden sm:inline font-normal text-amber-600/80">
                      &nbsp;·&nbsp;{localRestaurant.commentCount}
                    </span>
                  )}
                </span>
              )}
            </div>

            <RestaurantBadges
              restaurant={localRestaurant}
              leading={
                distanceLabel && (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
                    data-testid={`restaurant-distance-${localRestaurant.id}`}
                  >
                    <MapPinIcon className="h-3 w-3 text-emerald-500" />
                    {distanceLabel}
                  </span>
                )
              }
            />
          </div>

          {/* ── Details: always on sm+, behind "More" on phones ── */}
          <div
            className={`${isExpanded ? 'block' : 'hidden'} sm:block col-span-2 row-start-2 mt-3 sm:mt-0 sm:col-span-1 sm:col-start-2 sm:px-5 sm:pt-2.5 sm:pb-5 space-y-2.5`}
            id={`restaurant-details-${localRestaurant.id}`}
            data-testid={`restaurant-details-${localRestaurant.id}`}
          >
            <div className="flex items-start gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
              <p
                className="text-xs text-stone-500 sm:line-clamp-1 leading-relaxed"
                data-testid={`restaurant-address-${localRestaurant.id}`}
              >
                {localRestaurant.address}
              </p>
            </div>

            {/* Description */}
            {localRestaurant.description && (
              <p
                className="text-xs sm:text-sm text-stone-500 sm:line-clamp-2 leading-relaxed"
                data-testid={`restaurant-description-${localRestaurant.id}`}
              >
                {localRestaurant.description}
              </p>
            )}

            {/* Tier 3 — Amenities (icon-only) + alcohol warning (only when applicable) */}
            <AmenityRow restaurant={localRestaurant} />

            {/* Zabihah detail box */}
            {hasZabiha && (
              <div className="rounded-xl bg-amber-50/70 border border-amber-100 px-3 py-2.5 space-y-1.5">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                  Zabihah (hand-cut)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {localRestaurant.zabihaChicken && (
                    <span className="text-xs bg-white text-amber-800 px-2 py-0.5 rounded-full border border-amber-100">
                      🐔 Chicken
                    </span>
                  )}
                  {localRestaurant.zabihaLamb && (
                    <span className="text-xs bg-white text-amber-800 px-2 py-0.5 rounded-full border border-amber-100">
                      🐑 Lamb
                    </span>
                  )}
                  {localRestaurant.zabihaBeef && (
                    <span className="text-xs bg-white text-amber-800 px-2 py-0.5 rounded-full border border-amber-100">
                      🐄 Beef
                    </span>
                  )}
                  {localRestaurant.zabihaGoat && (
                    <span className="text-xs bg-white text-amber-800 px-2 py-0.5 rounded-full border border-amber-100">
                      🐐 Goat
                    </span>
                  )}
                </div>
                {localRestaurant.zabihaVerified && (
                  <p className="text-xs text-amber-700">
                    Verified {new Date(localRestaurant.zabihaVerified).toLocaleDateString()}
                    {localRestaurant.zabihaVerifiedBy && (
                      <> · by {localRestaurant.zabihaVerifiedBy}</>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Partially Halal detail box */}
            {hasPartiallyHalal && (
              <div className="rounded-xl bg-stone-50 border border-stone-200 px-3 py-2.5 space-y-1.5">
                <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
                  Partially Halal
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {localRestaurant.partiallyHalalChicken && (
                    <span className="text-xs bg-white text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                      🐔 Chicken
                    </span>
                  )}
                  {localRestaurant.partiallyHalalLamb && (
                    <span className="text-xs bg-white text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                      🐑 Lamb
                    </span>
                  )}
                  {localRestaurant.partiallyHalalBeef && (
                    <span className="text-xs bg-white text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                      🐄 Beef
                    </span>
                  )}
                  {localRestaurant.partiallyHalalGoat && (
                    <span className="text-xs bg-white text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                      🐐 Goat
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Phones: Report lives here (the action bar keeps only the frequent actions). */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsReportModalOpen(true);
              }}
              className="sm:hidden inline-flex items-center gap-1.5 min-h-[44px] text-xs font-medium text-stone-500"
            >
              <FlagIcon className="h-3.5 w-3.5" />
              Report a problem with this listing
            </button>
          </div>

          {/* ── Action bar ──────────────────────────────── */}
          {/* Phones: icon-only Comments and Maps, a Directions button taking the remaining width,
              and More/Less (44px tap targets; fits down to 320px wide). sm and up: labelled pills
              with Maps + Directions pushed right. */}
          <div
            className="col-span-2 row-start-3 -mx-3 -mb-3 mt-3 sm:m-0 sm:col-span-1 sm:col-start-2 border-t border-stone-100 px-3 sm:px-5 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2"
            data-testid={`restaurant-actions-${localRestaurant.id}`}
          >
            {/* Comment pill */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCommentModalOpen(true);
              }}
              aria-label={localRestaurant.commentCount > 0 ? `Comments (${localRestaurant.commentCount})` : 'Comments'}
              className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 h-11 min-w-[44px] px-2 sm:h-auto sm:min-w-0 sm:px-3 sm:py-1.5 rounded-full transition-colors"
            >
              <ChatBubbleLeftIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Comments</span>
              {localRestaurant.commentCount > 0 && (
                <span className="bg-teal-600 text-white font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] text-[10px]">
                  {localRestaurant.commentCount}
                </span>
              )}
            </button>

            {/* Report ghost button (sm and up; phones have it in the details) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsReportModalOpen(true);
              }}
              aria-label="Report"
              className="hidden sm:inline-flex flex-shrink-0 items-center justify-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-600 hover:bg-stone-100 sm:px-2.5 sm:py-1.5 rounded-full transition-colors"
            >
              <FlagIcon className="h-3.5 w-3.5" />
              <span>Report</span>
            </button>

            {/* Map controls (pushed right from sm up) */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="Open in Google Maps"
              className="inline-flex flex-shrink-0 items-center justify-center gap-1 sm:ml-auto text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 h-11 w-11 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 rounded-full transition-colors"
            >
              <MapPinIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-stone-500" />
              <span className="hidden sm:inline">Maps</span>
              <ArrowTopRightOnSquareIcon className="hidden sm:block h-3 w-3 text-stone-400" />
            </a>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex flex-1 min-w-0 sm:flex-none items-center justify-center gap-1 text-sm sm:text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 h-11 px-3 sm:h-auto sm:py-1.5 rounded-full transition-colors"
              data-testid={`restaurant-directions-${localRestaurant.id}`}
            >
              <span>Directions</span>
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-white/80 flex-shrink-0" />
            </a>

            {/* Phones: show/hide the details */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              aria-expanded={isExpanded}
              aria-controls={`restaurant-details-${localRestaurant.id}`}
              className="sm:hidden inline-flex flex-shrink-0 items-center justify-center gap-0.5 h-11 min-w-[44px] px-1.5 rounded-full text-xs font-semibold text-stone-500 hover:bg-stone-100"
              data-testid={`restaurant-expand-${localRestaurant.id}`}
            >
              {isExpanded ? 'Less' : 'More'}
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </Card>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        restaurantId={localRestaurant.id}
        restaurantName={localRestaurant.name}
        onCommentAdded={handleCommentAdded}
      />
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        restaurantId={localRestaurant.id}
        restaurantName={localRestaurant.name}
      />
    </>
  );
}
