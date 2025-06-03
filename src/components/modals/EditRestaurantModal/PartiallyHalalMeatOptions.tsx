import React from 'react';

type Props = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  error?: string | null;
};

const PartiallyHalalMeatOptions: React.FC<Props> = ({ formData, setFormData, error }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-yellow-700">
      Partially Halal Meat Options <span className="text-red-500">*</span>
    </h3>
    <div className="space-y-3">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="partiallyHalalChicken"
          checked={formData.partiallyHalalChicken}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, partiallyHalalChicken: e.target.checked }))}
          className="h-5 w-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
        />
        <label htmlFor="partiallyHalalChicken" className="ml-3 block text-base text-yellow-700">
          Chicken
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="partiallyHalalLamb"
          checked={formData.partiallyHalalLamb}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, partiallyHalalLamb: e.target.checked }))}
          className="h-5 w-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
        />
        <label htmlFor="partiallyHalalLamb" className="ml-3 block text-base text-yellow-700">
          Lamb
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="partiallyHalalBeef"
          checked={formData.partiallyHalalBeef}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, partiallyHalalBeef: e.target.checked }))}
          className="h-5 w-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
        />
        <label htmlFor="partiallyHalalBeef" className="ml-3 block text-base text-yellow-700">
          Beef
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="partiallyHalalGoat"
          checked={formData.partiallyHalalGoat}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, partiallyHalalGoat: e.target.checked }))}
          className="h-5 w-5 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
        />
        <label htmlFor="partiallyHalalGoat" className="ml-3 block text-base text-yellow-700">
          Goat
        </label>
      </div>
    </div>
    {error && (
      <div className="text-red-600 text-sm font-medium mt-2">{error}</div>
    )}
  </div>
);

export default PartiallyHalalMeatOptions; 