import { useState, useEffect } from 'react';
import { CuisineType, PriceRange } from '@prisma/client';
import { toast, ToastContainer } from 'react-toastify';
import { XMarkIcon } from '@heroicons/react/24/solid';
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
}

export default function AddRestaurantForm({ isOpen, onClose }: AddRestaurantFormProps) {
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
          className={`bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add New Halal Restaurant</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Help others discover great halal restaurants by adding your favorite spots!
                </p>
              </div>
              <button
                onClick={handleClose}
                data-testid="close-modal-button"
                className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div 
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" 
                  role="alert"
                  data-testid="form-error-message"
                  aria-live="polite"
                >
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  data-testid="restaurant-name-input"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="cuisineType" className="block text-sm font-medium text-gray-700">
                  Cuisine Type *
                </label>
                <select
                  name="cuisineType"
                  id="cuisineType"
                  data-testid="restaurant-cuisine-select"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                  value={formData.cuisineType}
                  onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                  required
                >
                  <option value="">Select a cuisine type</option>
                  {cuisineTypes.map(({ value, label }) => (
                    <option key={value} value={value} className="text-gray-900">
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700">
                  Price Range *
                </label>
                <select
                  name="priceRange"
                  id="priceRange"
                  data-testid="restaurant-price-select"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                  value={formData.priceRange}
                  onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                  required
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
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  data-testid="restaurant-address-input"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              {/* Restaurant Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Restaurant Features</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prayer Room */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasPrayerRoom"
                      id="hasPrayerRoom"
                      data-testid="restaurant-prayer-room-checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.hasPrayerRoom}
                      onChange={(e) => setFormData({ ...formData, hasPrayerRoom: e.target.checked })}
                    />
                    <label htmlFor="hasPrayerRoom" className="ml-2 block text-sm text-gray-900">
                      Prayer Room Available
                    </label>
                  </div>

                  {/* Outdoor Seating */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasOutdoorSeating"
                      id="hasOutdoorSeating"
                      data-testid="restaurant-outdoor-seating-checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.hasOutdoorSeating}
                      onChange={(e) => setFormData({ ...formData, hasOutdoorSeating: e.target.checked })}
                    />
                    <label htmlFor="hasOutdoorSeating" className="ml-2 block text-sm text-gray-900">
                      Outdoor Seating Available
                    </label>
                  </div>

                  {/* Zabiha Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isZabiha"
                      id="isZabiha"
                      data-testid="restaurant-zabiha-checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.isZabiha}
                      onChange={(e) => setFormData({ ...formData, isZabiha: e.target.checked })}
                    />
                    <label htmlFor="isZabiha" className="ml-2 block text-sm text-gray-900">
                      Zabiha Certified
                    </label>
                  </div>

                  {/* High Chair */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="hasHighChair"
                      id="hasHighChair"
                      data-testid="restaurant-high-chair-checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.hasHighChair}
                      onChange={(e) => setFormData({ ...formData, hasHighChair: e.target.checked })}
                    />
                    <label htmlFor="hasHighChair" className="ml-2 block text-sm text-gray-900">
                      High Chairs Available
                    </label>
                  </div>
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    data-testid="restaurant-description-input"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                    placeholder="Add a description of the restaurant (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Brief description of the restaurant, its specialties, or any notable features.</p>
              </div>

              {/* Halal Verification Consent */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="halalVerification"
                      name="halalVerification"
                      type="checkbox"
                      data-testid="halal-verification-checkbox"
                      checked={halalVerificationConsent}
                      onChange={(e) => setHalalVerificationConsent(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="halalVerification" className="text-sm text-gray-700">
                      I confirm that I have personally verified this restaurant serves halal meat and I am adding it in good faith to help the community.
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  data-testid="cancel-restaurant-button"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-gray-900 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-restaurant-button"
                  disabled={isSubmitting || !halalVerificationConsent}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Adding...
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