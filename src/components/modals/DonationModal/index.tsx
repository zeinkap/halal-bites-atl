import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { CloseButton } from '../../ui/Button';
import { HeartIcon } from '../../ui/icons';
import { Card } from '../../ui/Card';
import { useModalContext } from '../../ui/ModalContext';
import { Button } from '../../ui/Button';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { setAnyModalOpen } = useModalContext();

  // Stripe donation logic
  const PRESETS = [5, 10, 25];
  const [selectedPreset, setSelectedPreset] = useState<number | null>(PRESETS[0]);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAmount = () => {
    const custom = parseFloat(customAmount);
    if (!isNaN(custom) && custom > 0) return custom;
    if (selectedPreset) return selectedPreset;
    return null;
  };

  const handleDonate = async () => {
    setError(null);
    const amount = getAmount();
    if (!amount || amount < 1) {
      setError('Please enter a valid amount (minimum $1)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(amount * 100) }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (e) {
      setError('Could not connect to payment service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAnyModalOpen(isOpen);
    return () => setAnyModalOpen(false);
  }, [isOpen, setAnyModalOpen]);

  const amountToDonate = getAmount();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose} data-testid="donation-modal-backdrop">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md p-0 bg-transparent shadow-none" data-testid="donation-modal">
                <Card className="w-full max-w-md p-0">
                  <Card.Header className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <HeartIcon className="h-6 w-6" aria-hidden="true" />
                      <Card.Title>Support Halal Bites ATL</Card.Title>
                    </div>
                  <CloseButton
                    onClick={onClose}
                    aria-label="Close donation modal"
                    data-testid="donation-modal-close"
                  />
                  </Card.Header>
                  <Card.Content className="pb-0">
                    <div className="mb-3 text-gray-700 text-base">
                  Halal Bites ATL is a community-driven project. Donations help cover website hosting, research time, and expansion. <b>JazakAllah Khair</b> for your support!
                </div>
                <div className="flex flex-col items-center gap-4">
                  {/* Preset donation buttons */}
                  <div className="flex gap-3">
                    {PRESETS.map((amt) => (
                      <Button
                        key={amt}
                        variant={selectedPreset === amt && !customAmount ? 'primary' : 'outline'}
                        onClick={() => {
                          setSelectedPreset(amt);
                          setCustomAmount('');
                        }}
                        disabled={loading}
                        size="lg"
                        className="min-w-[72px]"
                        data-testid={`donation-preset-${amt}`}
                      >
                        ${amt}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">Or enter custom amount:</span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      className="border border-gray-300 rounded px-2 py-1 w-24 text-right text-base text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Other"
                      value={customAmount}
                      onChange={e => {
                        setCustomAmount(e.target.value);
                        setSelectedPreset(null);
                      }}
                      disabled={loading}
                      data-testid="donation-custom-input"
                    />
                  </div>
                  {error ? (
                    <div className="text-red-600 text-sm" data-testid="donation-error">{error}</div>
                  ) : null}
                  <Button
                    variant="primary"
                    onClick={handleDonate}
                    disabled={loading || !amountToDonate || amountToDonate < 1}
                    className="w-full"
                    data-testid="donate-with-stripe"
                  >
                    {loading ? 'Redirecting…' : 'Donate with Stripe'}
                  </Button>
                </div>
                  </Card.Content>
                </Card>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 