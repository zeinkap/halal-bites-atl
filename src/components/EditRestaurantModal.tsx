'use client';

import { type Restaurant, CuisineType, PriceRange } from '@prisma/client';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { CloseButton } from './ui/Button';
import { Button } from './ui/Button';
import { useModalContext } from './ui/ModalContext';
import { useLoadScript } from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api/dist/utils/make-load-script-url';

interface EditRestaurantModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const libraries: Libraries = ['places'];

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

  const { setAnyModalOpen } = useModalContext();

  const [addressSuggestions, setAddressSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    setAnyModalOpen(isOpen);
    return () => setAnyModalOpen(false);
  }, [isOpen, setAnyModalOpen]);

  useEffect(() => {
    if (isLoaded && !placesService.current) {
      const tempNode = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(tempNode);
    }
  }, [isLoaded]);

  const handleAddressChange = (value: string) => {
    setFormData((prev) => ({ ...prev, address: value }));
    if (!isLoaded || !value) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const autocompleteService = new window.google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions({ input: value }, (predictions) => {
      setAddressSuggestions(predictions || []);
      setShowSuggestions(!!predictions && predictions.length > 0);
    });
  };

  const handleAddressSelect = (suggestion: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return;
    placesService.current.getDetails({ placeId: suggestion.place_id }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.formatted_address) {
        setFormData((prev) => ({ ...prev, address: place.formatted_address }));
        setShowSuggestions(false);
      }
    });
  };

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
          <CloseButton onClick={onClose} />
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
              <div className="relative">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-base placeholder-gray-500 text-gray-900"
                  placeholder="Enter full address"
                  required
                />
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-auto">
                    {addressSuggestions.map((suggestion) => (
                      <Button
                        key={suggestion.place_id}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-left px-4 py-3 text-sm hover:bg-green-50 focus:bg-green-50 focus:outline-none transition-colors border-b border-gray-100 last:border-0"
                        onClick={() => handleAddressSelect(suggestion)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{suggestion.structured_formatting.main_text}</span>
                          <span className="text-gray-500 text-xs mt-0.5">{suggestion.structured_formatting.secondary_text}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
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
              <label htmlFor="cuisineType" className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine Type <span className="text-red-500">*</span>
              </label>
              <select
                id="cuisineType"
                name="cuisineType"
                data-testid="cuisine-type-select"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors text-gray-900"
                value={formData.cuisineType}
                onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value as CuisineType })}
                required
              >
                <option value="" className="text-gray-400">Select cuisine type</option>
                {(() => {
                  const types = Object.values(CuisineType);
                  const sorted = [...types.filter(t => t !== 'OTHER').sort((a, b) => a.localeCompare(b)), 'OTHER'] as CuisineType[];
                  return sorted.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ));
                })()}
              </select>
            </div>
            <div>
              <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                Price Range <span className="text-red-500">*</span>
              </label>
              <select
                id="priceRange"
                name="priceRange"
                data-testid="price-range-select"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors text-gray-900"
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value as PriceRange })}
                required
              >
                <option value="" className="text-gray-400">Select price range</option>
                {Object.values(PriceRange).map((range) => (
                  <option key={range} value={range}>
                    {range === 'LOW' ? '$' : range === 'MEDIUM' ? '$$' : range === 'HIGH' ? '$$$' : range}
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
                  onChange={(e) => {
                    const servesAlcohol = e.target.checked;
                    setFormData({
                      ...formData,
                      servesAlcohol,
                      isFullyHalal: servesAlcohol ? false : formData.isFullyHalal
                    });
                  }}
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
                  onChange={(e) => setFormData({ ...formData, isFullyHalal: e.target.checked, isPartiallyHalal: e.target.checked ? false : formData.isPartiallyHalal })}
                  className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  disabled={formData.servesAlcohol || formData.isPartiallyHalal}
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
                  Zabihah
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

          {/* Zabihah Meat Options */}
          {formData.isZabiha && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">Zabihah Meat Options</h3>
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