import React from 'react';

type Props = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
};

const ZabihaMeatOptions: React.FC<Props> = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-900">Zabihah Meat Options</h3>
    <div className="space-y-3">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="zabihaChicken"
          checked={formData.zabihaChicken}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, zabihaChicken: e.target.checked }))}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="zabihaChicken" className="ml-3 block text-base text-gray-900">
          Chicken
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="zabihaLamb"
          checked={formData.zabihaLamb}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, zabihaLamb: e.target.checked }))}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="zabihaLamb" className="ml-3 block text-base text-gray-900">
          Lamb
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="zabihaBeef"
          checked={formData.zabihaBeef}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, zabihaBeef: e.target.checked }))}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="zabihaBeef" className="ml-3 block text-base text-gray-900">
          Beef
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="zabihaGoat"
          checked={formData.zabihaGoat}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, zabihaGoat: e.target.checked }))}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="zabihaGoat" className="ml-3 block text-base text-gray-900">
          Goat
        </label>
      </div>
    </div>
  </div>
);

export default ZabihaMeatOptions; 