import React from 'react';
import type { FormData } from './add-restaurant-helpers';

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

const ZabihaMeatOptions: React.FC<Props> = ({ formData, setFormData }) => (
  <div className="space-y-4 mt-4 p-4 bg-white rounded-lg border border-orange-100 w-full">
    <div className="text-sm font-medium text-gray-700">Zabihah Details</div>
    {/* Zabihah Meat Types */}
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Available Zabihah Meat: <span className="text-red-500">*</span></div>
      <div className="grid grid-cols-2 gap-2">
        <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            data-testid="zabiha-chicken-checkbox"
            className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            checked={formData.zabihaChicken}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, zabihaChicken: e.target.checked }))}
          />
          <span className="ml-2 text-sm text-gray-600">Chicken</span>
        </label>
        <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            data-testid="zabiha-lamb-checkbox"
            className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            checked={formData.zabihaLamb}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, zabihaLamb: e.target.checked }))}
          />
          <span className="ml-2 text-sm text-gray-600">Lamb</span>
        </label>
        <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            data-testid="zabiha-beef-checkbox"
            className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            checked={formData.zabihaBeef}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, zabihaBeef: e.target.checked }))}
          />
          <span className="ml-2 text-sm text-gray-600">Beef</span>
        </label>
        <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            data-testid="zabiha-goat-checkbox"
            className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            checked={formData.zabihaGoat}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, zabihaGoat: e.target.checked }))}
          />
          <span className="ml-2 text-sm text-gray-600">Goat</span>
        </label>
      </div>
    </div>
    {/* Verification Fields */}
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="zabihaVerified" className="block text-sm text-gray-600 mb-1">
          Verification Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="zabihaVerified"
          data-testid="zabiha-verified-date-input"
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm text-gray-900"
          value={formData.zabihaVerified ? (formData.zabihaVerified instanceof Date ? formData.zabihaVerified.toISOString().substring(0, 10) : '') : ''}
          onChange={e => setFormData((prev: FormData) => ({ ...prev, zabihaVerified: e.target.value ? new Date(e.target.value) : null }))}
          required={formData.isZabiha}
          max={new Date().toLocaleDateString('en-CA')}
        />
      </div>
      <div>
        <label htmlFor="zabihaVerifiedBy" className="block text-sm text-gray-600 mb-1">
          Verified By <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="zabihaVerifiedBy"
          data-testid="zabiha-verified-by-input"
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm text-gray-900"
          placeholder="e.g., Restaurant Management, Local Imam"
          value={formData.zabihaVerifiedBy || ''}
          onChange={e => setFormData((prev: any) => ({ ...prev, zabihaVerifiedBy: e.target.value }))}
          required={formData.isZabiha}
        />
      </div>
    </div>
  </div>
);

export default ZabihaMeatOptions; 