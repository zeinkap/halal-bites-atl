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
  <div className="bg-stone-50 rounded-xl p-3 sm:p-4 space-y-3 w-full border border-stone-100">
    <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
      Restaurant Photo <span className="text-stone-400 text-xs font-normal normal-case">(optional)</span>
    </h3>
    <label
      htmlFor="image-upload"
      data-testid="image-upload-label"
      className="relative flex flex-col items-center justify-center w-full h-36 sm:h-48 border-2 border-stone-200 border-dashed rounded-xl cursor-pointer bg-white hover:bg-stone-50 hover:border-teal-300 transition-all p-4"
    >
      {isUploading ? (
        <div className="flex flex-col items-center justify-center gap-3 w-full max-w-xs">
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-stone-500">Uploading… {uploadProgress}%</p>
        </div>
      ) : formData.image ? (
        <>
          <Image
            src={URL.createObjectURL(formData.image)}
            alt="Restaurant preview"
            fill
            className="object-cover rounded-xl"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-xl opacity-0 hover:opacity-100 transition-opacity gap-2">
            <p className="text-white text-sm font-medium">Click to change</p>
            <Button
              type="button"
              data-testid="remove-image-button"
              onClick={(e) => {
                e.preventDefault();
                setFormData(prev => ({ ...prev, image: undefined }));
              }}
              className="px-3 py-1 text-xs rounded-full"
              variant="danger"
            >
              Remove
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1.5 text-center">
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mb-1">
            <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
          </div>
          <p className="text-sm text-stone-600">
            <span className="font-semibold text-teal-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-stone-400">PNG, JPG, GIF · max 5MB</p>
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
);

export default ImageUpload; 