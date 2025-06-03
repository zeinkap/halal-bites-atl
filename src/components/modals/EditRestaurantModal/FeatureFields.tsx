import React from 'react';

type Props = {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
};

const FeatureFields: React.FC<Props> = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-900">Features</h3>
    <div className="space-y-3">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="hasPrayerRoom"
          checked={formData.hasPrayerRoom}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, hasPrayerRoom: e.target.checked }))}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="hasPrayerRoom" className="ml-3 block text-base text-gray-900">
          Prayer Room Available
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="hasOutdoorSeating"
          checked={formData.hasOutdoorSeating}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, hasOutdoorSeating: e.target.checked }))}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="hasOutdoorSeating" className="ml-3 block text-base text-gray-900">
          Outdoor Seating
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="hasHighChair"
          checked={formData.hasHighChair}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, hasHighChair: e.target.checked }))}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="hasHighChair" className="ml-3 block text-base text-gray-900">
          High Chair Available
        </label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="servesAlcohol"
          checked={formData.servesAlcohol}
          onChange={(e) => {
            const servesAlcohol = e.target.checked;
            setFormData((prev: any) => ({
              ...prev,
              servesAlcohol,
              isFullyHalal: servesAlcohol ? false : prev.isFullyHalal
            }));
          }}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="servesAlcohol" className="ml-3 block text-base text-gray-900">
          Serves Alcohol
        </label>
      </div>
    </div>
  </div>
);

export default FeatureFields; 