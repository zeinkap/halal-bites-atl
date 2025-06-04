import type { Dispatch, SetStateAction } from 'react';
import type { FormData } from '../AddRestaurantForm/add-restaurant-helpers';

export function setupPlacesService(isLoaded: boolean, placesServiceRef: React.MutableRefObject<google.maps.places.PlacesService | null>) {
  if (isLoaded && !placesServiceRef.current) {
    const tempNode = document.createElement('div');
    placesServiceRef.current = new window.google.maps.places.PlacesService(tempNode);
  }
}

export function handleAddressChange(
  value: string,
  isLoaded: boolean,
  setFormData: Dispatch<SetStateAction<FormData>>,
  setAddressSuggestions: Dispatch<SetStateAction<google.maps.places.AutocompletePrediction[]>>,
  setShowSuggestions: Dispatch<SetStateAction<boolean>>
) {
  setFormData((prev: FormData) => ({ ...prev, address: value }));
  if (!isLoaded || !value) {
    setAddressSuggestions([]);
    setShowSuggestions(false);
    return;
  }
  const autocompleteService = new window.google.maps.places.AutocompleteService();
  autocompleteService.getPlacePredictions({ input: value }, (predictions) => {
    setAddressSuggestions(predictions || []);
    setShowSuggestions(!!predictions && predictions.length > 0);
  });
}

export function handleAddressSelect(
  suggestion: google.maps.places.AutocompletePrediction,
  placesService: google.maps.places.PlacesService | null,
  setFormData: Dispatch<SetStateAction<FormData>>,
  setShowSuggestions: Dispatch<SetStateAction<boolean>>
) {
  if (!placesService) return;
  placesService.getDetails({ placeId: suggestion.place_id }, (place, status) => {
    if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.formatted_address) {
      setFormData((prev: FormData) => ({ ...prev, address: place.formatted_address }));
      setShowSuggestions(false);
    }
  });
} 