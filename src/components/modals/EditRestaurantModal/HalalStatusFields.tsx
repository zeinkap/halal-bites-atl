import React from 'react';
import type { FormData } from '../AddRestaurantForm/add-restaurant-helpers';

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

const HalalStatusFields: React.FC<Props> = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-900">Halal Status</h3>
    <div className="space-y-3">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isFullyHalal"
          checked={formData.isFullyHalal}
          onChange={(e) => setFormData(prev => ({ ...prev, isFullyHalal: e.target.checked, isPartiallyHalal: e.target.checked ? false : prev.isPartiallyHalal }))}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
          disabled={formData.servesAlcohol || formData.isPartiallyHalal}
        />
        <label htmlFor="isFullyHalal" className="ml-3 block text-base text-gray-900">
          Fully Halal
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isZabiha"
          checked={formData.isZabiha}
          onChange={(e) => setFormData(prev => ({ ...prev, isZabiha: e.target.checked }))}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="isZabiha" className="ml-3 block text-base text-gray-900">
          Zabihah
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPartiallyHalal"
          checked={formData.isPartiallyHalal}
          onChange={(e) => setFormData(prev => ({ ...prev, isPartiallyHalal: e.target.checked }))}
          className="h-5 w-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
        />
        <label htmlFor="isPartiallyHalal" className="ml-3 block text-base text-yellow-700">
          Partially Halal
        </label>
      </div>
    </div>
  </div>
);

export default HalalStatusFields; 