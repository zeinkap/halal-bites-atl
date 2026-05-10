'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { formatCuisineName } from '@/utils/formatCuisineName';
import type { Restaurant } from '@prisma/client';

interface PendingRestaurant extends Restaurant {
  commentCount: number;
  reportCount: number;
}

function HalalBadges({ r }: { r: PendingRestaurant }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {r.isFullyHalal && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-medium">Fully Halal</span>
      )}
      {r.isZabiha && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">Zabihah</span>
      )}
      {r.isPartiallyHalal && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-medium">Partially Halal</span>
      )}
      {r.servesAlcohol && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-medium">Serves Alcohol</span>
      )}
      {r.hasPrayerRoom && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-medium">Prayer Space</span>
      )}
    </div>
  );
}

export default function PendingRestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<PendingRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const res = await fetch('/api/admin/restaurants');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: PendingRestaurant[] = await res.json();
      setRestaurants(data.filter(r => r.status === 'pending'));
    } catch {
      toast.error('Failed to load pending restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionInProgress(id);
    try {
      const res = await fetch(`/api/admin/restaurants?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(status === 'approved' ? '✅ Restaurant approved and now live!' : '❌ Restaurant rejected.');
      setRestaurants(prev => prev.filter(r => r.id !== id));
    } catch {
      toast.error('Failed to update status. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 py-6 shadow-md mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BuildingStorefrontIcon className="h-7 w-7 text-white/90" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Pending Approval Queue</h1>
              <p className="text-teal-100 text-sm mt-0.5">Review and approve community-submitted restaurants</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-stone-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-100 rounded w-1/3" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                    <div className="h-3 bg-stone-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 px-6 py-16 text-center">
            <CheckCircleSolid className="h-12 w-12 text-teal-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-stone-800 mb-1">All caught up!</p>
            <p className="text-stone-500 text-sm">No restaurants are waiting for review.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-stone-500 mb-4">
              <span className="font-semibold text-stone-800">{restaurants.length}</span> restaurant{restaurants.length !== 1 ? 's' : ''} awaiting review
            </p>
            <div className="space-y-4">
              {restaurants.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-stone-900">{r.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                            Pending
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-stone-500">
                          <MapPinIcon className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                          <span className="truncate">{r.address}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-stone-500">
                          <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-medium">
                            {formatCuisineName(r.cuisineType)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full border font-medium ${
                            r.priceRange === 'LOW'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : r.priceRange === 'MEDIUM'
                              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                              : 'bg-orange-50 border-orange-200 text-orange-700'
                          }`}>
                            {r.priceRange === 'LOW' ? '$' : r.priceRange === 'MEDIUM' ? '$$' : '$$$'}
                          </span>
                        </div>

                        <HalalBadges r={r} />

                        {r.description && (
                          <p className="text-sm text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                            {r.description}
                          </p>
                        )}

                        {r.zabihaVerifiedBy && (
                          <p className="text-xs text-amber-700 mt-1.5">
                            Zabihah verified by: <span className="font-medium">{r.zabihaVerifiedBy}</span>
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 mt-3 text-xs text-stone-400">
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span>Submitted {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="border-t border-stone-100 px-5 py-3 bg-stone-50/50 flex items-center justify-end gap-3">
                    <button
                      onClick={() => updateStatus(r.id, 'rejected')}
                      disabled={actionInProgress === r.id}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, 'approved')}
                      disabled={actionInProgress === r.id}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-full transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {actionInProgress === r.id ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                      Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
