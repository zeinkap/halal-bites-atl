import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { CloseButton, Button } from './ui/Button';
import { Card } from './ui/Card';
import { useModalContext } from './ui/ModalContext';
import { toast } from 'react-hot-toast';
import { useLoadScript } from '@react-google-maps/api';
import { handleAddressChange, handleAddressSelect } from './add-restaurant-helpers';
import type { Libraries } from '@react-google-maps/api/dist/utils/make-load-script-url';

interface FeatureRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const libraries: Libraries = ['places'];

export default function FeatureRestaurantModal({ isOpen, onClose }: FeatureRestaurantModalProps) {
  const { setAnyModalOpen } = useModalContext();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    contactName: '',
    role: '',
    bestTime: '',
    hearAbout: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [addressSuggestions, setAddressSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    setAnyModalOpen(isOpen);
    return () => setAnyModalOpen(false);
  }, [isOpen, setAnyModalOpen]);

  useEffect(() => {
    if (isLoaded && !placesService.current) {
      const tempNode = document.createElement('div');
      placesService.current = new window.google.maps.places.PlacesService(tempNode);
    }
  }, [isLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    if (e.target.name === 'address') {
      handleAddressChange(
        e.target.value,
        isLoaded,
        setAddressSuggestions,
        setShowSuggestions
      );
    }
  };

  const handleSuggestionClick = (suggestion: google.maps.places.AutocompletePrediction) => {
    handleAddressSelect(
      suggestion,
      placesService.current,
      (updater: any) => setForm((prev) => ({ ...prev, ...updater(prev) })),
      setShowSuggestions
    );
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'Restaurant name is required';
    if (!form.contactName.trim()) newErrors.contactName = 'Your name is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    // Optionally, add more validation here
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/feature-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Thank you! We will reach out soon.');
        onClose();
      } else {
        toast.error('Failed to submit. Please try again.');
      }
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md p-0 bg-transparent shadow-none">
                <Card className="w-full max-w-md p-0">
                  <Card.Header className="flex items-center justify-between gap-2 bg-white sticky top-0 z-10">
                    <div>
                      <Card.Title>Feature Your Restaurant</Card.Title>
                      <Card.Description>
                        Fill out the form below and we&apos;ll get in touch to help you get featured on Halal Bites ATL.
                      </Card.Description>
                    </div>
                    <CloseButton onClick={onClose} aria-label="Close feature restaurant modal" />
                  </Card.Header>
                  <Card.Content>
                    <form className="space-y-5 max-h-[70vh] overflow-y-auto" onSubmit={handleSubmit} autoComplete="off">
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-1">Restaurant Name<span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base py-3 px-4 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="e.g. Aladdin's Grill"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-1">Your Name<span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="contactName"
                          value={form.contactName}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base py-3 px-4 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="Contact person for this request"
                        />
                        {errors.contactName && <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>}
                      </div>
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-1">Role/Position</label>
                        <input
                          type="text"
                          name="role"
                          value={form.role}
                          onChange={handleChange}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base py-3 px-4 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="Owner, Manager, Staff, etc. (optional)"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-base font-medium text-gray-700 mb-1">Address<span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base py-3 px-4 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="123 Main St, Atlanta, GA"
                          onFocus={() => setShowSuggestions(true)}
                          autoComplete="off"
                        />
                        {showSuggestions && addressSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-auto">
                            {addressSuggestions.map((suggestion) => (
                              <Button
                                key={suggestion.place_id}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 focus:bg-orange-50 focus:outline-none transition-colors border-b border-gray-100 last:border-0"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">{suggestion.structured_formatting.main_text}</span>
                                  <span className="text-gray-500 text-xs mt-0.5">{suggestion.structured_formatting.secondary_text}</span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        )}
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                      </div>
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-1">Your Email<span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base py-3 px-4 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="you@email.com"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-1">Phone Number<span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base py-3 px-4 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="e.g. (555) 123-4567"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-1">Best time to contact</label>
                        <select
                          name="bestTime"
                          value={form.bestTime}
                          onChange={handleSelectChange}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base py-3 px-4 transition-colors text-gray-900 placeholder-gray-500"
                        >
                          <option value="">Select a time (optional)</option>
                          <option value="Morning">Morning</option>
                          <option value="Afternoon">Afternoon</option>
                          <option value="Evening">Evening</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-1">How did you hear about us?</label>
                        <input
                          type="text"
                          name="hearAbout"
                          value={form.hearAbout}
                          onChange={handleChange}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base py-3 px-4 transition-colors text-gray-900 placeholder-gray-500"
                          placeholder="(optional)"
                        />
                      </div>
                      <div className="flex justify-center gap-2 pt-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="md"
                          onClick={onClose}
                          className="min-w-[100px]"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          disabled={loading}
                          className="min-w-[120px]"
                        >
                          {loading ? 'Submitting...' : 'Submit'}
                        </Button>
                      </div>
                    </form>
                  </Card.Content>
                </Card>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 