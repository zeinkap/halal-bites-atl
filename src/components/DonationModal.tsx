import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { CloseButton } from './ui/Button';
import { HeartIcon } from './ui/icons';
import { Card } from './ui/Card';
import { useModalContext } from './ui/ModalContext';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { setAnyModalOpen } = useModalContext();

  useEffect(() => {
    setAnyModalOpen(isOpen);
    return () => setAnyModalOpen(false);
  }, [isOpen, setAnyModalOpen]);

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
                      <HeartIcon className="h-6 w-6 text-amber-500" aria-hidden="true" />
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
                <div className="flex justify-center">
                  {/* Buy Me a Coffee Widget */}
                  <iframe
                    src="https://buymeacoffee.com/widget/page/halalbitesatl"
                    title="Buy Me a Coffee"
                    className="rounded-lg shadow-md border"
                    style={{ width: '320px', height: '400px', border: 'none', background: 'transparent' }}
                    allow="payment"
                    data-testid="donation-widget-iframe"
                        aria-label="Donation widget"
                  ></iframe>
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