import React from 'react';
import type { FormData } from './add-restaurant-helpers';

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

/* Reusable checkbox label for feature options */
const FeatureCheckbox = ({
  checked, onChange, label, description, testId, name, disabled = false,
  accentClass = 'text-teal-600 focus:ring-teal-500/40',
  borderClass = 'border-stone-200 hover:border-teal-400',
}: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description: string;
  testId?: string; name?: string; disabled?: boolean; accentClass?: string; borderClass?: string;
}) => (
  <label className={`relative flex items-start p-3 rounded-xl border bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : `${borderClass} cursor-pointer`} transition-colors`}>
    <input
      type="checkbox"
      name={name}
      data-testid={testId}
      className={`h-4 w-4 rounded border-stone-300 ${accentClass} transition-colors mt-0.5 flex-shrink-0 disabled:cursor-not-allowed`}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
    />
    <span className="ml-3 text-sm">
      <span className="font-medium text-stone-800 block">{label}</span>
      <span className="text-xs text-stone-400 mt-0.5 block">{description}</span>
    </span>
  </label>
);

const FeatureFields: React.FC<Props> = ({ formData, setFormData }) => (
  <div className="bg-stone-50 rounded-xl p-3 sm:p-4 space-y-3 w-full border border-stone-100">
    <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Restaurant Features</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <FeatureCheckbox
        checked={!!formData.hasPrayerRoom} testId="prayer-room-checkbox" name="hasPrayerRoom"
        label="Prayer Space" description="A dedicated prayer area is available."
        onChange={(v) => setFormData(prev => ({ ...prev, hasPrayerRoom: v }))}
      />
      <FeatureCheckbox
        checked={!!formData.isZabiha} testId="zabiha-checkbox" name="isZabiha"
        label="Zabihah (hand-cut)" description="The meat is hand-slaughtered."
        onChange={(v) => setFormData(prev => ({ ...prev, isZabiha: v, isPartiallyHalal: v ? false : prev.isPartiallyHalal }))}
      />
      <FeatureCheckbox
        checked={!!formData.hasOutdoorSeating} testId="outdoor-seating-checkbox" name="hasOutdoorSeating"
        label="Outdoor Seating" description="Outside seating is available."
        onChange={(v) => setFormData(prev => ({ ...prev, hasOutdoorSeating: v }))}
      />
      <FeatureCheckbox
        checked={!!formData.hasHighChair} testId="high-chair-checkbox" name="hasHighChair"
        label="High Chairs" description="High chairs available for young children."
        onChange={(v) => setFormData(prev => ({ ...prev, hasHighChair: v }))}
      />
      <FeatureCheckbox
        checked={!!formData.servesAlcohol} testId="alcohol-checkbox" name="servesAlcohol"
        label="Serves Alcohol" description="Alcoholic beverages are sold here."
        accentClass="text-rose-500 focus:ring-rose-400/40"
        borderClass="border-stone-200 hover:border-rose-300"
        onChange={(v) => setFormData(prev => ({ ...prev, servesAlcohol: v, isFullyHalal: v ? false : prev.isFullyHalal }))}
      />
      <FeatureCheckbox
        checked={!!formData.isFullyHalal} testId="fully-halal-checkbox" name="isFullyHalal"
        label="Fully Halal Menu" description="All items halal, no alcohol served."
        disabled={formData.servesAlcohol || formData.isPartiallyHalal}
        onChange={(v) => setFormData(prev => ({ ...prev, isFullyHalal: v, isPartiallyHalal: v ? false : prev.isPartiallyHalal }))}
      />
      <FeatureCheckbox
        checked={!!formData.isPartiallyHalal} testId="restaurant-partially-halal-checkbox" name="isPartiallyHalal"
        label="Partially Halal" description="Only some menu items are halal."
        disabled={formData.isFullyHalal}
        accentClass="text-amber-600 focus:ring-amber-500/40"
        borderClass="border-stone-200 hover:border-amber-300"
        onChange={(v) => setFormData(prev => ({ ...prev, isPartiallyHalal: v, isZabiha: v ? false : prev.isZabiha, isFullyHalal: v ? false : prev.isFullyHalal }))}
      />
    </div>
  </div>
);

export default FeatureFields; 