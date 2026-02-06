import { Restaurant } from '@/types';
import React, { useState } from 'react';
import { MapPinIcon, HomeModernIcon, HeartIcon, ChatBubbleLeftIcon, BeakerIcon, FlagIcon, ArrowRightCircleIcon } from '@heroicons/react/24/solid';
import CommentModal from '../modals/CommentModal/index';
import ReportModal from '../modals/ReportModal';
import Image from 'next/image';
import { formatCuisineName } from '@/utils/formatCuisineName';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { WineGlassIcon, HighChairIcon, HalalBadgeIcon, PartiallyHalalBadgeIcon, OutdoorSeatingIcon } from '../ui/icons';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

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

  const renderFeatureIcon = (condition: boolean, icon: React.ReactNode, label: string) => (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
        condition ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-stone-500 bg-stone-100 border border-stone-200'
      }`}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </div>
  );

  const isFallbackLogo =
    !localRestaurant.imageUrl ||
    localRestaurant.imageUrl.trim() === '' ||
    localRestaurant.imageUrl === '/images/logo.png';

  return (
    <>
      <Card hoverable onClick={() => setIsExpanded((prev) => !prev)} className="cursor-pointer overflow-hidden" padding={false}>
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full h-44 sm:w-52 sm:h-52 sm:min-h-[208px] border-b sm:border-b-0 sm:border-r border-stone-100 flex-shrink-0 bg-stone-100">
            <Image
              src={isFallbackLogo ? '/images/logo.png' : (localRestaurant.imageUrl as string)}
              alt={localRestaurant.name}
              fill
              className={isFallbackLogo ? 'object-contain sm:object-cover p-4' : 'object-cover'}
              sizes="(max-width: 768px) 100vw, 208px"
              priority
              quality={85}
            />
          </div>
          <div className="flex-1 p-4 sm:p-5">
            <div className="space-y-3">
              <div>
                <h3
                  className="text-lg font-bold text-stone-900 mb-1.5 leading-tight"
                  data-testid={`restaurant-name-${localRestaurant.id}`}
                >
                  {localRestaurant.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge
                    color={
                      localRestaurant.priceRange === 'LOW' ? 'green' : localRestaurant.priceRange === 'MEDIUM' ? 'yellow' : 'orange'
                    }
                    className="text-xs"
                  >
                    {localRestaurant.priceRange === 'LOW' ? '$' : localRestaurant.priceRange === 'MEDIUM' ? '$$' : '$$$'}
                  </Badge>
                  <Badge color="teal" className="text-xs">
                    {formatCuisineName(localRestaurant.cuisineType)}
                  </Badge>
                </div>
                <div className="flex items-start gap-2 text-sm text-stone-600">
                  <MapPinIcon className="h-4 w-4 text-stone-400 flex-shrink-0 mt-0.5" />
                  <p className="line-clamp-2 leading-relaxed" data-testid={`restaurant-address-${localRestaurant.id}`}>
                    {localRestaurant.address}
                  </p>
                </div>
              </div>
              {localRestaurant.description && (
                <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed" data-testid={`restaurant-description-${localRestaurant.id}`}>
                  {localRestaurant.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {localRestaurant.hasPrayerRoom && renderFeatureIcon(true, <HomeModernIcon className="h-4 w-4" />, 'Prayer Space')}
                {localRestaurant.hasOutdoorSeating && renderFeatureIcon(true, <OutdoorSeatingIcon className="h-4 w-4" />, 'Outdoor')}
                {(localRestaurant.isZabiha &&
                  (localRestaurant.zabihaChicken || localRestaurant.zabihaLamb || localRestaurant.zabihaBeef || localRestaurant.zabihaGoat)) &&
                  renderFeatureIcon(true, <HeartIcon className="h-4 w-4" />, 'Zabihah')}
                {localRestaurant.hasHighChair && renderFeatureIcon(true, <HighChairIcon className="h-4 w-4" />, 'High Chairs')}
                {localRestaurant.servesAlcohol ? (
                  <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg text-xs font-medium">
                    <WineGlassIcon className="h-4 w-4" />
                    <span>Serves Alcohol</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg text-xs font-medium">
                    <WineGlassIcon className="h-4 w-4" />
                    <span>No Alcohol</span>
                  </div>
                )}
                {localRestaurant.isFullyHalal && renderFeatureIcon(true, <HalalBadgeIcon className="h-4 w-4" />, 'Fully Halal')}
                {(localRestaurant.isPartiallyHalal &&
                  (localRestaurant.partiallyHalalChicken ||
                    localRestaurant.partiallyHalalLamb ||
                    localRestaurant.partiallyHalalBeef ||
                    localRestaurant.partiallyHalalGoat)) &&
                  renderFeatureIcon(true, <PartiallyHalalBadgeIcon className="h-4 w-4" />, 'Partially Halal')}
              </div>

              {localRestaurant.isZabiha &&
                (localRestaurant.zabihaChicken || localRestaurant.zabihaLamb || localRestaurant.zabihaBeef || localRestaurant.zabihaGoat) && (
                  <div className="rounded-xl bg-amber-50/80 border border-amber-100 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <HeartIcon className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">Zabihah (hand-cut):</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {localRestaurant.zabihaChicken && <span className="text-xs bg-white text-amber-800 px-2 py-0.5 rounded-lg border border-amber-100">Chicken</span>}
                      {localRestaurant.zabihaLamb && <span className="text-xs bg-white text-amber-800 px-2 py-0.5 rounded-lg border border-amber-100">Lamb</span>}
                      {localRestaurant.zabihaBeef && <span className="text-xs bg-white text-amber-800 px-2 py-0.5 rounded-lg border border-amber-100">Beef</span>}
                      {localRestaurant.zabihaGoat && <span className="text-xs bg-white text-amber-800 px-2 py-0.5 rounded-lg border border-amber-100">Goat</span>}
                    </div>
                    {localRestaurant.zabihaVerified && (
                      <div className="text-xs text-amber-700">
                        Verified: {new Date(localRestaurant.zabihaVerified).toLocaleDateString()}
                        {localRestaurant.zabihaVerifiedBy && <div className="text-amber-600">By: {localRestaurant.zabihaVerifiedBy}</div>}
                      </div>
                    )}
                  </div>
                )}

              {localRestaurant.isPartiallyHalal &&
                (localRestaurant.partiallyHalalChicken ||
                  localRestaurant.partiallyHalalLamb ||
                  localRestaurant.partiallyHalalBeef ||
                  localRestaurant.partiallyHalalGoat) && (
                  <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <BeakerIcon className="h-4 w-4 text-stone-500" />
                      <span className="text-sm font-medium text-stone-700">Partially halal:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {localRestaurant.partiallyHalalChicken && <span className="text-xs bg-white text-stone-600 px-2 py-0.5 rounded-lg border border-stone-200">Chicken</span>}
                      {localRestaurant.partiallyHalalLamb && <span className="text-xs bg-white text-stone-600 px-2 py-0.5 rounded-lg border border-stone-200">Lamb</span>}
                      {localRestaurant.partiallyHalalBeef && <span className="text-xs bg-white text-stone-600 px-2 py-0.5 rounded-lg border border-stone-200">Beef</span>}
                      {localRestaurant.partiallyHalalGoat && <span className="text-xs bg-white text-stone-600 px-2 py-0.5 rounded-lg border border-stone-200">Goat</span>}
                    </div>
                  </div>
                )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center justify-center gap-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-100 w-full sm:w-auto text-sm font-medium"
                  title="Add Comment"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCommentModalOpen(true);
                  }}
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>Add Comment</span>
                  {localRestaurant.commentCount > 0 && (
                    <span className="bg-teal-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                      {localRestaurant.commentCount}
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center justify-center gap-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 w-full sm:w-auto text-sm font-medium"
                  title="Report Issue"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReportModalOpen(true);
                  }}
                >
                  <FlagIcon className="h-4 w-4" />
                  <span>Report Issue</span>
                </Button>
              </div>

              {isExpanded && (
                <div className="flex flex-wrap gap-2 pt-2 justify-center border-t border-stone-100">
                  <Button
                    variant="info"
                    size="sm"
                    className="flex items-center gap-1.5"
                    title="View on Google Maps"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${localRestaurant.name} ${localRestaurant.address}`)}`,
                        '_blank'
                      );
                    }}
                  >
                    <MapPinIcon className="h-4 w-4" />
                    <span>Google Maps</span>
                  </Button>
                  <Button
                    variant="neutral"
                    size="sm"
                    className="flex items-center gap-1.5"
                    title="Get Directions"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(localRestaurant.address)}`, '_blank');
                    }}
                  >
                    <ArrowRightCircleIcon className="h-4 w-4" />
                    <span>Directions</span>
                  </Button>
                </div>
              )}
              {!isExpanded && (
                <p className="mt-1 text-xs text-stone-400 text-center select-none">Tap card for map & directions</p>
              )}
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
