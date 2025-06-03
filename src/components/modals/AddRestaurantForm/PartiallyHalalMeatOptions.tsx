import React from 'react';

type Props = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  error?: string | null;
};

const PartiallyHalalMeatOptions: React.FC<Props> = ({ formData, setFormData, error }) => (
  <div className="space-y-4 mt-4 p-4 rounded-lg border border-blue-100 w-full">
    <div className="text-sm font-medium text-gray-700 mb-2">
      Halal Meat Types Available: <span className="text-red-500">*</span>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          data-testid="partially-halal-chicken-checkbox"
          className="rounded border-blue-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          checked={formData.partiallyHalalChicken}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, partiallyHalalChicken: e.target.checked }))}
        />
        <span className="ml-2 text-sm text-gray-700">Chicken</span>
      </label>
      <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          data-testid="partially-halal-lamb-checkbox"
          className="rounded border-blue-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          checked={formData.partiallyHalalLamb}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, partiallyHalalLamb: e.target.checked }))}
        />
        <span className="ml-2 text-sm text-gray-700">Lamb</span>
      </label>
      <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          data-testid="partially-halal-beef-checkbox"
          className="rounded border-blue-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          checked={formData.partiallyHalalBeef}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, partiallyHalalBeef: e.target.checked }))}
        />
        <span className="ml-2 text-sm text-gray-700">Beef</span>
      </label>
      <label className="inline-flex items-center p-2 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          data-testid="partially-halal-goat-checkbox"
          className="rounded border-blue-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          checked={formData.partiallyHalalGoat}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, partiallyHalalGoat: e.target.checked }))}
        />
        <span className="ml-2 text-sm text-gray-700">Goat</span>
      </label>
    </div>
    {error && (
      <div className="text-red-600 text-sm font-medium mt-2">{error}</div>
    )}
  </div>
);

export default PartiallyHalalMeatOptions; 