import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { CloseButton, Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { CheckCircleIcon } from '../../ui/icons';
import React from 'react';
import { useModalContext } from '../../ui/ModalContext';
import { ConfirmationDialog } from '../../ui/ConfirmationDialog';

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<FormData>();

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { setAnyModalOpen } = useModalContext();

  React.useEffect(() => {
    setAnyModalOpen(isOpen);
    return () => setAnyModalOpen(false);
  }, [isOpen, setAnyModalOpen]);

  React.useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

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
    setEmail('');
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
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      closeModal();
      }, 2000);
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-0 text-left align-middle shadow-xl transition-all" data-testid="report-modal-panel">
                  <Card padding={false}>
                    <Card.Header className="sticky top-0 z-10 bg-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <Card.Title>Report Incorrect Information for <span className="font-semibold">{restaurantName}</span></Card.Title>
                          <Card.Description>Use this form to let us know if you see outdated or incorrect information about this restaurant.</Card.Description>
                        </div>
                    <CloseButton onClick={handleClose} data-testid="close-report-modal" />
                      </div>
                    </Card.Header>
                    <Card.Content>
                      {showSuccess ? (
                        <div className="py-8 text-center animate-fade-in">
                          <CheckCircleIcon className="mx-auto h-10 w-10 text-green-500 mb-2" aria-hidden="true" />
                          <div className="text-green-600 text-2xl mb-2 font-semibold">Thank you!</div>
                          <div className="text-gray-700">Your report has been submitted. We will look into it soon.</div>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto max-h-[70vh]" data-testid="report-form">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Report Incorrect Information</h3>
                          <div>
                            <label
                              htmlFor="reportDetails"
                              className="block text-base font-medium text-gray-700 mb-1"
                              data-testid="report-details-label"
                            >
                              What information is incorrect?
                            </label>
                            <div className="mt-1">
                                  <Controller
                                    name="reportDetails"
                                    control={control}
                                    rules={{
                                  required: 'Please provide details about the incorrect information',
                                  maxLength: {
                                    value: 500,
                                    message: 'Please keep your report under 500 characters',
                                      },
                                      validate: value => value.trim().length > 0 || 'Please provide details about the incorrect information',
                                    }}
                                    render={({ field }) => (
                                      <textarea
                                        {...field}
                                id="reportDetails"
                                rows={4}
                                        ref={textareaRef}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-24 py-3 px-4 transition-colors text-gray-900 placeholder-gray-500 mb-4"
                                placeholder="Please describe what information needs to be corrected (e.g. incorrect address or wrong restaurant features...)"
                                data-testid="report-details-input"
                                        aria-describedby="report-details-help"
                                        maxLength={500}
                                        onChange={e => {
                                          field.onChange(e);
                                        }}
                                      />
                                    )}
                                  />
                                  {errors.reportDetails && (
                                    <p className="mt-1 text-sm text-red-600" data-testid="report-details-error">
                                      {errors.reportDetails.message}
                                    </p>
                                  )}
                            </div>
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-1">
                              Your email (optional)
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-12 py-3 px-4 transition-colors placeholder:text-gray-400 text-gray-900 mb-4"
                              placeholder="your.email@example.com"
                              autoComplete="email"
                            />
                            <span className="text-xs text-gray-400">We&apos;ll only use this if we need to follow up with you.</span>
                          </div>
                          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-2 rounded-b-2xl flex justify-end gap-3 z-10">
                        <Button
                          type="button"
                          onClick={handleClose}
                          variant="secondary"
                          size="lg"
                          className="w-full sm:w-auto h-12 text-xs sm:text-base rounded-lg min-w-[100px]"
                          data-testid="cancel-report-button"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          className="w-full sm:w-auto h-12 text-xs sm:text-base rounded-lg min-w-[100px]"
                          disabled={isSubmitting}
                          data-testid="submit-report-button"
                        >
                          {isSubmitting && <ArrowPathIcon className="animate-spin h-4 w-4 mr-2 inline" />}
                          {isSubmitting ? 'Submitting...' : 'Submit Issue'}
                        </Button>
                    </div>
                  </form>
                      )}
                    </Card.Content>
                  </Card>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ConfirmationDialog
        open={showConfirmDialog}
        title={`Discard Report for ${restaurantName}?`}
        message="Are you sure you want to discard your changes? This action cannot be undone."
        onConfirm={closeModal}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
} 