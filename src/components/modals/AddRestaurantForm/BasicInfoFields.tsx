import React, { useState, useEffect, useRef } from 'react';
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
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (showSuggestions && addressSuggestions.length > 0) {
      setHighlightedIndex(0);
      itemRefs.current = [];
    } else {
      setHighlightedIndex(-1);
    }
  }, [addressSuggestions, showSuggestions]);

  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedIndex]);

  const selectSuggestion = (suggestion: google.maps.places.AutocompletePrediction) => {
    handleAddressSelect(suggestion, placesService.current, setFormData, setShowSuggestions);
    setHighlightedIndex(-1);
  };

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || addressSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < addressSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev <= 0 ? addressSuggestions.length - 1 : prev - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        const index = highlightedIndex >= 0 ? highlightedIndex : 0;
        selectSuggestion(addressSuggestions[index]);
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
  <div className="bg-stone-50 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4 w-full border border-stone-100">
    <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Basic Information</h3>
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1.5">
        Restaurant Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="name"
        id="name"
        data-testid="restaurant-name-input"
        className="w-full rounded-xl border border-stone-200 bg-white shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 focus:outline-none text-base sm:text-sm h-11 py-2.5 px-3.5 transition-colors placeholder-stone-400 text-stone-900"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Enter restaurant name"
        required
      />
    </div>
    <div className="relative">
      <label htmlFor="address" className="block text-sm font-medium text-stone-700 mb-1.5">
        Address <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          name="address"
          id="address"
          data-testid="restaurant-address-input"
          className="w-full rounded-xl border border-stone-200 bg-white shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 focus:outline-none text-base sm:text-sm h-11 py-2.5 pl-9 pr-3.5 transition-colors placeholder-stone-400 text-stone-900"
          value={formData.address}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, address: e.target.value }));
            handleAddressChange(e.target.value, isLoaded, setFormData, setAddressSuggestions, setShowSuggestions);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleAddressKeyDown}
          placeholder="Start typing the restaurant address..."
          required
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={showSuggestions && addressSuggestions.length > 0}
          aria-controls="address-suggestions-list"
          aria-activedescendant={highlightedIndex >= 0 ? `address-suggestion-${highlightedIndex}` : undefined}
        />
        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" aria-hidden="true" />
        {showSuggestions && addressSuggestions.length > 0 && (
          <div
            id="address-suggestions-list"
            ref={listRef}
            role="listbox"
            className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-xl border border-stone-200 max-h-48 sm:max-h-60 overflow-auto"
          >
            {addressSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                ref={(el) => { itemRefs.current[index] = el; }}
                id={`address-suggestion-${index}`}
                role="option"
                type="button"
                aria-selected={index === highlightedIndex}
                className={`w-full text-left px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-inset transition-colors border-b border-stone-100 last:border-0 bg-transparent hover:bg-teal-50 ${
                  index === highlightedIndex ? 'bg-teal-50' : ''
                }`}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-stone-900 text-sm">{suggestion.structured_formatting.main_text}</span>
                  <span className="text-stone-500 text-xs mt-0.5">{suggestion.structured_formatting.secondary_text}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-stone-700 mb-1.5">
        Description <span className="text-stone-400 text-xs font-normal">(optional)</span>
      </label>
      <textarea
        id="description"
        name="description"
        rows={3}
        data-testid="description-input"
        className="w-full rounded-xl border border-stone-200 bg-white shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 focus:outline-none text-sm transition-colors placeholder-stone-400 text-stone-900 py-2.5 px-3.5 resize-none"
        placeholder="Tell us about the restaurant's specialties, atmosphere, or any notable features..."
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
      />
      <div className="flex justify-end mt-1">
        <span className="text-xs text-stone-400 tabular-nums">{formData.description?.length || 0}/500</span>
      </div>
    </div>
  </div>
  );
};

export default BasicInfoFields; 