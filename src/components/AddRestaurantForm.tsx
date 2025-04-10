import { useState } from 'react';

const cuisineTypes = [
  'Middle Eastern',
  'Indian',
  'Pakistani',
  'Turkish',
  'Persian',
  'Mediterranean',
  'Malaysian',
  'Indonesian',
  'African',
  'Cafe',
  'Other'
];

const priceRanges = ['$', '$$', '$$$'];

export default function AddRestaurantForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    address: '',
    priceRange: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add restaurant');
      }

      onClose();
    } catch (error) {
      setError('Failed to add restaurant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Add New Halal Restaurant</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900">
              Restaurant Name *
            </label>
            <input
              type="text"
              id="name"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-900">
              Cuisine Type *
            </label>
            <select
              id="cuisine"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500"
              value={formData.cuisine}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
            >
              <option value="">Select a cuisine type</option>
              {cuisineTypes.map((type) => (
                <option key={type} value={type} className="text-gray-900">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priceRange" className="block text-sm font-medium text-gray-900">
              Price Range
            </label>
            <select
              id="priceRange"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500"
              value={formData.priceRange}
              onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
            >
              <option value="">Select a price range</option>
              {priceRanges.map((range) => (
                <option key={range} value={range} className="text-gray-900">
                  {range}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-900">
              Address *
            </label>
            <input
              type="text"
              id="address"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-gray-900 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm cursor-pointer"
            >
              {isSubmitting ? 'Adding...' : 'Add Restaurant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 