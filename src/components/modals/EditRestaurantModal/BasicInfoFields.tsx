import React from 'react';
import { Button } from '../../ui/Button';

type Props = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
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
        value={formData.name}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
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
          onChange={(e) => handleAddressChange(
            e.target.value,
            isLoaded,
            setFormData,
            setAddressSuggestions,
            setShowSuggestions
          )}
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
        value={formData.description || ''}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-base placeholder-gray-500 text-gray-900"
        placeholder="Enter a description of the restaurant"
        rows={3}
      />
    </div>
  </div>
);

export default BasicInfoFields; 