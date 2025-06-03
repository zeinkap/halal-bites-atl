import React from 'react';
import { Button } from '../../ui/Button';
import type { FormData } from '../AddRestaurantForm/add-restaurant-helpers';

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

import { handleAddressChange, handleAddressSelect } from './edit-restaurant-helpers';

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
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
    <div>
      <label className="block text-base font-medium text-gray-900 mb-2">
        Name
      </label>
      <input
        type="text"
        name="name"
        id="name"
        data-testid="restaurant-name-input"
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-12 py-3 px-4 transition-colors placeholder-gray-500 text-gray-900 mb-4"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
          name="address"
          id="address"
          data-testid="restaurant-address-input"
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-12 py-3 pl-10 pr-4 transition-colors placeholder-gray-500 text-gray-900 mb-4"
          value={formData.address}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, address: e.target.value }));
            handleAddressChange(e.target.value, isLoaded, setFormData, setAddressSuggestions, setShowSuggestions);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Start typing the restaurant address..."
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
                onClick={() => handleAddressSelect(
                  suggestion,
                  placesService.current,
                  setFormData,
                  setShowSuggestions
                )}
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
        id="description"
        name="description"
        rows={3}
        data-testid="description-input"
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-colors placeholder-gray-500 text-gray-900"
        placeholder="Tell us about the restaurant's specialties, atmosphere, or any other notable features..."
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
      />
    </div>
  </div>
);

export default BasicInfoFields; 