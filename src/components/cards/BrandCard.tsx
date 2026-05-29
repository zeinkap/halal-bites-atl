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
        <p className="text-sm font-semibold text-stone-800 leading-tight">
          {locationLabel(location)}
        </p>
        <p className="text-xs text-stone-500 leading-relaxed">{location.address}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <a
            href={mapsUrlFor(location)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-2.5 py-1 rounded-full transition-colors"
          >
            <MapPinIcon className="h-3 w-3 text-stone-500" />
            <span>Maps</span>
            <ArrowTopRightOnSquareIcon className="h-3 w-3 text-stone-400" />
          </a>
          <a
            href={directionsUrlFor(location)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-2.5 py-1 rounded-full transition-colors"
          >
            <span>Directions</span>
            <ArrowTopRightOnSquareIcon className="h-3 w-3 text-white/80" />
          </a>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onComments(location);
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-full transition-colors"
          >
            <ChatBubbleLeftIcon className="h-3 w-3" />
            <span>Comments</span>
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
      <Card hoverable className="overflow-hidden" padding={false}>
        <div className="flex flex-col sm:flex-row">
          {/* Image panel */}
          <div
            className={`relative w-full h-44 sm:w-44 sm:h-auto sm:min-h-[220px] flex-shrink-0 border-b sm:border-b-0 sm:border-r border-stone-100 ${
              isFallbackLogo
                ? 'bg-gradient-to-br from-teal-50 via-stone-50 to-teal-100/60'
                : 'bg-stone-100'
            }`}
          >
            <Image
              src={isFallbackLogo ? '/images/logo.png' : (representative.imageUrl as string)}
              alt={brandName}
              fill
              className={isFallbackLogo ? 'object-contain p-6 opacity-60' : 'object-cover'}
              sizes="(max-width: 640px) 100vw, 176px"
              quality={85}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/logo.png';
              }}
            />
            {/* Multi-location badge */}
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-white/90 backdrop-blur-sm border border-teal-200 px-2 py-0.5 rounded-full shadow-sm">
              <BuildingStorefrontIcon className="h-3.5 w-3.5" />
              {locations.length} locations
            </span>
          </div>

          {/* Content panel */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 p-4 sm:p-5 space-y-2.5">
              <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                {brandName}
              </h3>

              <RestaurantBadges restaurant={representative} />

              <AmenityRow restaurant={representative} />

              {representative.description && (
                <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed">
                  {representative.description}
                </p>
              )}

              {/* Locations */}
              <div className="rounded-xl border border-stone-200 divide-y divide-stone-100 px-3">
                {visibleLocations.map((loc) => (
                  <LocationRow key={loc.id} location={loc} onComments={setCommentFor} />
                ))}
              </div>

              {locations.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((p) => !p)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
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
