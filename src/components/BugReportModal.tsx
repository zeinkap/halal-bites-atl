import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useRef, useEffect } from 'react';
import { ExclamationTriangleIcon, PhotoIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon } from './ui/icons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { CloseButton, Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useModalContext } from './ui/ModalContext';
import { ConfirmationDialog } from './ui/ConfirmationDialog';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BugReportFormData = {
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  browser: string;
  device: string;
  email: string;
  screenshot?: FileList;
};

export default function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setAnyModalOpen } = useModalContext();

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    watch,
  } = useForm<BugReportFormData>({
    defaultValues: {
      title: '',
      description: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      browser: '',
      device: '',
      email: '',
    },
  });

  const descriptionValue = watch('description', '');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        description: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        browser: '',
        device: '',
        email: '',
      });
    }
  }, [isOpen, reset]);

  // Update preview when file changes
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Screenshot must be less than 5MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleClose = () => {
    if (Object.keys(dirtyFields).length > 0 || previewUrl) {
      setShowConfirmDialog(true);
      return;
    }
    closeModal();
  };

  const closeModal = () => {
    setShowConfirmDialog(false);
    setPreviewUrl(null);
    reset();
    onClose();
  };

  const handleConfirmClose = () => {
    closeModal();
  };

  const onSubmit = async (formData: BugReportFormData) => {
    try {
      setIsSubmitting(true);

      // Create FormData instance to handle file upload
      const submitData = new FormData();
      
      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'screenshot') {
          submitData.append(key, value as string);
        }
      });

      // Add screenshot if present
      if (formData.screenshot?.[0]) {
        submitData.append('screenshot', formData.screenshot[0]);
      }

      const response = await fetch('/api/bug-report', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit bug report');
      }
      
      toast.success('Thank you! Your bug report has been submitted successfully. We will look into it.');
      closeModal();
    } catch (err) {
      toast.error('Failed to submit bug report. Please try again.');
      console.error('Error submitting bug report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setAnyModalOpen(isOpen);
    return () => setAnyModalOpen(false);
  }, [isOpen, setAnyModalOpen]);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose} data-testid="bug-report-modal">
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
                <Dialog.Panel className="w-full max-w-2xl p-0 bg-transparent shadow-none">
                  <Card className="w-full max-w-2xl p-0">
                    <Card.Header className="sticky top-0 z-10 bg-white">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                          <Card.Title>Report Issue with Website</Card.Title>
                        </div>
                    <CloseButton onClick={handleClose} data-testid="close-bug-report-modal" />
                  </div>
                    </Card.Header>
                    <Card.Content>
                      {isSubmitting === false && showConfirmDialog === false && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto max-h-[70vh]" data-testid="bug-report-form">
                    <div>
                      <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-1">
                        What&apos;s not working? <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        {...register('title', { required: 'Please provide a brief description of the issue' })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-12 py-3 px-4 transition-colors placeholder:text-gray-400 text-gray-900 mb-4"
                        placeholder="e.g., 'Search not working' or 'Can't submit review'"
                        data-testid="bug-report-title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600" data-testid="title-error">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-1">
                        Tell us more about the issue <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id="description"
                              {...register('description', { required: 'Please provide more details about the issue', maxLength: { value: 500, message: 'Please keep your description under 500 characters' } })}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-24 py-3 px-4 transition-colors placeholder:text-gray-400 text-gray-900 mb-4"
                        placeholder="What were you trying to do? What happened instead?"
                        data-testid="bug-report-description"
                        maxLength={500}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          e.target.value = e.target.value.slice(0, 500);
                        }}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400">Max 500 characters</span>
                        <Badge color={errors.description ? 'orange' : 'gray'} size="xs" className="ml-2">
                          {descriptionValue.length}/500
                        </Badge>
                      </div>
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600" data-testid="description-error">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    {/* Screenshot upload section */}
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-700 mb-1">
                        Add a screenshot (optional)
                      </label>
                      <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                        <div className="space-y-1 text-center">
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="screenshot"
                              className="relative cursor-pointer rounded-md bg-white font-medium text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 hover:text-orange-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="screenshot"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                {...register('screenshot')}
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                data-testid="bug-report-screenshot"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </div>
                      
                      {/* Image preview */}
                      {previewUrl && (
                        <div className="mt-2">
                          <div className="relative h-48 w-full">
                            <Image
                              src={previewUrl}
                              alt="Screenshot preview"
                              fill
                              className="rounded-md object-contain"
                              unoptimized
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewUrl(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="mt-2 text-base text-red-600 hover:text-red-500"
                          >
                            Remove screenshot
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Advanced Fields Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                      className="flex items-center text-base text-gray-600 hover:text-gray-900 focus:outline-none group mb-2"
                    >
                      {showAdvancedFields ? (
                        <ChevronUpIcon className="h-5 w-5 mr-1" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 mr-1" />
                      )}
                      {showAdvancedFields ? 'Show less' : 'Add more details (optional)'}
                    </button>

                    {/* Advanced Fields */}
                    {showAdvancedFields && (
                      <div className="space-y-4 border-t pt-4 mt-2">
                        <div>
                          <label htmlFor="stepsToReproduce" className="block text-base font-medium text-gray-700 mb-1">
                            Steps to reproduce the issue
                          </label>
                          <textarea
                            id="stepsToReproduce"
                            {...register('stepsToReproduce')}
                            rows={3}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-24 py-3 px-4 transition-colors placeholder:text-gray-400 text-gray-900 mb-4"
                            placeholder="1. Go to...&#10;2. Click on...&#10;3. Notice that..."
                            data-testid="bug-report-steps"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="browser" className="block text-base font-medium text-gray-700 mb-1">
                              Browser
                            </label>
                            <input
                              type="text"
                              id="browser"
                              {...register('browser')}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-12 py-3 px-4 transition-colors placeholder:text-gray-400 text-gray-900 mb-4"
                              placeholder="e.g., Chrome, Safari"
                              data-testid="bug-report-browser"
                            />
                          </div>

                          <div>
                            <label htmlFor="device" className="block text-base font-medium text-gray-700 mb-1">
                              Device
                            </label>
                            <input
                              type="text"
                              id="device"
                              {...register('device')}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-12 py-3 px-4 transition-colors placeholder:text-gray-400 text-gray-900 mb-4"
                              placeholder="e.g., iPhone, MacBook"
                              data-testid="bug-report-device"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-1">
                            Email (for follow-up questions)
                          </label>
                          <input
                            type="email"
                            id="email"
                            {...register('email', {
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                              },
                            })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 text-base h-12 py-3 px-4 transition-colors placeholder:text-gray-400 text-gray-900 mb-4"
                            placeholder="your.email@example.com"
                            data-testid="bug-report-email"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600" data-testid="email-error">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-2 rounded-b-2xl flex justify-end gap-3 z-10">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto h-12 text-base rounded-lg"
                        onClick={handleClose}
                        data-testid="bug-report-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto h-12 text-xs rounded-lg"
                        disabled={isSubmitting}
                        data-testid="bug-report-submit"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                      </Button>
                    </div>
                  </form>
                      )}

                      {/* Success State */}
                      {isSubmitting && (
                        <div className="py-8 text-center animate-fade-in">
                          <CheckCircleIcon className="mx-auto h-10 w-10 text-green-500 mb-2" aria-hidden="true" />
                          <div className="text-green-600 text-2xl mb-2 font-semibold">Thank you!</div>
                          <div className="text-gray-700">Your bug report has been submitted. We will look into it soon.</div>
                        </div>
                      )}
                    </Card.Content>
                  </Card>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        title="Discard Changes?"
        message="You have unsaved changes in your bug report. Are you sure you want to discard them?"
        onConfirm={handleConfirmClose}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
} 