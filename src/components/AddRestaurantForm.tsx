import { useState, useEffect, useRef } from 'react';
import { CuisineType, PriceRange } from '@prisma/client';
import toast from 'react-hot-toast';
import { XMarkIcon, BuildingStorefrontIcon, ExclamationTriangleIcon, PhotoIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { formatCuisineName } from '@/utils/formatCuisineName';
import { formatPriceRange } from '@/utils/formatPriceRange';
import { useLoadScript } from '@react-google-maps/api';
import { Libraries } from '@react-google-maps/api/dist/utils/make-load-script-url';
import Image from 'next/image';

// Define libraries array as a constant outside the component
const libraries: Libraries = ['places'];

interface AddRestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onRestaurantAdded?: () => void;
}

interface FormData {
  name: string;
  cuisineType: CuisineType | '';
  address: string;
  priceRange: PriceRange | '';
  description: string;
  hasPrayerRoom: boolean;
  hasOutdoorSeating: boolean;
  isZabiha: boolean;
  hasHighChair: boolean;
  servesAlcohol: boolean;
  isFullyHalal: boolean;
  zabihaChicken: boolean;
  zabihaLamb: boolean;
  zabihaBeef: boolean;
  zabihaGoat: boolean;
  zabihaVerified?: Date | null;
  zabihaVerifiedBy?: string;
  image?: File;
  isPartiallyHalal: boolean;
  partiallyHalalChicken: boolean;
  partiallyHalalLamb: boolean;
  partiallyHalalBeef: boolean;
  partiallyHalalGoat: boolean;
}

const initialFormState: FormData = {
  name: '',
  cuisineType: '',
  address: '',
  priceRange: '',
  description: '',
  hasPrayerRoom: false,
  hasOutdoorSeating: false,
  isZabiha: false,
  hasHighChair: false,
  servesAlcohol: false,
  isFullyHalal: false,
  zabihaChicken: false,
  zabihaLamb: false,
  zabihaBeef: false,
  zabihaGoat: false,
  zabihaVerified: undefined,
  zabihaVerifiedBy: '',
  image: undefined,
  isPartiallyHalal: false,
  partiallyHalalChicken: false,
  partiallyHalalLamb: false,
  partiallyHalalBeef: false,
  partiallyHalalGoat: false,
};

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

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

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    if (isLoaded && !placesService.current) {
      // Create a temporary div for the PlacesService
      const tempNode = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(tempNode);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setHasChanges(false); // Reset changes flag when form opens
    }
  }, [isOpen]);

  // Track form changes
  useEffect(() => {
    const hasFormChanges = Object.entries(formData).some(([key, value]) => {
      return value !== initialFormState[key as keyof typeof initialFormState];
    }) || halalVerificationConsent;

    setHasChanges(hasFormChanges);
  }, [formData, halalVerificationConsent]);

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
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleConfirmClose = () => {
    closeForm();
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Please upload an image file');
          return;
        }
        // Validate file size (5MB limit)
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
        
        // Clear interval and set progress to 100
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

  const handleAddressChange = async (value: string) => {
    if (!isLoaded || value.trim() === '') {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const request: google.maps.places.AutocompletionRequest = {
        input: value,
        componentRestrictions: { country: 'us' },
        types: ['address'],
      };

      const session = new google.maps.places.AutocompleteSessionToken();
      const service = new google.maps.places.AutocompleteService();
      
      const predictions = await service.getPlacePredictions({
        ...request,
        sessionToken: session,
      });

      setAddressSuggestions(predictions.predictions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddressSelect = async (suggestion: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return;

    try {
      const placeResult = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        placesService.current?.getDetails(
          {
            placeId: suggestion.place_id,
            fields: ['formatted_address'],
          },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              resolve(place);
            } else {
              reject(new Error('Failed to get place details'));
            }
          }
        );
      });

      setFormData((prev) => ({
        ...prev,
        address: placeResult.formatted_address || suggestion.description,
      }));
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error getting place details:', error);
      // Fallback to using the suggestion description
      setFormData((prev) => ({
        ...prev,
        address: suggestion.description,
      }));
      setShowSuggestions(false);
    }
  };

  const validateForm = (): string | null => {
    if (formData.name.trim().length === 0) {
      return 'Restaurant name is required';
    }
    if (formData.name.length > MAX_NAME_LENGTH) {
      return `Restaurant name must be less than ${MAX_NAME_LENGTH} characters`;
    }
    if (formData.description && formData.description.length > MAX_DESCRIPTION_LENGTH) {
      return `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }
    if (!formData.cuisineType) {
      return 'Please select a cuisine type';
    }
    if (!formData.priceRange) {
      return 'Please select a price range';
    }
    if (!formData.address.trim()) {
      return 'Address is required';
    }
    if (formData.isZabiha) {
      if (!formData.zabihaVerified) {
        return 'Verification Date is required for Zabiha Certified restaurants';
      }
      if (formData.zabihaVerified && formData.zabihaVerified > new Date()) {
        return 'Verification Date cannot be in the future';
      }
      if (!formData.zabihaVerifiedBy?.trim()) {
        return 'Verified By is required for Zabiha Certified restaurants';
      }
      if (!formData.zabihaChicken && !formData.zabihaLamb && !formData.zabihaBeef && !formData.zabihaGoat) {
        return 'Please select at least one Zabiha meat type';
      }
    }
    if (formData.isPartiallyHalal) {
      if (!formData.partiallyHalalChicken && !formData.partiallyHalalLamb && !formData.partiallyHalalBeef && !formData.partiallyHalalGoat) {
        return 'Please select at least one Partially Halal meat type';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      // Scroll to top when there's an error
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
        console.error('Error response:', errorData);
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
      console.error('Error adding restaurant:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add restaurant. Please try again.';
      
      if (errorMessage.includes('name already exists')) {
        document.getElementById('name')?.focus();
      } else if (errorMessage.includes('address already exists')) {
        document.getElementById('address')?.focus();
      }
      
      setError(errorMessage);
      // Scroll to top when there's an error
      modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      
      toast.error(errorMessage, {
        id: 'error-toast',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
        data-testid="add-restaurant-modal-backdrop"
      >
        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
            onClick={(e) => e.stopPropagation()}
            data-testid="confirm-dialog-backdrop"
          >
            <div 
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 transform transition-all"
              data-testid="confirm-dialog"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold text-gray-900"
                    data-testid="confirm-dialog-title"
                  >
                    Discard Changes?
                  </h3>
                  <p 
                    className="mt-2 text-sm text-gray-600"
                    data-testid="confirm-dialog-message"
                  >
                    You have unsaved changes. Are you sure you want to close this form? Your changes will be lost.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={handleConfirmClose}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer"
                      data-testid="confirm-dialog-discard"
                    >
                      Yes, Discard
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelClose}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                      data-testid="confirm-dialog-keep-editing"
                    >
                      No, Keep Editing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div 
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          onClick={e => e.stopPropagation()}
          data-testid="add-restaurant-modal-panel"
        >
          {/* Header - Fixed at top */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 rounded-t-2xl bg-gradient-to-r from-orange-50 to-amber-50" data-testid="add-restaurant-modal-header">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl text-white">
                  <BuildingStorefrontIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New Restaurant</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Help others discover great halal restaurants in Atlanta
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                data-testid="close-modal-button"
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div ref={modalContentRef} className="flex-1 overflow-y-auto p-6">
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
            <form id="restaurant-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4" data-testid="basic-info-section">
                <h3 className="text-base font-semibold text-gray-900 px-1 mb-2 tracking-wide" data-testid="basic-info-header">Basic Information</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5 px-1">
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    data-testid="restaurant-name-input"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors placeholder-gray-500 text-gray-900"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter restaurant name"
                    maxLength={MAX_NAME_LENGTH}
                    required
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-500">
                      {formData.name.length}/{MAX_NAME_LENGTH}
                    </span>
                  </div>
                  {error && error.toLowerCase().includes('name') && (
                    <p className="mt-1 text-xs text-red-600 px-1" data-testid="name-error">
                      {error}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cuisineType" className="block text-sm font-medium text-gray-700 mb-1 px-1">
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
                      {Object.values(CuisineType).map((type) => (
                        <option key={type} value={type}>
                          {formatCuisineName(type)}
                        </option>
                      ))}
                    </select>
                    {error && error.toLowerCase().includes('cuisine') && (
                      <p className="mt-1 text-xs text-red-600 px-1" data-testid="cuisine-error">
                        {error}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1 px-1">
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
                          {formatPriceRange(range)}
                        </option>
                      ))}
                    </select>
                    {error && error.toLowerCase().includes('price') && (
                      <p className="mt-1 text-xs text-red-600 px-1" data-testid="price-error">
                        {error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 px-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="address"
                      id="address"
                      data-testid="restaurant-address-input"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors placeholder-gray-500 text-gray-900 pl-10"
                      value={formData.address}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, address: e.target.value }));
                        handleAddressChange(e.target.value);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Start typing the restaurant address..."
                      required
                    />
                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-auto">
                      {addressSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.place_id}
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 focus:bg-orange-50 focus:outline-none transition-colors border-b border-gray-100 last:border-0"
                          onClick={() => handleAddressSelect(suggestion)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{suggestion.structured_formatting.main_text}</span>
                            <span className="text-gray-500 text-xs mt-0.5">{suggestion.structured_formatting.secondary_text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {error && (error.toLowerCase().includes('state') || error.toLowerCase().includes('address')) && (
                    <p className="mt-1 text-xs text-red-600 px-1" data-testid="address-error">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* Restaurant Features Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4" data-testid="features-section">
                <h3 className="text-base font-semibold text-gray-900 px-1 mb-2 tracking-wide" data-testid="features-header">Restaurant Features</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prayer Space */}
                  <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="hasPrayerRoom"
                        id="hasPrayerRoom"
                        data-testid="restaurant-prayer-room-checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                        checked={formData.hasPrayerRoom}
                        onChange={(e) => setFormData({ ...formData, hasPrayerRoom: e.target.checked })}
                      />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Prayer Space</span>
                      <p className="text-xs text-gray-500 mt-0.5">Dedicated prayer space available</p>
                    </div>
                  </label>

                  {/* Outdoor Seating */}
                  <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="hasOutdoorSeating"
                        id="hasOutdoorSeating"
                        data-testid="restaurant-outdoor-seating-checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                        checked={formData.hasOutdoorSeating}
                        onChange={(e) => setFormData({ ...formData, hasOutdoorSeating: e.target.checked })}
                      />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Outdoor Seating</span>
                      <p className="text-xs text-gray-500 mt-0.5">Outdoor dining area available</p>
                    </div>
                  </label>

                  {/* Zabiha Status */}
                  <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="isZabiha"
                        id="isZabiha"
                        data-testid="restaurant-zabiha-checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                        checked={formData.isZabiha}
                        onChange={(e) => setFormData({ ...formData, isZabiha: e.target.checked })}
                      />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Zabiha Certified (hand-cut)</span>
                      <p className="text-xs text-gray-500 mt-0.5">Serves certified zabiha meat</p>
                    </div>
                  </label>

                  {/* High Chair */}
                  <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="hasHighChair"
                        id="hasHighChair"
                        data-testid="restaurant-high-chair-checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                        checked={formData.hasHighChair}
                        onChange={(e) => setFormData({ ...formData, hasHighChair: e.target.checked })}
                      />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">High Chairs</span>
                      <p className="text-xs text-gray-500 mt-0.5">Child seating available</p>
                    </div>
                  </label>

                  {/* Serves Alcohol */}
                  <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="servesAlcohol"
                        id="servesAlcohol"
                        data-testid="restaurant-alcohol-checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                        checked={formData.servesAlcohol}
                        onChange={(e) => {
                          const servesAlcohol = e.target.checked;
                          setFormData({ 
                            ...formData, 
                            servesAlcohol,
                            // If alcohol is checked, ensure fully halal is unchecked
                            isFullyHalal: servesAlcohol ? false : formData.isFullyHalal 
                          });
                        }}
                      />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Serves Alcohol</span>
                      <p className="text-xs text-gray-500 mt-0.5">Restaurant serves alcoholic beverages</p>
                    </div>
                  </label>

                  {/* Fully Halal Menu */}
                  <label className={`relative flex items-start p-3 rounded-lg border border-gray-200 ${!formData.servesAlcohol ? 'hover:border-orange-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'} transition-colors`}>
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="isFullyHalal"
                        id="isFullyHalal"
                        data-testid="restaurant-fully-halal-checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        checked={formData.isFullyHalal}
                        onChange={(e) => setFormData({ ...formData, isFullyHalal: e.target.checked, isPartiallyHalal: e.target.checked ? false : formData.isPartiallyHalal })}
                        disabled={formData.servesAlcohol || formData.isPartiallyHalal}
                      />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Fully Halal Menu</span>
                      <p className="text-xs text-gray-500 mt-0.5">All menu items are halal</p>
                      {formData.servesAlcohol && (
                        <p className="text-xs text-orange-600 mt-1">Cannot be fully halal if alcohol is served</p>
                      )}
                      {formData.isPartiallyHalal && (
                        <p className="text-xs text-orange-600 mt-1">Cannot select both Fully Halal and Partially Halal</p>
                      )}
                    </div>
                  </label>

                  {/* Partially Halal */}
                  <label className="relative flex items-start p-3 rounded-lg border border-blue-200 hover:border-blue-400 cursor-pointer transition-colors">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="isPartiallyHalal"
                        id="isPartiallyHalal"
                        data-testid="restaurant-partially-halal-checkbox"
                        className="h-4 w-4 rounded border-blue-400 text-blue-600 focus:ring-blue-500 transition-colors"
                        checked={formData.isPartiallyHalal}
                        onChange={(e) => setFormData({ ...formData, isPartiallyHalal: e.target.checked, isFullyHalal: e.target.checked ? false : formData.isFullyHalal })}
                        disabled={formData.isFullyHalal}
                      />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Partially Halal</span>
                      <p className="text-xs text-gray-500 mt-0.5">Some meats on the menu are halal</p>
                      {formData.isFullyHalal && (
                        <p className="text-xs text-orange-600 mt-1">Cannot select both Fully Halal and Partially Halal</p>
                      )}
                    </div>
                  </label>
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

                {formData.isZabiha && (
                  <div className="space-y-4 mt-4 p-4 bg-white rounded-lg border border-orange-100">
                    <div className="text-sm font-medium text-gray-700">Zabiha Details</div>
                    
                    {/* Zabiha Meat Types */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Available Zabiha Meat: <span className="text-red-500">*</span></div>
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
                      {error && error.toLowerCase().includes('zabiha meat type') && (
                        <p className="mt-1 text-xs text-red-600" data-testid="zabiha-meat-error">
                          {error}
                        </p>
                      )}
                    </div>

                    {/* Zabiha Verification */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Verification Details:</div>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="zabihaVerified" className="block text-sm text-gray-600 mb-1">
                            Verification Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              id="zabihaVerified"
                              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm cursor-pointer text-gray-900 [color-scheme:light]"
                              value={formData.zabihaVerified ? new Date(formData.zabihaVerified).toISOString().split('T')[0] : ''}
                              max={new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0]}
                              onChange={(e) => {
                                const selectedDate = e.target.value ? new Date(e.target.value) : null;
                                const today = new Date(new Date().setHours(0, 0, 0, 0));
                                
                                // Only set the date if it's not in the future
                                if (selectedDate && selectedDate > today) {
                                  return; // Ignore future dates
                                }
                                
                                setFormData({ ...formData, zabihaVerified: selectedDate });
                              }}
                              onClick={(e) => {
                                (e.target as HTMLInputElement).showPicker();
                              }}
                              required={formData.isZabiha}
                            />
                          </div>
                          {error && error.toLowerCase().includes('verification date') && (
                            <p className="mt-1 text-xs text-red-600" data-testid="verification-date-error">
                              {error}
                            </p>
                          )}
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
                          {error && error.toLowerCase().includes('verified by') && (
                            <p className="mt-1 text-xs text-red-600" data-testid="verified-by-error">
                              {error}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4" data-testid="additional-info-section">
                <h3 className="text-base font-semibold text-gray-900 px-1 mb-2 tracking-wide" data-testid="additional-info-header">Additional Information</h3>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5 px-1">
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
                    <span className="text-xs text-gray-500">
                      Optional
                    </span>
                    <span className="text-xs text-gray-500">
                      {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                    </span>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4" data-testid="image-upload-section">
                <h3 className="text-base font-semibold text-gray-900 px-1 mb-2 tracking-wide">Restaurant Image</h3>
                
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
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
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setFormData({ ...formData, image: undefined });
                            }}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 transition-colors"
                          >
                            Remove Image
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500">
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
              <div className="bg-orange-50 rounded-xl p-4" data-testid="verification-section">
                <label 
                  htmlFor="halalVerification" 
                  className="flex items-start cursor-pointer"
                >
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="halalVerification"
                      name="halalVerification"
                      type="checkbox"
                      data-testid="halal-verification-checkbox"
                      checked={halalVerificationConsent}
                      onChange={(e) => setHalalVerificationConsent(e.target.checked)}
                      className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500 transition-colors"
                    />
                  </div>
                  <div className="ml-3">
                    <span className="text-sm font-semibold text-gray-900">
                      Halal Verification <span className="text-red-500">*</span>
                    </span>
                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                      I confirm that I have personally verified this restaurant serves halal meat and I am adding it in good faith to help the community.
                    </p>
                    <p className="text-xs text-orange-600 mt-2 font-medium">
                      Please check this box to confirm and continue with submission
                    </p>
                  </div>
                </label>
              </div>
            </form>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="sticky bottom-0 z-10 bg-white border-t border-gray-100 p-6 rounded-b-2xl" data-testid="add-restaurant-modal-footer">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                data-testid="cancel-restaurant-button"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="restaurant-form"
                data-testid="submit-restaurant-button"
                disabled={isSubmitting || !halalVerificationConsent}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add Restaurant'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 