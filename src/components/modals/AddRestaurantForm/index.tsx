import React, { useState, useEffect, useRef } from 'react';
import { CuisineType, PriceRange } from '@prisma/client';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useLoadScript } from '@react-google-maps/api';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import type { Libraries } from '@react-google-maps/api/dist/utils/make-load-script-url';
import { useModalContext } from '../../ui/ModalContext';
import { ConfirmationDialog } from '../../ui/ConfirmationDialog';
import { CloseButton } from '../../ui/Button';
import { HalalBadgeIcon } from '../../ui/icons';

import type { FormData } from './add-restaurant-helpers';
import {
  initialFormState,
  validateForm} from './add-restaurant-helpers';

import BasicInfoFields from './BasicInfoFields';
import CuisinePriceFields from './CuisinePriceFields';
import FeatureFields from './FeatureFields';
import HalalStatusFields from './HalalStatusFields';
import ZabihaMeatOptions from './ZabihaMeatOptions';
import PartiallyHalalMeatOptions from './PartiallyHalalMeatOptions';
import ImageUpload from './ImageUpload';

const libraries: Libraries = ['places'];

interface AddRestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onRestaurantAdded?: () => void;
}

const AddRestaurantForm: React.FC<AddRestaurantFormProps> = ({ isOpen, onClose, onRestaurantAdded }) => {
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

      // Convert zabihaVerified to ISO string if present
      const zabihaVerified = formData.zabihaVerified
        ? new Date(formData.zabihaVerified).toISOString()
        : null;

      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          zabihaVerified,
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
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
        data-testid="add-restaurant-modal-backdrop"
      >
        {/* Main Modal Card */}
        <Card
          className={`w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          onClick={e => e.stopPropagation()}
          data-testid="add-restaurant-modal-panel"
        >
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <CloseButton onClick={handleClose} />
          </div>
          {/* Modal Header */}
          <div className="pt-6 pb-2 px-6 flex flex-col items-center justify-center bg-orange-50 rounded-t-2xl">
            <div className="flex items-center gap-3 mb-1">
              <HalalBadgeIcon className="w-8 h-8" />
              <h2 className="text-2xl font-bold text-gray-900">Add New Restaurant</h2>
            </div>
            <p className="text-sm text-gray-600">Help others discover great halal restaurants in Atlanta</p>
          </div>
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
              {formData.isZabiha && (
                <ZabihaMeatOptions formData={formData} setFormData={setFormData} />
              )}
              {formData.isPartiallyHalal && (
                <PartiallyHalalMeatOptions formData={formData} setFormData={setFormData} error={error} />
              )}
              <ImageUpload
                formData={formData}
                setFormData={setFormData}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                handleImageChange={handleImageChange}
              />
              <HalalStatusFields
                halalVerificationConsent={halalVerificationConsent}
                setHalalVerificationConsent={setHalalVerificationConsent}
              />
              {/* Sticky Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-1.5 rounded-b-2xl flex justify-end gap-3 z-10">
                <Button
                  type="button"
                  onClick={handleClose}
                  data-testid="cancel-restaurant-button"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto h-12 text-xs sm:text-base rounded-lg min-w-[100px]"
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
                  className="w-full sm:w-auto h-12 text-xs sm:text-base rounded-lg min-w-[100px]"
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
};

export default AddRestaurantForm; 