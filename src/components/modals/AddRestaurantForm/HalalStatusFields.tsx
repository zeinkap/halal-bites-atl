import React from 'react';

type Props = {
  halalVerificationConsent: boolean;
  setHalalVerificationConsent: React.Dispatch<React.SetStateAction<boolean>>;
};

const HalalStatusFields: React.FC<Props> = ({ halalVerificationConsent, setHalalVerificationConsent }) => (
  <div className={`rounded-xl p-3 sm:p-4 w-full border transition-colors ${halalVerificationConsent ? 'bg-teal-50 border-teal-200' : 'bg-stone-50 border-stone-200'}`}>
    <label htmlFor="halalVerification" className="flex items-start cursor-pointer gap-3">
      <input
        id="halalVerification"
        name="halalVerification"
        type="checkbox"
        data-testid="halal-verification-checkbox"
        checked={halalVerificationConsent}
        onChange={(e) => setHalalVerificationConsent(e.target.checked)}
        className="h-5 w-5 rounded border-stone-300 text-teal-600 focus:ring-teal-500/40 transition-colors mt-0.5 flex-shrink-0"
      />
      <span>
        <span className="text-sm font-semibold text-stone-900 block">
          Halal Verification <span className="text-red-500">*</span>
        </span>
        <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
          I confirm that I have personally verified this restaurant serves halal meat and I am adding it in good faith to help the community.
        </p>
        <p className={`text-xs mt-2 font-medium ${halalVerificationConsent ? 'text-teal-600' : 'text-stone-400'}`}>
          {halalVerificationConsent ? '✓ Verified — thank you for confirming' : 'Please check this box to confirm before submitting'}
        </p>
      </span>
    </label>
  </div>
);

export default HalalStatusFields; 