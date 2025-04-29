import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all" data-testid="donation-modal">
                <div className="flex justify-between items-center mb-4" data-testid="donation-modal-header">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <HeartIcon className="h-6 w-6 text-yellow-500" />
                    Support Halal Bites ATL
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 cursor-pointer p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={onClose}
                    aria-label="Close donation modal"
                    data-testid="donation-modal-close"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="mb-4 text-gray-700 text-base">
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
                  ></iframe>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 