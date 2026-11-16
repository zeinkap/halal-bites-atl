import React, { useState } from 'react';
import { Restaurant } from '@/types';
import {
  MapPinIcon,
  ChatBubbleLeftIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/solid';
import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Card } from '../ui/Card';
import RestaurantBadges, { AmenityRow } from './RestaurantBadges';
import { locationLabel } from '@/utils/groupRestaurants';
import { formatDistanceMiles } from '@/utils/formatDistance';
import CommentModal from '../modals/CommentModal/index';

const mapsUrlFor = (r: Restaurant) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.name} ${r.address}`)}`;
const directionsUrlFor = (r: Restaurant) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address)}`;

function LocationRow({
  location,
  onComments,
}: {
  location: Restaurant;
  onComments: (r: Restaurant) => void;
}) {
  return (
    <div className="flex items-start gap-2 py-2.5">
      <MapPinIcon className="h-4 w-4 text-stone-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-stone-800 leading-tight">
            {locationLabel(location)}
          </p>
          {formatDistanceMiles(location.distance) && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full"
              data-testid={`restaurant-distance-${location.id}`}
            >
              {formatDistanceMiles(location.distance)}
            </span>
          )}
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">{location.address}</p>
        {/* Mobile: icon-only Maps/Comments (44px tap targets) and a Directions button that
            takes the remaining width, placed last. sm and up: the original labelled pills. */}
        <div
          className="flex items-center gap-1.5 mt-2"
          data-testid={`restaurant-actions-${location.id}`}
        >
          <a
            href={mapsUrlFor(location)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Open in Google Maps"
            className="inline-flex flex-shrink-0 items-center justify-center gap-1 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 h-11 w-11 sm:h-auto sm:w-auto sm:px-2.5 sm:py-1 rounded-full transition-colors"
          >
            <MapPinIcon className="h-4 w-4 sm:h-3 sm:w-3 text-stone-500" />
            <span className="hidden sm:inline">Maps</span>
            <ArrowTopRightOnSquareIcon className="hidden sm:block h-3 w-3 text-stone-400" />
          </a>
          <a
            href={directionsUrlFor(location)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="order-last sm:order-none inline-flex flex-1 min-w-0 sm:flex-none items-center justify-center gap-1 text-sm sm:text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 h-11 px-3 sm:h-auto sm:px-2.5 sm:py-1 rounded-full transition-colors"
            data-testid={`restaurant-directions-${location.id}`}
          >
            <span>Directions</span>
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-white/80 flex-shrink-0" />
          </a>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onComments(location);
            }}
            aria-label={location.commentCount > 0 ? `Comments (${location.commentCount})` : 'Comments'}
            className="inline-flex flex-shrink-0 items-center justify-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 h-11 min-w-[44px] px-2 sm:h-auto sm:min-w-0 sm:px-2.5 sm:py-1 rounded-full transition-colors"
          >
            <ChatBubbleLeftIcon className="h-4 w-4 sm:h-3 sm:w-3" />
            <span className="hidden sm:inline">Comments</span>
            {location.commentCount > 0 && (
              <span className="bg-teal-600 text-white font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] text-[10px]">
                {location.commentCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BrandCard({
  brandName,
  representative,
  locations,
}: {
  brandName: string;
  representative: Restaurant;
  locations: Restaurant[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentFor, setCommentFor] = useState<Restaurant | null>(null);

  const isFallbackLogo =
    !representative.imageUrl ||
    representative.imageUrl.trim() === '' ||
    representative.imageUrl === '/images/logo.png';

  const visibleLocations = isExpanded ? locations : locations.slice(0, 1);
  const hiddenCount = locations.length - visibleLocations.length;

  return (
    <>
      {/* Same grid as RestaurantCard: on phones a compact headline row (small thumbnail beside
          the brand name and badges), the nearest location with its Directions button, and the
          description/amenities only once "View all locations" is open. sm and up: image column
          on the left, everything shown. */}
      <Card hoverable className="overflow-hidden" padding={false}>
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 p-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:grid-rows-[auto_auto_1fr] sm:gap-x-0 sm:p-0">
          {/* Image */}
          <div
            className={`relative col-start-1 row-start-1 h-[4.5rem] w-[4.5rem] rounded-xl overflow-hidden sm:row-span-3 sm:h-auto sm:w-full sm:min-h-[220px] sm:rounded-none sm:border-r border-stone-100 ${
              isFallbackLogo
                ? 'bg-gradient-to-br from-teal-50 via-stone-50 to-teal-100/60'
                : 'bg-stone-100'
            }`}
          >
            <Image
              src={isFallbackLogo ? '/images/logo.png' : (representative.imageUrl as string)}
              alt={brandName}
              fill
              className={isFallbackLogo ? 'object-contain p-2 sm:p-6 opacity-60' : 'object-cover'}
              sizes="(max-width: 640px) 72px, 176px"
              quality={85}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/logo.png';
              }}
            />
            {/* Multi-location badge (sm and up; phones show it next to the name) */}
            <span className="hidden sm:inline-flex absolute top-2.5 left-2.5 items-center gap-1 text-xs font-bold text-teal-700 bg-white/90 backdrop-blur-sm border border-teal-200 px-2 py-0.5 rounded-full shadow-sm">
              <BuildingStorefrontIcon className="h-3.5 w-3.5" />
              {locations.length} locations
            </span>
          </div>

          {/* Headline */}
          <div className="col-start-2 row-start-1 min-w-0 space-y-1.5 sm:space-y-2.5 sm:px-5 sm:pt-5">
            <h3 className="text-[15px] sm:text-lg font-bold text-stone-900 leading-tight line-clamp-2 sm:line-clamp-none">
              {brandName}
            </h3>
            <span className="sm:hidden inline-flex items-center gap-1 text-[11px] font-bold text-teal-700">
              <BuildingStorefrontIcon className="h-3.5 w-3.5" />
              {locations.length} locations
            </span>
            <RestaurantBadges restaurant={representative} />
          </div>

          {/* Description + amenities: always on sm+, with the full location list on phones */}
          <div
            className={`${isExpanded ? 'block' : 'hidden'} sm:block col-span-2 row-start-2 mt-3 sm:mt-2.5 sm:col-span-1 sm:col-start-2 sm:px-5 space-y-2.5`}
          >
            <AmenityRow restaurant={representative} />
            {representative.description && (
              <p className="text-xs sm:text-sm text-stone-500 sm:line-clamp-2 leading-relaxed">
                {representative.description}
              </p>
            )}
          </div>

          {/* Locations (nearest first when Near Me is on) */}
          <div className="col-span-2 row-start-3 mt-3 sm:mt-2.5 sm:col-span-1 sm:col-start-2 sm:px-5 sm:pb-5 space-y-1.5">
            <div className="rounded-xl border border-stone-200 divide-y divide-stone-100 px-3">
              {visibleLocations.map((loc) => (
                <LocationRow key={loc.id} location={loc} onComments={setCommentFor} />
              ))}
            </div>

            {locations.length > 1 && (
              <button
                type="button"
                onClick={() => setIsExpanded((p) => !p)}
                aria-expanded={isExpanded}
                className="inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
              >
                {isExpanded ? (
                  <>
                    Show less
                    <ChevronUpIcon className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    View all {locations.length} locations
                    {hiddenCount > 0 && <span className="text-stone-400">(+{hiddenCount})</span>}
                    <ChevronDownIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </Card>

      {commentFor && (
        <CommentModal
          isOpen={!!commentFor}
          onClose={() => setCommentFor(null)}
          restaurantId={commentFor.id}
          restaurantName={`${brandName} — ${locationLabel(commentFor)}`}
        />
      )}
    </>
  );
}
