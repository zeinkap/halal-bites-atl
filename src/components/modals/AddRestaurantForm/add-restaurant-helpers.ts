import type { CuisineType, PriceRange } from '@prisma/client';

export interface FormData {
  name?: string;
  cuisineType?: CuisineType | '';
  address?: string;
  priceRange?: PriceRange | '';
  description?: string;
  hasPrayerRoom?: boolean;
  hasOutdoorSeating?: boolean;
  isZabiha?: boolean;
  hasHighChair?: boolean;
  servesAlcohol?: boolean;
  isFullyHalal?: boolean;
  zabihaChicken?: boolean;
  zabihaLamb?: boolean;
  zabihaBeef?: boolean;
  zabihaGoat?: boolean;
  zabihaVerified?: Date | null;
  zabihaVerifiedBy?: string;
  image?: File;
  isPartiallyHalal?: boolean;
  partiallyHalalChicken?: boolean;
  partiallyHalalLamb?: boolean;
  partiallyHalalBeef?: boolean;
  partiallyHalalGoat?: boolean;
}

export const initialFormState: FormData = {
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

export const MAX_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;

export function validateForm(formData: FormData): string | null {
  if ((formData.name?.trim().length ?? 0) === 0) {
    return 'Restaurant name is required';
  }
  if ((formData.name?.length ?? 0) > MAX_NAME_LENGTH) {
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
  if (!formData.address?.trim()) {
    return 'Address is required';
  }
  if (formData.isZabiha) {
    if (!formData.zabihaVerified) {
      return 'Verification Date is required for Zabihah Certified restaurants';
    }
    if (formData.zabihaVerified && formData.zabihaVerified > new Date()) {
      return 'Verification Date cannot be in the future';
    }
    if (!formData.zabihaVerifiedBy?.trim()) {
      return 'Verified By is required for Zabihah Certified restaurants';
    }
    if (!formData.zabihaChicken && !formData.zabihaLamb && !formData.zabihaBeef && !formData.zabihaGoat) {
      return 'Please select at least one Zabihah meat type';
    }
  }
  if (formData.isPartiallyHalal) {
    if (!formData.partiallyHalalChicken && !formData.partiallyHalalLamb && !formData.partiallyHalalBeef && !formData.partiallyHalalGoat) {
      return 'Please select at least one Partially Halal meat type';
    }
  }
  return null;
}

export async function handleAddressChange(value: string, isLoaded: boolean, setAddressSuggestions: (sugs: google.maps.places.AutocompletePrediction[]) => void, setShowSuggestions: (show: boolean) => void) {
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
      location: new google.maps.LatLng(33.7490, -84.3880), // Atlanta, GA
      radius: 150000, // ~150km, covers most of Georgia
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
}

export async function handleAddressSelect(suggestion: google.maps.places.AutocompletePrediction, placesService: google.maps.places.PlacesService | null, setFormData: (updater: (prev: FormData) => FormData) => void, setShowSuggestions: (show: boolean) => void) {
  if (!placesService) return;

  try {
    const placeResult = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
      placesService.getDetails(
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
    setFormData((prev) => ({
      ...prev,
      address: suggestion.description,
    }));
    setShowSuggestions(false);
  }
} 