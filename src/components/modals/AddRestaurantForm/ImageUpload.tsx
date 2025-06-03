import React from 'react';
import Image from 'next/image';
import { Button } from '../../ui/Button';
import type { FormData } from './add-restaurant-helpers';

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  isUploading: boolean;
  uploadProgress: number;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ImageUpload: React.FC<Props> = ({ formData, setFormData, isUploading, uploadProgress, handleImageChange }) => (
  <div className="bg-gray-50 rounded-xl p-4 space-y-4 w-full">
    <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurant Image</h3>
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="image-upload"
        data-testid="image-upload-label"
        className="relative flex flex-col items-center justify-center w-full h-40 sm:h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors p-2 sm:p-0"
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
          </div>
        ) : formData.image ? (
          <>
            <Image
              src={URL.createObjectURL(formData.image)}
              alt="Restaurant preview"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white text-sm mb-2">Click to change image</p>
              <Button
                type="button"
                data-testid="remove-image-button"
                onClick={(e) => {
                  e.preventDefault();
                  setFormData((prev: any) => ({ ...prev, image: undefined }));
                }}
                className="px-3 py-1 text-xs rounded-full hover:bg-red-700 transition-colors"
                variant="danger"
              >
                Remove Image
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-2 pb-3 sm:pt-5 sm:pb-6">
            {/* You can add a PhotoIcon here if desired */}
            <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
          </div>
        )}
        <input
          id="image-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
          data-testid="restaurant-image-input"
          disabled={isUploading}
        />
      </label>
    </div>
  </div>
);

export default ImageUpload; 