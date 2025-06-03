import React from 'react';

type Props = {
  halalVerificationConsent: boolean;
  setHalalVerificationConsent: React.Dispatch<React.SetStateAction<boolean>>;
};

const HalalStatusFields: React.FC<Props> = ({ halalVerificationConsent, setHalalVerificationConsent }) => (
  <div className="bg-orange-50 rounded-xl p-4 w-full">
    <label htmlFor="halalVerification" className="flex items-start cursor-pointer text-base">
      <input
        id="halalVerification"
        name="halalVerification"
        type="checkbox"
        data-testid="halal-verification-checkbox"
        checked={halalVerificationConsent}
        onChange={(e) => setHalalVerificationConsent(e.target.checked)}
        className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500 transition-colors mt-1"
      />
      <span className="ml-3">
        <span className="text-sm font-semibold text-gray-900">
          Halal Verification <span className="text-red-500">*</span>
        </span>
        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
          I confirm that I have personally verified this restaurant serves halal meat and I am adding it in good faith to help the community.
        </p>
        <p className="text-xs text-orange-600 mt-2 font-medium">
          Please check this box to confirm and continue with submission
        </p>
      </span>
    </label>
  </div>
);

export default HalalStatusFields; 