import { Restaurant } from '@/types';
import React, { useState } from 'react';
import {
  MapPinIcon,
  HomeModernIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import { ArrowTopRightOnSquareIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import CommentModal from '../modals/CommentModal/index';
import ReportModal from '../modals/ReportModal';
import Image from 'next/image';
import { formatCuisineName } from '@/utils/formatCuisineName';
import { Card } from '../ui/Card';
import { WineGlassIcon, HighChairIcon, HalalBadgeIcon, PartiallyHalalBadgeIcon, OutdoorSeatingIcon } from '../ui/icons';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

// Compact pill chip for feature tags
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

  const hasZabiha =
    localRestaurant.isZabiha &&
    (localRestaurant.zabihaChicken ||
      localRestaurant.zabihaLamb ||
      localRestaurant.zabihaBeef ||
      localRestaurant.zabihaGoat);

  const hasPartiallyHalal =
    localRestaurant.isPartiallyHalal &&
    (localRestaurant.partiallyHalalChicken ||
      localRestaurant.partiallyHalalLamb ||
      localRestaurant.partiallyHalalBeef ||
      localRestaurant.partiallyHalalGoat);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${localRestaurant.name} ${localRestaurant.address}`
  )}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    localRestaurant.address
  )}`;

  return (
    <>
      <Card
        hoverable
        onClick={() => setIsExpanded((prev) => !prev)}
        className="cursor-pointer overflow-hidden"
        padding={false}
      >
        <div className="flex flex-col sm:flex-row">
          {/* ── Image panel ─────────────────────────────── */}
          <div
            className={`relative w-full h-44 sm:w-44 sm:h-auto sm:min-h-[220px] flex-shrink-0 border-b sm:border-b-0 sm:border-r border-stone-100 ${
              isFallbackLogo
                ? 'bg-gradient-to-br from-teal-50 via-stone-50 to-teal-100/60'
                : 'bg-stone-100'
            }`}
          >
            <Image
              src={isFallbackLogo ? '/images/logo.png' : (localRestaurant.imageUrl as string)}
              alt={localRestaurant.name}
              fill
              className={isFallbackLogo ? 'object-contain p-6 opacity-60' : 'object-cover'}
              sizes="(max-width: 640px) 100vw, 176px"
              priority
              quality={85}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/logo.png';
              }}
            />
            {/* "New" badge overlaid on the image */}
            {isNew && (
              <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-white/90 backdrop-blur-sm border border-emerald-200 px-2 py-0.5 rounded-full shadow-sm">
                ✨ New
              </span>
            )}
          </div>

          {/* ── Content panel ───────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 p-4 sm:p-5 space-y-2.5">

              {/* Name + Rating */}
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="text-base sm:text-lg font-bold text-stone-900 leading-tight"
                  data-testid={`restaurant-name-${localRestaurant.id}`}
                >
                  {localRestaurant.name}
                </h3>
                {localRestaurant.avgRating != null && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full flex-shrink-0">
                    <StarIcon className="h-3 w-3 text-amber-400" />
                    {localRestaurant.avgRating.toFixed(1)}
                    {localRestaurant.commentCount > 0 && (
                      <span className="font-normal text-amber-600/80">
                        &nbsp;·&nbsp;{localRestaurant.commentCount}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Price + Cuisine pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    localRestaurant.priceRange === 'LOW'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : localRestaurant.priceRange === 'MEDIUM'
                      ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
                      : 'text-orange-700 bg-orange-50 border-orange-200'
                  }`}
                >
                  {localRestaurant.priceRange === 'LOW'
                    ? '$'
                    : localRestaurant.priceRange === 'MEDIUM'
                    ? '$$'
                    : '$$$'}
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border text-teal-700 bg-teal-50 border-teal-200">
                  {formatCuisineName(localRestaurant.cuisineType)}
                </span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                <p
                  className="text-xs text-stone-500 line-clamp-1 leading-relaxed"
                  data-testid={`restaurant-address-${localRestaurant.id}`}
                >
                  {localRestaurant.address}
                </p>
              </div>

              {/* Description */}
              {localRestaurant.description && (
                <p
                  className="text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed"
                  data-testid={`restaurant-description-${localRestaurant.id}`}
                >
                  {localRestaurant.description}
                </p>
              )}

              {/* Feature chips */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {localRestaurant.isFullyHalal && (
                  <FeatureChip
                    icon={<HalalBadgeIcon className="h-3 w-3" />}
                    label="Fully Halal"
                    colorClass="text-teal-700 bg-teal-50 border-teal-200"
                  />
                )}
                {hasZabiha && (
                  <FeatureChip
                    icon={<HeartIcon className="h-3 w-3" />}
                    label="Zabihah"
                    colorClass="text-amber-700 bg-amber-50 border-amber-200"
                  />
                )}
                {hasPartiallyHalal && (
                  <FeatureChip
                    icon={<PartiallyHalalBadgeIcon className="h-3 w-3" />}
                    label="Partially Halal"
                    colorClass="text-stone-600 bg-stone-50 border-stone-200"
                  />
                )}
                {localRestaurant.servesAlcohol ? (
                  <FeatureChip
                    icon={<WineGlassIcon className="h-3 w-3" />}
                    label="Serves Alcohol"
                    colorClass="text-rose-600 bg-rose-50 border-rose-200"
                  />
                ) : (
                  <FeatureChip
                    icon={<WineGlassIcon className="h-3 w-3" />}
                    label="No Alcohol"
                    colorClass="text-emerald-700 bg-emerald-50 border-emerald-200"
                  />
                )}
                {localRestaurant.hasPrayerRoom && (
                  <FeatureChip
                    icon={<HomeModernIcon className="h-3 w-3" />}
                    label="Prayer Space"
                    colorClass="text-stone-600 bg-stone-50 border-stone-200"
                  />
                )}
                {localRestaurant.hasOutdoorSeating && (
                  <FeatureChip
                    icon={<OutdoorSeatingIcon className="h-3 w-3" />}
                    label="Outdoor"
                    colorClass="text-stone-600 bg-stone-50 border-stone-200"
                  />
                )}
                {localRestaurant.hasHighChair && (
                  <FeatureChip
                    icon={<HighChairIcon className="h-3 w-3" />}
                    label="High Chairs"
                    colorClass="text-stone-600 bg-stone-50 border-stone-200"
                  />
                )}
              </div>

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
            </div>

            {/* ── Action bar ──────────────────────────────── */}
            <div className="border-t border-stone-100 px-4 sm:px-5 py-2.5 flex items-center gap-2">
              {/* Comment pill */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-full transition-colors"
              >
                <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
                <span>Comments</span>
                {localRestaurant.commentCount > 0 && (
                  <span className="bg-teal-600 text-white font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] text-[10px]">
                    {localRestaurant.commentCount}
                  </span>
                )}
              </button>

              {/* Report ghost button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReportModalOpen(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-600 hover:bg-stone-100 px-2.5 py-1.5 rounded-full transition-colors"
              >
                <FlagIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Report</span>
              </button>

              {/* Spacer + map controls */}
              <div className="ml-auto flex items-center gap-2">
                {isExpanded ? (
                  <>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <MapPinIcon className="h-3.5 w-3.5 text-stone-500" />
                      <span>Maps</span>
                      <ArrowTopRightOnSquareIcon className="h-3 w-3 text-stone-400" />
                    </a>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <span>Directions</span>
                      <ArrowTopRightOnSquareIcon className="h-3 w-3 text-white/80" />
                    </a>
                    <ChevronUpIcon className="h-4 w-4 text-stone-400 ml-0.5 flex-shrink-0" />
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-stone-400 select-none">
                    <MapPinIcon className="h-3 w-3" />
                    <span className="hidden xs:inline">Tap for map</span>
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </div>
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
