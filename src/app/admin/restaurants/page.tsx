'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import EditRestaurantModal from '@/components/EditRestaurantModal';
import { type Restaurant } from '@prisma/client';

// Extend the Prisma Restaurant type for admin view
interface AdminRestaurant extends Restaurant {
  commentCount: number;
  reportCount: number;
}

export default function RestaurantsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchRestaurants();
    }
  }, [status, router]);

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

  if (status === 'loading' || isLoading) {
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

  if (!session?.user?.email || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
            <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
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
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 w-1/4">Name</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-1/4">Address</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-1/6">Cuisine</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-16">Price</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-1/6">Halal Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-16">Comments</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-16">Reports</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 w-28">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {restaurants.map((restaurant) => (
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
                          {restaurant.isZabiha ? ' (Zabiha)' : ''}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 text-center">
                          {restaurant.commentCount}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 text-center">
                          {restaurant.reportCount}
                        </td>
                        <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 whitespace-nowrap">
                          <button
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
                          </button>
                          <button
                            onClick={() => handleDelete(restaurant.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
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