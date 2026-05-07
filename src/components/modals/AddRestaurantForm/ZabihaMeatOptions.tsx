import React from 'react';
import type { FormData } from './add-restaurant-helpers';

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

const meatTypes = [
  { key: 'zabihaChicken', label: '🐔 Chicken', testId: 'zabiha-chicken-checkbox' },
  { key: 'zabihaLamb',    label: '🐑 Lamb',    testId: 'zabiha-lamb-checkbox' },
  { key: 'zabihaBeef',    label: '🐄 Beef',    testId: 'zabiha-beef-checkbox' },
  { key: 'zabihaGoat',    label: '🐐 Goat',    testId: 'zabiha-goat-checkbox' },
] as const;

const ZabihaMeatOptions: React.FC<Props> = ({ formData, setFormData }) => (
  <div className="p-3 sm:p-4 bg-amber-50/60 rounded-xl border border-amber-100 w-full space-y-4">
    <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wider">Zabihah Details</h3>

    <div>
      <p className="text-sm font-medium text-stone-700 mb-2">
        Available Zabihah meat <span className="text-red-500">*</span>
      </p>
      <div className="grid grid-cols-2 gap-2">
        {meatTypes.map(({ key, label, testId }) => (
          <label key={key} className={`inline-flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
            formData[key] ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200 hover:border-amber-200'
          }`}>
            <input
              type="checkbox"
              data-testid={testId}
              className="rounded border-stone-300 text-amber-600 focus:ring-amber-500/40 h-4 w-4"
              checked={formData[key]}
              onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
            />
            <span className="text-sm text-stone-700 font-medium">{label}</span>
          </label>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label htmlFor="zabihaVerified" className="block text-sm font-medium text-stone-700 mb-1.5">
          Verification Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="zabihaVerified"
          data-testid="zabiha-verified-date-input"
          className="w-full rounded-xl border border-stone-200 bg-white shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 focus:outline-none text-sm text-stone-900 h-11 px-3.5 transition-colors"
          value={formData.zabihaVerified ? (formData.zabihaVerified instanceof Date ? formData.zabihaVerified.toISOString().substring(0, 10) : '') : ''}
          onChange={e => setFormData(prev => ({ ...prev, zabihaVerified: e.target.value ? new Date(e.target.value) : null }))}
          required={formData.isZabiha}
          max={new Date().toLocaleDateString('en-CA')}
        />
      </div>
      <div>
        <label htmlFor="zabihaVerifiedBy" className="block text-sm font-medium text-stone-700 mb-1.5">
          Verified By <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="zabihaVerifiedBy"
          data-testid="zabiha-verified-by-input"
          className="w-full rounded-xl border border-stone-200 bg-white shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 focus:outline-none text-sm text-stone-900 h-11 px-3.5 transition-colors placeholder-stone-400"
          placeholder="e.g., Restaurant owner, Local Imam"
          value={formData.zabihaVerifiedBy || ''}
          onChange={e => setFormData(prev => ({ ...prev, zabihaVerifiedBy: e.target.value }))}
          required={formData.isZabiha}
        />
      </div>
    </div>
  </div>
);

export default ZabihaMeatOptions; 