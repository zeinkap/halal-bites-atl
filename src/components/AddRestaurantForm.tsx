import React, { useState, useEffect, useRef } from 'react';
import { CuisineType, PriceRange } from '@prisma/client';
import toast from 'react-hot-toast';
import { BuildingStorefrontIcon, ExclamationTriangleIcon, PhotoIcon, MapPinIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useLoadScript } from '@react-google-maps/api';
import { Card } from './ui/Card';
import { Button, CloseButton } from './ui/Button';
import type { Libraries } from '@react-google-maps/api/dist/utils/make-load-script-url';
import { useModalContext } from './ui/ModalContext';
import { ConfirmationDialog } from './ui/ConfirmationDialog';

import type { FormData } from './add-restaurant-helpers';
import {
  initialFormState,
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  validateForm,
  handleAddressChange as helperHandleAddressChange,
  handleAddressSelect as helperHandleAddressSelect
} from './add-restaurant-helpers';

const libraries: Libraries = ['places'];

interface AddRestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onRestaurantAdded?: () => void;
}

export default function AddRestaurantForm({ isOpen, onClose, onRestaurantAdded }: AddRestaurantFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [halalVerificationConsent, setHalalVerificationConsent] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [addressSuggestions, setAddressSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const { setAnyModalOpen } = useModalContext();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Google PlacesService setup
  useEffect(() => {
    if (isLoaded && !placesService.current) {
      const tempNode = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(tempNode);
    }
  }, [isLoaded]);

  // Modal open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setHasChanges(false);
    }
  }, [isOpen]);

  // Track form changes
  useEffect(() => {
    const hasFormChanges = Object.entries(formData).some(([key, value]) => {
      return value !== initialFormState[key as keyof typeof initialFormState];
    }) || halalVerificationConsent;
    setHasChanges(hasFormChanges);
  }, [formData, halalVerificationConsent]);

  // Modal close logic
  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      closeForm();
    }
  };

  const closeForm = () => {
    setIsVisible(false);
    setFormData(initialFormState);
    setHalalVerificationConsent(false);
    setError('');
    setShowConfirmDialog(false);
    setTimeout(onClose, 300);
  };

  const handleConfirmClose = () => {
    closeForm();
  };

  // Image upload handler
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (!file.type.startsWith('image/')) {
          toast.error('Please upload an image file');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image size should be less than 5MB');
          return;
        }
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        setFormData({ ...formData, image: file });

        setTimeout(() => {
          clearInterval(progressInterval);
          setUploadProgress(100);
          setIsUploading(false);
        }, 1500);

      } catch (error) {
        console.error('Error handling image:', error);
        toast.error('Failed to process image. Please try again.');
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  // Address autocomplete (debounced)
  const handleAddressChange = (value: string) => {
    helperHandleAddressChange(value, isLoaded, setAddressSuggestions, setShowSuggestions);
  };

  // Address select
  const handleAddressSelect = (suggestion: google.maps.places.AutocompletePrediction) => {
    helperHandleAddressSelect(suggestion, placesService.current, setFormData, setShowSuggestions);
  };

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      let imageUrl = '/images/logo.png';

      // Upload image if provided
      if (formData.image) {
        const formDataWithImage = new FormData();
        formDataWithImage.append('image', formData.image);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataWithImage,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await uploadResponse.json();
        imageUrl = url;
      }

      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          cuisineType: formData.cuisineType as CuisineType,
          priceRange: formData.priceRange as PriceRange
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let userFriendlyError = errorData.error || 'Failed to add restaurant';
        if (userFriendlyError.includes('Unique constraint failed on the fields: (`name`)')) {
          userFriendlyError = 'A restaurant with this name already exists. Please choose a different name.';
        }
        throw new Error(userFriendlyError);
      }

      const restaurantName = formData.name;

      toast.success(`Restaurant "${restaurantName}" was successfully added!`, {
        id: 'success-toast',
        duration: 3000,
      });

      setFormData(initialFormState);
      setHalalVerificationConsent(false);
      setIsVisible(false);

      setTimeout(() => {
        onClose();
        onRestaurantAdded?.();
      }, 3000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add restaurant. Please try again.';
      if (errorMessage.includes('name already exists')) {
        document.getElementById('name')?.focus();
      } else if (errorMessage.includes('address already exists')) {
        document.getElementById('address')?.focus();
      }
      setError(errorMessage);
      modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      toast.error(errorMessage, {
        id: 'error-toast',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setAnyModalOpen(isOpen);
    return () => setAnyModalOpen(false);
  }, [isOpen, setAnyModalOpen]);

  if (!isOpen) return null;

  return (
    <>
      <ConfirmationDialog
        open={showConfirmDialog}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to close this form? Your changes will be lost."
        onConfirm={handleConfirmClose}
        onCancel={() => setShowConfirmDialog(false)}
      />
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={handleClose}
        data-testid="add-restaurant-modal-backdrop"
      >
        {/* Main Modal Card */}
        <Card
          className={`w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          onClick={e => e.stopPropagation()}
          data-testid="add-restaurant-modal-panel"
        >
          {/* Sticky Header */}
          <Card.Header className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 rounded-t-2xl bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl text-white">
                  <BuildingStorefrontIcon className="h-6 w-6" />
                </div>
                <div>
                  <Card.Title className="text-2xl font-bold text-gray-900">Add New Restaurant</Card.Title>
                  <Card.Description className="text-sm text-gray-600 mt-1">
                    Help others discover great halal restaurants in Atlanta
                  </Card.Description>
                </div>
              </div>
              <CloseButton
                onClick={handleClose}
                data-testid="close-modal-button"
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              />
            </div>
          </Card.Header>

          {/* Scrollable Content */}
          <div ref={modalContentRef} className="flex-1 overflow-y-auto max-h-[70vh] p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4" data-testid="form-error">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following error:
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form id="restaurant-form" onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    data-testid="restaurant-name-input"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-12 py-3 px-4 transition-colors placeholder-gray-500 text-gray-900 mb-4"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter restaurant name"
                    maxLength={MAX_NAME_LENGTH}
                    required
                  />
                  {error && error.toLowerCase().includes('name') && (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                  )}
                </div>
                {/* Cuisine & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            {type.replace(/_/g, ' ').toLowerCase().replace(/^\w|\s\w/g, l => l.toUpperCase())}
                          </option>
                        ));
                      })()}
                    </select>
                    {error && error.toLowerCase().includes('cuisine') && (
                      <p className="mt-1 text-xs text-red-600">{error}</p>
                    )}
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
                    {error && error.toLowerCase().includes('price') && (
                      <p className="mt-1 text-xs text-red-600">{error}</p>
                    )}
                  </div>
                </div>
                {/* Address */}
                <div className="relative">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="address"
                      id="address"
                      data-testid="restaurant-address-input"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-12 py-3 pl-10 pr-4 transition-colors placeholder-gray-500 text-gray-900 mb-4"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, address: e.target.value }));
                        handleAddressChange(e.target.value);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Start typing the restaurant address..."
                      required
                    />
                    <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-auto">
                      {addressSuggestions.map((suggestion) => (
                        <Button
                          key={suggestion.place_id}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 focus:bg-orange-50 focus:outline-none transition-colors border-b border-gray-100 last:border-0"
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
                  {error && (error.toLowerCase().includes('state') || error.toLowerCase().includes('address')) && (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                  )}
                </div>
              </div>

              {/* Features Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurant Features</h3>
                {/* Two-column flexbox for mobile, grid for desktop */}
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-row gap-4 sm:contents">
                    <div className="flex-1 flex flex-col gap-4">
                  {/* Prayer Space */}
                  <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name="hasPrayerRoom"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                      checked={formData.hasPrayerRoom}
                      onChange={(e) => setFormData({ ...formData, hasPrayerRoom: e.target.checked })}
                    />
                        <span className="ml-3 text-sm text-gray-900">Prayer Space</span>
                  </label>
                  {/* Zabihah Status */}
                  <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name="isZabiha"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                      checked={formData.isZabiha}
                      onChange={(e) => setFormData({ ...formData, isZabiha: e.target.checked })}
                    />
                        <span className="ml-3 text-sm text-gray-900">Zabihah Certified (hand-cut)</span>
                  </label>
                  {/* Serves Alcohol */}
                  <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name="servesAlcohol"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                      checked={formData.servesAlcohol}
                      onChange={(e) => {
                        const servesAlcohol = e.target.checked;
                        setFormData({
                          ...formData,
                          servesAlcohol,
                          isFullyHalal: servesAlcohol ? false : formData.isFullyHalal
                        });
                      }}
                    />
                        <span className="ml-3 text-sm text-gray-900">Serves Alcohol</span>
                      </label>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                      {/* Outdoor Seating */}
                      <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          name="hasOutdoorSeating"
                          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                          checked={formData.hasOutdoorSeating}
                          onChange={(e) => setFormData({ ...formData, hasOutdoorSeating: e.target.checked })}
                        />
                        <span className="ml-3 text-sm text-gray-900">Outdoor Seating</span>
                      </label>
                      {/* High Chair */}
                      <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          name="hasHighChair"
                          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                          checked={formData.hasHighChair}
                          onChange={(e) => setFormData({ ...formData, hasHighChair: e.target.checked })}
                        />
                        <span className="ml-3 text-sm text-gray-900">High Chairs</span>
                  </label>
                  {/* Fully Halal Menu */}
                  <label className={`relative flex items-start p-3 rounded-lg border border-gray-200 ${!formData.servesAlcohol ? 'hover:border-orange-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'} transition-colors`}>
                    <input
                      type="checkbox"
                      name="isFullyHalal"
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      checked={formData.isFullyHalal}
                      onChange={(e) => setFormData({ ...formData, isFullyHalal: e.target.checked, isPartiallyHalal: e.target.checked ? false : formData.isPartiallyHalal })}
                      disabled={formData.servesAlcohol || formData.isPartiallyHalal}
                    />
                        <span className="ml-3 text-sm text-gray-900">Fully Halal Menu</span>
                  </label>
                  {/* Partially Halal */}
                  <label className="relative flex items-start p-3 rounded-lg border border-blue-200 hover:border-blue-400 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      name="isPartiallyHalal"
                      className="h-4 w-4 rounded border-blue-400 text-blue-600 focus:ring-blue-500 transition-colors"
                      checked={formData.isPartiallyHalal}
                      onChange={(e) => setFormData({ ...formData, isPartiallyHalal: e.target.checked, isFullyHalal: e.target.checked ? false : formData.isFullyHalal })}
                      disabled={formData.isFullyHalal}
                    />
                        <span className="ml-3 text-sm text-gray-900">Partially Halal</span>
                  </label>
                    </div>
                  </div>
                  {/* On desktop, use grid-cols-2 for more columns */}
                  <div className="hidden sm:block" />
                </div>
                {/* Partially Halal Details */}
                {formData.isPartiallyHalal && (
                  <div className="space-y-4 mt-4 p-4 bg-white rounded-lg border border-blue-100">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Halal Meat Types Available: <span className="text-red-500">*</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          className="rounded border-blue-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          checked={formData.partiallyHalalChicken}
                          onChange={(e) => setFormData({ ...formData, partiallyHalalChicken: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-700">Chicken</span>
                      </label>
                      <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          className="rounded border-blue-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          checked={formData.partiallyHalalLamb}
                          onChange={(e) => setFormData({ ...formData, partiallyHalalLamb: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-700">Lamb</span>
                      </label>
                      <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          className="rounded border-blue-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          checked={formData.partiallyHalalBeef}
                          onChange={(e) => setFormData({ ...formData, partiallyHalalBeef: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-700">Beef</span>
                      </label>
                      <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          className="rounded border-blue-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          checked={formData.partiallyHalalGoat}
                          onChange={(e) => setFormData({ ...formData, partiallyHalalGoat: e.target.checked })}
                        />
                        <span className="ml-2 text-sm text-gray-700">Goat</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Zabihah Details */}
                {formData.isZabiha && (
                  <div className="space-y-4 mt-4 p-4 bg-white rounded-lg border border-orange-100">
                    <div className="text-sm font-medium text-gray-700">Zabihah Details</div>
                    {/* Zabihah Meat Types */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Available Zabihah Meat: <span className="text-red-500">*</span></div>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                            checked={formData.zabihaChicken}
                            onChange={(e) => setFormData({ ...formData, zabihaChicken: e.target.checked })}
                          />
                          <span className="ml-2 text-sm text-gray-600">Chicken</span>
                        </label>
                        <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                            checked={formData.zabihaLamb}
                            onChange={(e) => setFormData({ ...formData, zabihaLamb: e.target.checked })}
                          />
                          <span className="ml-2 text-sm text-gray-600">Lamb</span>
                        </label>
                        <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                            checked={formData.zabihaBeef}
                            onChange={(e) => setFormData({ ...formData, zabihaBeef: e.target.checked })}
                          />
                          <span className="ml-2 text-sm text-gray-600">Beef</span>
                        </label>
                        <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                            checked={formData.zabihaGoat}
                            onChange={(e) => setFormData({ ...formData, zabihaGoat: e.target.checked })}
                          />
                          <span className="ml-2 text-sm text-gray-600">Goat</span>
                        </label>
                      </div>
                    </div>
                    {/* Zabihah Verification */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Verification Details:</div>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="zabihaVerified" className="block text-sm text-gray-600 mb-1">
                            Verification Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            id="zabihaVerified"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm cursor-pointer text-gray-900 [color-scheme:light]"
                            value={formData.zabihaVerified ? new Date(formData.zabihaVerified).toISOString().split('T')[0] : ''}
                            max={new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0]}
                            onChange={(e) => {
                              const selectedDate = e.target.value ? new Date(e.target.value) : null;
                              const today = new Date(new Date().setHours(0, 0, 0, 0));
                              if (selectedDate && selectedDate > today) return;
                              setFormData({ ...formData, zabihaVerified: selectedDate });
                            }}
                            required={formData.isZabiha}
                          />
                        </div>
                        <div>
                          <label htmlFor="zabihaVerifiedBy" className="block text-sm text-gray-600 mb-1">
                            Verified By <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="zabihaVerifiedBy"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm text-gray-900 placeholder:text-gray-500"
                            placeholder="e.g., Restaurant Management, Local Imam"
                            value={formData.zabihaVerifiedBy || ''}
                            onChange={(e) => setFormData({ ...formData, zabihaVerifiedBy: e.target.value })}
                            required={formData.isZabiha}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Description Section */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h3>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      data-testid="restaurant-description-input"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors placeholder-gray-500 text-gray-900"
                      placeholder="Tell us about the restaurant's specialties, atmosphere, or any other notable features..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Optional</span>
                      <span className="text-xs text-gray-500">{formData.description.length}/{MAX_DESCRIPTION_LENGTH}</span>
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurant Image</h3>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="relative flex flex-col items-center justify-center w-full h-40 sm:h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors p-2 sm:p-0"
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                        </div>
                      ) : formData.image ? (
                        <>
                          <Image
                            src={URL.createObjectURL(formData.image)}
                            alt="Restaurant preview"
                            fill
                            className="object-cover rounded-lg"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-white text-sm mb-2">Click to change image</p>
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setFormData({ ...formData, image: undefined });
                              }}
                              className="px-3 py-1 text-xs rounded-full hover:bg-red-700 transition-colors"
                              variant="danger"
                            >
                              Remove Image
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-2 pb-3 sm:pt-5 sm:pb-6">
                          <PhotoIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-2 sm:mb-3" />
                          <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        data-testid="restaurant-image-input"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>

                {/* Verification Section */}
                <div className="bg-orange-50 rounded-xl p-4">
                  <label htmlFor="halalVerification" className="flex items-start cursor-pointer text-base">
                    <input
                      id="halalVerification"
                      name="halalVerification"
                      type="checkbox"
                      data-testid="halal-verification-checkbox"
                      checked={halalVerificationConsent}
                      onChange={(e) => setHalalVerificationConsent(e.target.checked)}
                      className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500 transition-colors mt-1"
                    />
                    <span className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">
                        Halal Verification <span className="text-red-500">*</span>
                      </span>
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                        I confirm that I have personally verified this restaurant serves halal meat and I am adding it in good faith to help the community.
                      </p>
                      <p className="text-xs text-orange-600 mt-2 font-medium">
                        Please check this box to confirm and continue with submission
                      </p>
                    </span>
                  </label>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-1.5 rounded-b-2xl flex justify-end gap-3 z-10">
                <Button
                  type="button"
                  onClick={handleClose}
                  data-testid="cancel-restaurant-button"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto h-12 text-base rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="restaurant-form"
                  data-testid="submit-restaurant-button"
                  disabled={isSubmitting || !halalVerificationConsent}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto h-12 text-xs rounded-lg min-w-[100px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Adding...
                    </span>
                  ) : (
                    'Add Restaurant'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}