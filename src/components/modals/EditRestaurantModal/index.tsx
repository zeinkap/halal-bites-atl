'use client';

import { type Restaurant } from '@prisma/client';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { CloseButton } from '../../ui/Button';
import { useModalContext } from '../../ui/ModalContext';
import { useLoadScript } from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api/dist/utils/make-load-script-url';
import { setupPlacesService } from './edit-restaurant-helpers';
import BasicInfoFields from './BasicInfoFields';
import CuisinePriceFields from './CuisinePriceFields';
import FeatureFields from './FeatureFields';
import HalalStatusFields from './HalalStatusFields';
import ZabihaMeatOptions from './ZabihaMeatOptions';
import PartiallyHalalMeatOptions from './PartiallyHalalMeatOptions';

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
    setupPlacesService(isLoaded, placesService);
  }, [isLoaded]);

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
          <BasicInfoFields
            formData={formData}
            setFormData={setFormData}
            isLoaded={isLoaded}
            addressSuggestions={addressSuggestions}
            setAddressSuggestions={setAddressSuggestions}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            placesService={placesService}
          />

          <CuisinePriceFields formData={formData} setFormData={setFormData} />

          <FeatureFields formData={formData} setFormData={setFormData} />

          <HalalStatusFields formData={formData} setFormData={setFormData} />

          {formData.isZabiha && (
            <ZabihaMeatOptions formData={formData} setFormData={setFormData} />
          )}

          {formData.isPartiallyHalal && (
            <PartiallyHalalMeatOptions formData={formData} setFormData={setFormData} error={error} />
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