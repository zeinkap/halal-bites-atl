'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import EditRestaurantModal from '@/components/modals/EditRestaurantModal/index.tsx';
import { type Restaurant } from '@prisma/client';
import Image from 'next/image';

// Extend the Prisma Restaurant type for admin view
interface AdminRestaurant extends Restaurant {
  commentCount: number;
  reportCount: number;
}

export default function RestaurantsManagement() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [showAllColumns, setShowAllColumns] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/admin/restaurants');
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/restaurants?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete restaurant');
      
      toast.success('Restaurant deleted successfully');
      fetchRestaurants(); // Refresh the list
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Failed to delete restaurant');
    }
  };

  // Compute filtered restaurants for search and sorting
  const filteredRestaurants = restaurants
    .filter(r => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      return (
        r.name.toLowerCase().includes(term) ||
        r.address.toLowerCase().includes(term) ||
        r.cuisineType.replace(/_/g, ' ').toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) return sortAsc ? -1 : 1;
      if (a.name.toLowerCase() > b.name.toLowerCase()) return sortAsc ? 1 : -1;
      return 0;
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-stone-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-200 border-t-teal-600" />
          <p className="text-sm font-medium">Loading restaurants…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 py-6 shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Restaurant Management</h1>
            <p className="text-teal-100 text-sm mt-0.5">
              <span className="font-semibold">{filteredRestaurants.length}</span> restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-full transition-colors"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, address, or cuisine…"
            className="flex-1 min-w-[200px] max-w-md px-4 py-2 border border-stone-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 placeholder-stone-400 text-stone-900 text-sm"
          />
          <button
            onClick={() => setShowAllColumns(v => !v)}
            className="text-sm font-medium text-stone-600 bg-white hover:bg-stone-50 border border-stone-200 px-4 py-2 rounded-full transition-colors shadow-sm"
          >
            {showAllColumns ? 'Fewer columns' : 'More columns'}
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-100 text-sm">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => setSortAsc((asc) => !asc)}>
                        Name {sortAsc ? '↑' : '↓'}
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Address</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Cuisine</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Price</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Halal Status</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">💬</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">🚩</th>
                      {showAllColumns && (
                        <>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">ID</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Description</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Prayer Room</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Outdoor</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">High Chair</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Alcohol</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Zabihah</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Fully Halal</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Image</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Z. Beef</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Z. Chicken</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Z. Goat</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Z. Lamb</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Z. Verified</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Z. Verified By</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Brand ID</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Part. Halal</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">P. Beef</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">P. Chicken</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">P. Goat</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">P. Lamb</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Created At</th>
                          <th className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Updated At</th>
                        </>
                      )}
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Featured</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredRestaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3 pl-4 pr-3 font-medium text-stone-900 truncate max-w-xs">
                          {restaurant.name}
                        </td>
                        <td className="px-3 py-3 text-stone-500 truncate max-w-xs">
                          {restaurant.address}
                        </td>
                        <td className="px-3 py-3 text-stone-500">
                          {restaurant.cuisineType.replace(/_/g, ' ')}
                        </td>
                        <td className="px-3 py-3 text-stone-500">
                          {restaurant.priceRange}
                        </td>
                        <td className="px-3 py-3 text-stone-500">
                          {restaurant.isFullyHalal ? 'Fully Halal' : ''}
                          {restaurant.isZabiha ? ' Zabihah' : ''}
                          {restaurant.isPartiallyHalal ? ' Partial' : ''}
                        </td>
                        <td className="px-3 py-3">
                          {restaurant.status === 'pending' ? (
                            <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">Pending</span>
                          ) : restaurant.status === 'rejected' ? (
                            <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600">Rejected</span>
                          ) : (
                            <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700">Live</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-stone-500 text-center">
                          {restaurant.commentCount}
                        </td>
                        <td className="px-3 py-3 text-stone-500 text-center">
                          {restaurant.reportCount}
                        </td>
                        {showAllColumns && (
                          <>
                            <td className="px-3 py-3 text-xs text-stone-400 font-mono">{restaurant.id}</td>
                            <td className="px-3 py-3 text-xs text-stone-500 max-w-[160px] truncate">{restaurant.description}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.hasPrayerRoom ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.hasOutdoorSeating ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.hasHighChair ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.servesAlcohol ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.isZabiha ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.isFullyHalal ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">
                              {restaurant.imageUrl ? (
                                <Image src={restaurant.imageUrl} alt="img" width={40} height={40} className="w-10 h-10 object-cover rounded-lg" unoptimized />
                              ) : '—'}
                            </td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.zabihaBeef ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.zabihaChicken ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.zabihaGoat ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.zabihaLamb ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.zabihaVerified ? new Date(restaurant.zabihaVerified).toLocaleDateString() : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.zabihaVerifiedBy || '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-400 font-mono">{restaurant.brandId || '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.isPartiallyHalal ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.partiallyHalalBeef ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.partiallyHalalChicken ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.partiallyHalalGoat ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-500">{restaurant.partiallyHalalLamb ? '✓' : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-400">{restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleDateString() : '—'}</td>
                            <td className="px-3 py-3 text-xs text-stone-400">{restaurant.updatedAt ? new Date(restaurant.updatedAt).toLocaleDateString() : '—'}</td>
                          </>
                        )}
                        <td className="px-3 py-3 text-center">
                          {restaurant.isFeatured ? (
                            <span className="text-teal-600 font-semibold text-xs">★ Yes</span>
                          ) : (
                            <span className="text-stone-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/admin/restaurants?id=${restaurant.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ isFeatured: !restaurant.isFeatured })
                                  });
                                  if (!response.ok) throw new Error();
                                  toast.success(restaurant.isFeatured ? 'Unfeatured' : 'Featured!');
                                  fetchRestaurants();
                                } catch {
                                  toast.error('Failed to update');
                                }
                              }}
                              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                                restaurant.isFeatured
                                  ? 'text-stone-600 bg-stone-100 border-stone-200 hover:bg-stone-200'
                                  : 'text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100'
                              }`}
                            >
                              {restaurant.isFeatured ? 'Unfeature' : 'Feature'}
                            </button>
                            <button
                              onClick={() => setEditingRestaurant(restaurant)}
                              className="text-xs font-medium text-stone-600 bg-white hover:bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(restaurant.id)}
                              className="text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-full transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          </div>
        </div>
      </div>
      {editingRestaurant && (
        <EditRestaurantModal
          restaurant={editingRestaurant}
          isOpen={!!editingRestaurant}
          onClose={() => setEditingRestaurant(null)}
          onSave={() => {
            setEditingRestaurant(null);
            fetchRestaurants(); // Refresh the list after save
          }}
        />
      )}
    </div>
  );
} 