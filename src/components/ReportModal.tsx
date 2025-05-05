import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
}

interface FormData {
  reportDetails: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
}: ReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<FormData>();

  const handleClose = () => {
    if (Object.keys(dirtyFields).length > 0) {
      setShowConfirmDialog(true);
      return;
    }
    closeModal();
  };

  const closeModal = () => {
    setShowConfirmDialog(false);
    reset();
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/report-restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          restaurantName,
          reportDetails: data.reportDetails,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      toast.success(`Report for ${restaurantName} submitted successfully. We will look into it, thanks!`);
      closeModal();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose} data-testid="report-modal">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity" data-testid="report-modal-backdrop" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all" data-testid="report-modal-panel">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                    data-testid="report-modal-title"
                  >
                    Report Incorrect Information for {restaurantName}
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none cursor-pointer"
                      onClick={handleClose}
                      data-testid="close-report-modal"
                    >
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </Dialog.Title>

                  <form onSubmit={handleSubmit(onSubmit)} className="mt-4" data-testid="report-form">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="reportDetails"
                          className="block text-sm font-medium text-gray-700"
                          data-testid="report-details-label"
                        >
                          What information is incorrect?
                        </label>
                        <div className="mt-1">
                          <textarea
                            {...register('reportDetails', {
                              required: 'Please provide details about the incorrect information',
                              maxLength: {
                                value: 500,
                                message: 'Please keep your report under 500 characters',
                              }
                            })}
                            id="reportDetails"
                            rows={4}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm text-gray-900 placeholder-gray-500"
                            placeholder="Please describe what information needs to be corrected (e.g. incorrect address or wrong restaurant features...)"
                            data-testid="report-details-input"
                          />
                          {errors.reportDetails && (
                            <p className="mt-1 text-sm text-red-600" data-testid="report-details-error">
                              {errors.reportDetails.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:min-w-[100px] cursor-pointer"
                          data-testid="cancel-report-button"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:min-w-[100px] cursor-pointer disabled:cursor-not-allowed"
                          data-testid="submit-report-button"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={showConfirmDialog} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[60]"
          onClose={() => setShowConfirmDialog(false)}
          data-testid="confirm-dialog"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm transition-opacity" data-testid="confirm-dialog-backdrop" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all" data-testid="confirm-dialog-panel">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                    data-testid="confirm-dialog-title"
                  >
                    Discard Report for {restaurantName}?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500" data-testid="confirm-dialog-message">
                      Are you sure you want to discard your changes? This action
                      cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:mt-0 sm:min-w-[100px] cursor-pointer"
                      onClick={() => setShowConfirmDialog(false)}
                      data-testid="confirm-dialog-keep-editing"
                    >
                      No, Keep Editing
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:min-w-[100px] cursor-pointer"
                      onClick={closeModal}
                      data-testid="confirm-dialog-discard"
                    >
                      Yes, Discard
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
} 