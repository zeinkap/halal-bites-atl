'use client';

import { type Restaurant, CuisineType, PriceRange } from '@prisma/client';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface EditRestaurantModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EditRestaurantModal({
  restaurant,
  isOpen,
  onClose,
  onSave,
}: EditRestaurantModalProps) {
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: restaurant.name,
    address: restaurant.address,
    description: restaurant.description ?? '',
    cuisineType: restaurant.cuisineType,
    priceRange: restaurant.priceRange,
    hasPrayerRoom: restaurant.hasPrayerRoom,
    hasOutdoorSeating: restaurant.hasOutdoorSeating,
    hasHighChair: restaurant.hasHighChair,
    servesAlcohol: restaurant.servesAlcohol,
    isFullyHalal: restaurant.isFullyHalal,
    isZabiha: restaurant.isZabiha,
    zabihaChicken: restaurant.zabihaChicken,
    zabihaLamb: restaurant.zabihaLamb,
    zabihaBeef: restaurant.zabihaBeef,
    zabihaGoat: restaurant.zabihaGoat,
    isPartiallyHalal: restaurant.isPartiallyHalal,
    partiallyHalalChicken: restaurant.partiallyHalalChicken,
    partiallyHalalLamb: restaurant.partiallyHalalLamb,
    partiallyHalalBeef: restaurant.partiallyHalalBeef,
    partiallyHalalGoat: restaurant.partiallyHalalGoat,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation for partially halal meat types
    if (formData.isPartiallyHalal) {
      if (!formData.partiallyHalalChicken && !formData.partiallyHalalLamb && !formData.partiallyHalalBeef && !formData.partiallyHalalGoat) {
        setError('Please select at least one Partially Halal meat type');
        setIsLoading(false);
        return;
      }
    } else {
      setError(null);
    }

    try {
      const response = await fetch(`/api/admin/restaurants?id=${restaurant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update restaurant');
      }

      toast.success('Restaurant updated successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error('Failed to update restaurant');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Restaurant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-base placeholder-gray-500 text-gray-900"
                placeholder="Enter restaurant name"
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-base placeholder-gray-500 text-gray-900"
                placeholder="Enter full address"
                required
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-base placeholder-gray-500 text-gray-900"
                placeholder="Enter a description of the restaurant"
                rows={3}
              />
            </div>
          </div>

          {/* Cuisine and Price */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Cuisine & Price</h3>
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Cuisine Type
              </label>
              <select
                value={formData.cuisineType}
                onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value as CuisineType })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-base text-gray-900"
                required
              >
                {Object.values(CuisineType).map((type) => (
                  <option key={type} value={type} className="text-gray-900">
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-900 mb-2">
                Price Range
              </label>
              <select
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value as PriceRange })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-base text-gray-900"
                required
              >
                {Object.values(PriceRange).map((range) => (
                  <option key={range} value={range} className="text-gray-900">
                    {range}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Features</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasPrayerRoom"
                  checked={formData.hasPrayerRoom}
                  onChange={(e) => setFormData({ ...formData, hasPrayerRoom: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="hasPrayerRoom" className="ml-3 block text-base text-gray-900">
                  Prayer Room Available
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasOutdoorSeating"
                  checked={formData.hasOutdoorSeating}
                  onChange={(e) => setFormData({ ...formData, hasOutdoorSeating: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="hasOutdoorSeating" className="ml-3 block text-base text-gray-900">
                  Outdoor Seating
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasHighChair"
                  checked={formData.hasHighChair}
                  onChange={(e) => setFormData({ ...formData, hasHighChair: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="hasHighChair" className="ml-3 block text-base text-gray-900">
                  High Chair Available
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="servesAlcohol"
                  checked={formData.servesAlcohol}
                  onChange={(e) => setFormData({ ...formData, servesAlcohol: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="servesAlcohol" className="ml-3 block text-base text-gray-900">
                  Serves Alcohol
                </label>
              </div>
            </div>
          </div>

          {/* Halal Status */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Halal Status</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFullyHalal"
                  checked={formData.isFullyHalal}
                  onChange={(e) => setFormData({ ...formData, isFullyHalal: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="isFullyHalal" className="ml-3 block text-base text-gray-900">
                  Fully Halal
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isZabiha"
                  checked={formData.isZabiha}
                  onChange={(e) => setFormData({ ...formData, isZabiha: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="isZabiha" className="ml-3 block text-base text-gray-900">
                  Zabiha
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPartiallyHalal"
                  checked={formData.isPartiallyHalal}
                  onChange={(e) => setFormData({ ...formData, isPartiallyHalal: e.target.checked })}
                  className="h-5 w-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
                />
                <label htmlFor="isPartiallyHalal" className="ml-3 block text-base text-yellow-700">
                  Partially Halal
                </label>
              </div>
            </div>
          </div>

          {/* Zabiha Meat Options */}
          {formData.isZabiha && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Zabiha Meat Options</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="zabihaChicken"
                    checked={formData.zabihaChicken}
                    onChange={(e) => setFormData({ ...formData, zabihaChicken: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="zabihaChicken" className="ml-3 block text-base text-gray-900">
                    Chicken
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="zabihaLamb"
                    checked={formData.zabihaLamb}
                    onChange={(e) => setFormData({ ...formData, zabihaLamb: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="zabihaLamb" className="ml-3 block text-base text-gray-900">
                    Lamb
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="zabihaBeef"
                    checked={formData.zabihaBeef}
                    onChange={(e) => setFormData({ ...formData, zabihaBeef: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="zabihaBeef" className="ml-3 block text-base text-gray-900">
                    Beef
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="zabihaGoat"
                    checked={formData.zabihaGoat}
                    onChange={(e) => setFormData({ ...formData, zabihaGoat: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="zabihaGoat" className="ml-3 block text-base text-gray-900">
                    Goat
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Partially Halal Meat Options */}
          {formData.isPartiallyHalal && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-yellow-700">
                Partially Halal Meat Options <span className="text-red-500">*</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="partiallyHalalChicken"
                    checked={formData.partiallyHalalChicken}
                    onChange={(e) => setFormData({ ...formData, partiallyHalalChicken: e.target.checked })}
                    className="h-5 w-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
                  />
                  <label htmlFor="partiallyHalalChicken" className="ml-3 block text-base text-yellow-700">
                    Chicken
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="partiallyHalalLamb"
                    checked={formData.partiallyHalalLamb}
                    onChange={(e) => setFormData({ ...formData, partiallyHalalLamb: e.target.checked })}
                    className="h-5 w-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
                  />
                  <label htmlFor="partiallyHalalLamb" className="ml-3 block text-base text-yellow-700">
                    Lamb
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="partiallyHalalBeef"
                    checked={formData.partiallyHalalBeef}
                    onChange={(e) => setFormData({ ...formData, partiallyHalalBeef: e.target.checked })}
                    className="h-5 w-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
                  />
                  <label htmlFor="partiallyHalalBeef" className="ml-3 block text-base text-yellow-700">
                    Beef
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="partiallyHalalGoat"
                    checked={formData.partiallyHalalGoat}
                    onChange={(e) => setFormData({ ...formData, partiallyHalalGoat: e.target.checked })}
                    className="h-5 w-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
                  />
                  <label htmlFor="partiallyHalalGoat" className="ml-3 block text-base text-yellow-700">
                    Goat
                  </label>
                </div>
              </div>
              {error && (
                <div className="text-red-600 text-sm font-medium mt-2">{error}</div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-base font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-base font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 