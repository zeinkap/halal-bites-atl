'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import EditRestaurantModal from '@/components/EditRestaurantModal';
import { type Restaurant } from '@prisma/client';
import { Button } from '../../../components/ui/Button';

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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Restaurant Management</h2>
            <p className="mt-2 text-lg text-gray-600">Manage all restaurants in the system</p>
          </div>
          <Button variant="neutral" onClick={() => router.push('/admin')} className="px-4 py-2 text-sm font-medium">Back to Dashboard</Button>
        </div>
        {/* Show More Columns Toggle */}
        <div className="mb-2">
          <Button
            variant="info"
            size="sm"
            onClick={() => setShowAllColumns((v) => !v)}
            className="mb-2"
          >
            {showAllColumns ? 'Show Fewer Columns' : 'Show More Columns'}
          </Button>
        </div>
        {/* Search Bar */}
        <div className="mb-2 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, address, or cuisine..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
          />
        </div>
        {/* Restaurant Count */}
        <div className="mb-4 text-gray-700 text-sm">
          Total Restaurants: <span className="font-semibold">{filteredRestaurants.length}</span>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 w-1/4 cursor-pointer select-none" onClick={() => setSortAsc((asc) => !asc)}>
                        Name
                        <span className="ml-1 inline-block align-middle">
                          {sortAsc ? (
                            <svg className="w-3 h-3 inline" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6l-4 4h8l-4-4z" /></svg>
                          ) : (
                            <svg className="w-3 h-3 inline" viewBox="0 0 20 20" fill="currentColor"><path d="M10 14l4-4H6l4 4z" /></svg>
                          )}
                        </span>
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-1/4">Address</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-1/6">Cuisine</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-16">Price</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-1/6">Halal Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-16">Comments</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-16">Reports</th>
                      {showAllColumns && (
                        <>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">ID</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Description</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Has Prayer Room</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Outdoor Seating</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">High Chair</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Alcohol</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Zabihah</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Fully Halal</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Image</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Zabihah Beef</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Zabihah Chicken</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Zabihah Goat</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Zabihah Lamb</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Zabihah Verified</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Zabihah Verified By</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Brand ID</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Partially Halal</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Partial Beef</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Partial Chicken</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Partial Goat</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Partial Lamb</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Created At</th>
                          <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Updated At</th>
                        </>
                      )}
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 w-28">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredRestaurants.map((restaurant) => (
                      <tr key={restaurant.id}>
                        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 truncate max-w-xs">
                          {restaurant.name}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 truncate max-w-xs">
                          {restaurant.address}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {restaurant.cuisineType.replace(/_/g, ' ')}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {restaurant.priceRange}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {restaurant.isFullyHalal ? 'Fully Halal' : ''} 
                          {restaurant.isZabiha ? ' (Zabihah)' : ''}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 text-center">
                          {restaurant.commentCount}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 text-center">
                          {restaurant.reportCount}
                        </td>
                        {showAllColumns && (
                          <>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.id}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.description}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.hasPrayerRoom ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.hasOutdoorSeating ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.hasHighChair ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.servesAlcohol ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.isZabiha ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.isFullyHalal ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.imageUrl ? <img src={restaurant.imageUrl} alt="img" className="w-12 h-12 object-cover rounded" /> : '-'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.zabihaBeef ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.zabihaChicken ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.zabihaGoat ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.zabihaLamb ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.zabihaVerified ? new Date(restaurant.zabihaVerified).toLocaleDateString() : '-'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.zabihaVerifiedBy || '-'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.brandId || '-'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.isPartiallyHalal ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.partiallyHalalBeef ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.partiallyHalalChicken ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.partiallyHalalGoat ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.partiallyHalalLamb ? 'Yes' : 'No'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleString() : '-'}</td>
                            <td className="px-3 py-4 text-xs text-gray-500">{restaurant.updatedAt ? new Date(restaurant.updatedAt).toLocaleString() : '-'}</td>
                          </>
                        )}
                        <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 whitespace-nowrap">
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => {
                              const restaurantData = {
                                ...restaurant,
                                commentCount: undefined,
                                reportCount: undefined
                              };
                              setEditingRestaurant(restaurantData);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(restaurant.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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