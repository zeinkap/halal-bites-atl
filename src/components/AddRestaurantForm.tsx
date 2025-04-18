import { useState, useEffect } from 'react';
import { CuisineType, PriceRange } from '@prisma/client';
import { toast, ToastContainer } from 'react-toastify';
import { XMarkIcon, BuildingStorefrontIcon } from '@heroicons/react/24/solid';
import 'react-toastify/dist/ReactToastify.css';

// Convert enum to array of options
const cuisineTypes = Object.values(CuisineType).map(cuisine => ({
  value: cuisine,
  label: cuisine.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
}));

// Convert enum to array of display values
const priceRanges = Object.values(PriceRange).map(range => {
  switch (range) {
    case 'LOW': return '$';
    case 'MEDIUM': return '$$';
    case 'HIGH': return '$$$';
    default: return range;
  }
});

interface AddRestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onRestaurantAdded?: () => void;
}

export default function AddRestaurantForm({ isOpen, onClose, onRestaurantAdded }: AddRestaurantFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    cuisineType: '',
    address: '',
    priceRange: '',
    description: '',
    hasPrayerRoom: false,
    hasOutdoorSeating: false,
    isZabiha: false,
    hasHighChair: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [halalVerificationConsent, setHalalVerificationConsent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

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
      setFormData({
        name: '',
        cuisineType: '',
        address: '',
        priceRange: '',
        description: '',
        hasPrayerRoom: false,
        hasOutdoorSeating: false,
        isZabiha: false,
        hasHighChair: false
      });
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
        <div 
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl text-white">
                  <BuildingStorefrontIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New Restaurant</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Help others discover great halal restaurants
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

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div 
                  className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 flex items-start gap-3" 
                  role="alert"
                  data-testid="form-error-message"
                  aria-live="polite"
                >
                  <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-medium text-gray-900 px-1">Basic Information</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 px-1">
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    data-testid="restaurant-name-input"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors placeholder-gray-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter restaurant name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cuisineType" className="block text-sm font-medium text-gray-700 mb-1 px-1">
                      Cuisine Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="cuisineType"
                      id="cuisineType"
                      data-testid="restaurant-cuisine-select"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors text-gray-900 placeholder-gray-500"
                      value={formData.cuisineType}
                      onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                      required
                    >
                      <option value="" className="text-gray-500">Select cuisine type</option>
                      {cuisineTypes.map(({ value, label }) => (
                        <option key={value} value={value} className="text-gray-900">
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1 px-1">
                      Price Range <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priceRange"
                      id="priceRange"
                      data-testid="restaurant-price-select"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors text-gray-900 placeholder-gray-500"
                      value={formData.priceRange}
                      onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                      required
                    >
                      <option value="" className="text-gray-500">Select price range</option>
                      {priceRanges.map((range) => (
                        <option key={range} value={range} className="text-gray-900">
                          {range}
                        </option>
                      ))}
                    </select>
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
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors placeholder-gray-500"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full restaurant address"
                    required
                  />
                </div>
              </div>

              {/* Restaurant Features Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-medium text-gray-900 px-1">Restaurant Features</h3>
                
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
                      <span className="text-sm font-medium text-gray-900">Prayer Room</span>
                      <p className="text-xs text-gray-500">Dedicated prayer space available</p>
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
                      <span className="text-sm font-medium text-gray-900">Outdoor Seating</span>
                      <p className="text-xs text-gray-500">Outdoor dining area available</p>
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
                      <span className="text-sm font-medium text-gray-900">Zabiha Certified</span>
                      <p className="text-xs text-gray-500">Serves certified zabiha meat</p>
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
                      <span className="text-sm font-medium text-gray-900">High Chairs</span>
                      <p className="text-xs text-gray-500">Child seating available</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-medium text-gray-900 px-1">Additional Information</h3>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 px-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    data-testid="restaurant-description-input"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors placeholder-gray-500"
                    placeholder="Tell us about the restaurant's specialties, atmosphere, or any other notable features..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Verification Section */}
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-start">
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
                    <label htmlFor="halalVerification" className="text-sm text-gray-900 font-medium">
                      Halal Verification
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      I confirm that I have personally verified this restaurant serves halal meat and I am adding it in good faith to help the community.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
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
            </form>
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