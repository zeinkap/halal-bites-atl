import React from 'react';
import type { FormData } from './add-restaurant-helpers';

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

const FeatureFields: React.FC<Props> = ({ formData, setFormData }) => (
  <div className="bg-gray-50 rounded-xl p-4 space-y-4 w-full">
    <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurant Features</h3>
    <div className="flex flex-col gap-y-4 w-full">
      <div className="flex flex-row gap-4 sm:contents">
        <div className="flex-1 flex flex-col gap-4">
          {/* Prayer Space */}
          <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="hasPrayerRoom"
              data-testid="prayer-room-checkbox"
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
              checked={formData.hasPrayerRoom}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, hasPrayerRoom: e.target.checked }))}
            />
            <span className="ml-3 text-sm text-gray-900">Prayer Space
              <span className="block text-xs text-gray-500 mt-1">A dedicated prayer area is available.</span>
            </span>
          </label>
          {/* Zabihah Status */}
          <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="isZabiha"
              data-testid="zabiha-checkbox"
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
              checked={formData.isZabiha}
              onChange={(e) => setFormData((prev: any) => ({
                ...prev,
                isZabiha: e.target.checked,
                isPartiallyHalal: e.target.checked ? false : prev.isPartiallyHalal
              }))}
            />
            <span className="ml-3 text-sm text-gray-900">Zabihah (hand-cut)
              <span className="block text-xs text-gray-500 mt-1">The meat is hand-slaughtered.</span>
            </span>
          </label>
          {/* Serves Alcohol */}
          <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="servesAlcohol"
              data-testid="alcohol-checkbox"
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
              checked={formData.servesAlcohol}
              onChange={(e) => {
                const servesAlcohol = e.target.checked;
                setFormData((prev: any) => ({
                  ...prev,
                  servesAlcohol,
                  isFullyHalal: servesAlcohol ? false : prev.isFullyHalal
                }));
              }}
            />
            <span className="ml-3 text-sm text-gray-900">Serves Alcohol
              <span className="block text-xs text-gray-500 mt-1">Alcoholic beverages are sold.</span>
            </span>
          </label>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          {/* Outdoor Seating */}
          <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="hasOutdoorSeating"
              data-testid="outdoor-seating-checkbox"
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
              checked={formData.hasOutdoorSeating}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, hasOutdoorSeating: e.target.checked }))}
            />
            <span className="ml-3 text-sm text-gray-900">Outdoor Seating
              <span className="block text-xs text-gray-500 mt-1">Outside seating is available.</span>
            </span>
          </label>
          {/* High Chair */}
          <label className="relative flex items-start p-3 rounded-lg border border-gray-200 hover:border-orange-500 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="hasHighChair"
              data-testid="high-chair-checkbox"
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
              checked={formData.hasHighChair}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, hasHighChair: e.target.checked }))}
            />
            <span className="ml-3 text-sm text-gray-900">High Chairs
              <span className="block text-xs text-gray-500 mt-1">High chairs are available for young kids.</span>
            </span>
          </label>
          {/* Fully Halal Menu */}
          <label className={`relative flex items-start p-3 rounded-lg border border-gray-200 ${!formData.servesAlcohol ? 'hover:border-orange-500 cursor-pointer' : 'opacity-50 cursor-not-allowed'} transition-colors`}>
            <input
              type="checkbox"
              name="isFullyHalal"
              data-testid="fully-halal-checkbox"
              className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              checked={formData.isFullyHalal}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, isFullyHalal: e.target.checked, isPartiallyHalal: e.target.checked ? false : prev.isPartiallyHalal }))}
              disabled={formData.servesAlcohol || formData.isPartiallyHalal}
            />
            <span className="ml-3 text-sm text-gray-900">Fully Halal Menu
              <span className="block text-xs text-gray-500 mt-1">All menu items are halal and no alcohol is served.</span>
            </span>
          </label>
          {/* Partially Halal */}
          <label className="relative flex items-start p-3 rounded-lg border border-blue-200 hover:border-blue-400 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="isPartiallyHalal"
              data-testid="restaurant-partially-halal-checkbox"
              className="h-4 w-4 rounded border-blue-400 text-blue-600 focus:ring-blue-500 transition-colors"
              checked={formData.isPartiallyHalal}
              onChange={(e) => setFormData((prev: any) => ({
                ...prev,
                isPartiallyHalal: e.target.checked,
                isZabiha: e.target.checked ? false : prev.isZabiha,
                isFullyHalal: e.target.checked ? false : prev.isFullyHalal
              }))}
              disabled={formData.isFullyHalal}
            />
            <span className="ml-3 text-sm text-gray-900">Partially Halal
              <span className="block text-xs text-gray-500 mt-1">Only some menu items are halal.</span>
            </span>
          </label>
        </div>
      </div>
      <div className="hidden sm:block" />
    </div>
  </div>
);

export default FeatureFields; 