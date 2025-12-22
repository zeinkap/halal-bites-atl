import React from 'react';
import { Button } from '../../ui/Button';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { handleAddressChange, handleAddressSelect } from '../EditRestaurantModal/edit-restaurant-helpers';
import type { FormData } from './add-restaurant-helpers';

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isLoaded: boolean;
  addressSuggestions: google.maps.places.AutocompletePrediction[];
  setAddressSuggestions: React.Dispatch<React.SetStateAction<google.maps.places.AutocompletePrediction[]>>;
  showSuggestions: boolean;
  setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>;
  placesService: React.MutableRefObject<google.maps.places.PlacesService | null>;
};

const BasicInfoFields: React.FC<Props> = ({
  formData,
  setFormData,
  isLoaded,
  addressSuggestions,
  setAddressSuggestions,
  showSuggestions,
  setShowSuggestions,
  placesService,
}) => (
  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4 w-full">
    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Basic Information</h3>
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
        Restaurant Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="name"
        id="name"
        data-testid="restaurant-name-input"
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base sm:text-base h-11 sm:h-12 py-2.5 sm:py-3 px-3 sm:px-4 transition-colors placeholder-gray-500 text-gray-900"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Enter restaurant name"
        required
      />
    </div>
    <div className="relative">
      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
        Address <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          name="address"
          id="address"
          data-testid="restaurant-address-input"
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base sm:text-base h-11 sm:h-12 py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 transition-colors placeholder-gray-500 text-gray-900"
          value={formData.address}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, address: e.target.value }));
            handleAddressChange(e.target.value, isLoaded, setFormData, setAddressSuggestions, setShowSuggestions);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Start typing the restaurant address..."
          required
        />
        <MapPinIcon className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
        {showSuggestions && addressSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-48 sm:max-h-60 overflow-auto">
            {addressSuggestions.map((suggestion) => (
              <Button
                key={suggestion.place_id}
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm hover:bg-orange-50 focus:bg-orange-50 focus:outline-none transition-colors border-b border-gray-100 last:border-0"
                onClick={() => handleAddressSelect(
                  suggestion,
                  placesService.current,
                  setFormData,
                  setShowSuggestions
                )}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 text-sm">{suggestion.structured_formatting.main_text}</span>
                  <span className="text-gray-500 text-xs mt-0.5">{suggestion.structured_formatting.secondary_text}</span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
        Description
      </label>
      <textarea
        id="description"
        name="description"
        rows={4}
        data-testid="description-input"
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base sm:text-sm transition-colors placeholder-gray-500 text-gray-900 py-2.5 sm:py-3 px-3 sm:px-4"
        placeholder="Tell us about the restaurant's specialties, atmosphere, or any other notable features..."
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-gray-500">Optional</span>
        <span className="text-xs text-gray-500 font-medium">{formData.description?.length || 0}/500</span>
      </div>
    </div>
  </div>
);

export default BasicInfoFields; 