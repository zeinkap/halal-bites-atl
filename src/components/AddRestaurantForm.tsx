import { useState, useEffect } from 'react';
import { CuisineType, PriceRange } from '@prisma/client';
import { toast, ToastContainer } from 'react-toastify';
import { XMarkIcon, BuildingStorefrontIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import 'react-toastify/dist/ReactToastify.css';
import { formatCuisineName } from '@/utils/formatCuisineName';
import { formatPriceRange } from '@/utils/formatPriceRange';

interface AddRestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onRestaurantAdded?: () => void;
}

const initialFormState = {
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
  isFullyHalal: false
};

export default function AddRestaurantForm({ isOpen, onClose, onRestaurantAdded }: AddRestaurantFormProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [halalVerificationConsent, setHalalVerificationConsent] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate address format
    const addressParts = formData.address.split(',').map(part => part.trim());
    if (addressParts.length < 3) {
      setError('Please include city, state, and ZIP code in the address. Example: 1000 Main St, Atlanta, GA 30005');
      setIsSubmitting(false);
      document.getElementById('address')?.focus();
      return;
    }

    // Get the last part which should be State ZIP
    const stateZipPart = addressParts[addressParts.length - 1].trim();

    // Validate state and ZIP format
    const stateZipRegex = /^[A-Z]{2}\s*\d{5}(?:-\d{4})?$/;
    if (!stateZipRegex.test(stateZipPart)) {
      setError('The address should end with a two-letter state code and ZIP code. Example: GA 30005');
      setIsSubmitting(false);
      document.getElementById('address')?.focus();
      return;
    }

    try {
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cuisineType: formData.cuisineType as CuisineType,
          priceRange: formData.priceRange === '$' ? 'LOW' :
                     formData.priceRange === '$$' ? 'MEDIUM' :
                     formData.priceRange === '$$$' ? 'HIGH' : formData.priceRange
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add restaurant');
      }

      const restaurantName = formData.name; // Store the name before resetting form

      // Show success toast first
      toast.success(`Restaurant "${restaurantName}" was successfully added!`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: 'success-toast',
        data: {
          'data-testid': 'success-toast'
        }
      });

      // Reset form data
      setFormData(initialFormState);
      setHalalVerificationConsent(false);

      // Start closing animation
      setIsVisible(false);

      // Wait before actually closing the modal
      setTimeout(() => {
        onClose();
        onRestaurantAdded?.();
      }, 3000); // Wait for toast to complete before closing modal

    } catch (error) {
      console.error('Error adding restaurant:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add restaurant. Please try again.';
      
      // Set focus to the relevant field based on the error
      if (errorMessage.includes('name already exists')) {
        document.getElementById('name')?.focus();
      } else if (errorMessage.includes('address already exists')) {
        document.getElementById('address')?.focus();
      }
      
      setError(errorMessage);
      
      // Show error toast
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: 'error-toast',
        data: {
          'data-testid': 'error-toast'
        }
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
        >
          {/* Header - Fixed at top */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 rounded-t-2xl bg-gradient-to-r from-orange-50 to-amber-50">
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
          <div className="flex-1 overflow-y-auto p-6">
            <form id="restaurant-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-base font-semibold text-gray-900 px-1 mb-2 tracking-wide">Basic Information</h3>
                
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
                    required
                  />
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

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 px-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    data-testid="restaurant-address-input"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors placeholder-gray-500 text-gray-900"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Suite A, 5215 Windward Pkwy, Alpharetta, GA 30004"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 px-1">
                    Make sure to include the city, state (2 letters), and ZIP code at the end
                  </p>
                  {error && (error.toLowerCase().includes('state') || error.toLowerCase().includes('address')) && (
                    <p className="mt-1 text-xs text-red-600 px-1" data-testid="address-error">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* Restaurant Features Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-base font-semibold text-gray-900 px-1 mb-2 tracking-wide">Restaurant Features</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prayer Room */}
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
                      <span className="text-sm font-semibold text-gray-900">Prayer Room</span>
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
                      <span className="text-sm font-semibold text-gray-900">Zabiha Certified</span>
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
                        onChange={(e) => setFormData({ ...formData, servesAlcohol: e.target.checked })}
                      />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Serves Alcohol</span>
                      <p className="text-xs text-gray-500 mt-0.5">Restaurant serves alcoholic beverages</p>
                    </div>
                  </label>

                  {/* Fully Halal Menu */}
                  <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        name="isFullyHalal"
                        id="isFullyHalal"
                        data-testid="restaurant-fully-halal-checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
                        checked={formData.isFullyHalal}
                        onChange={(e) => setFormData({ ...formData, isFullyHalal: e.target.checked })}
                      />
                    </div>
                    <div className="ml-3">
                      <span className="text-sm font-semibold text-gray-900">Fully Halal Menu</span>
                      <p className="text-xs text-gray-500 mt-0.5">All menu items are halal</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-base font-semibold text-gray-900 px-1 mb-2 tracking-wide">Additional Information</h3>
                
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
                  />
                </div>
              </div>

              {/* Verification Section */}
              <div className="bg-orange-50 rounded-xl p-4">
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
          <div className="sticky bottom-0 z-10 bg-white border-t border-gray-100 p-6 rounded-b-2xl">
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
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
} 