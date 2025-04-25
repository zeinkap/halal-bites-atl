import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useRef, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
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

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
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
      
      toast.success('Bug report submitted successfully!');
      closeModal();
    } catch (err) {
      toast.error('Failed to submit bug report. Please try again.');
      console.error('Error submitting bug report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-start mb-4 ">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      Report Issue with Website
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 cursor-pointer p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={handleClose}
                      data-testid="close-bug-report-modal"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="bug-report-form">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Issue Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        {...register('title', { required: 'Title is required' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm placeholder:text-gray-400 text-gray-900"
                        placeholder="e.g., 'Search button not working' or 'Can't submit restaurant review'"
                        data-testid="bug-report-title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600" data-testid="title-error">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        {...register('description', { required: 'Description is required' })}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm placeholder:text-gray-400 text-gray-900"
                        placeholder="Please provide a clear and detailed description of what's not working. Include any error messages you see."
                        data-testid="bug-report-description"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600" data-testid="description-error">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="stepsToReproduce" className="block text-sm font-medium text-gray-700">
                        Steps to Reproduce *
                      </label>
                      <textarea
                        id="stepsToReproduce"
                        {...register('stepsToReproduce', { required: 'Steps to reproduce are required' })}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm placeholder:text-gray-400 text-gray-900"
                        placeholder="1. Go to the restaurant listing page&#10;2. Click on the search bar&#10;3. Type 'halal' and press Enter&#10;4. Notice that..."
                        data-testid="bug-report-steps"
                      />
                      {errors.stepsToReproduce && (
                        <p className="mt-1 text-sm text-red-600" data-testid="steps-error">
                          {errors.stepsToReproduce.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="expectedBehavior" className="block text-sm font-medium text-gray-700">
                          Expected Behavior
                        </label>
                        <textarea
                          id="expectedBehavior"
                          {...register('expectedBehavior')}
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm placeholder:text-gray-400 text-gray-900"
                          placeholder="e.g., 'Search results should show all restaurants with 'halal' in their name or description'"
                          data-testid="bug-report-expected"
                        />
                      </div>

                      <div>
                        <label htmlFor="actualBehavior" className="block text-sm font-medium text-gray-700">
                          Actual Behavior
                        </label>
                        <textarea
                          id="actualBehavior"
                          {...register('actualBehavior')}
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm placeholder:text-gray-400 text-gray-900"
                          placeholder="e.g., 'No search results appear' or 'Getting an error message saying...'"
                          data-testid="bug-report-actual"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="browser" className="block text-sm font-medium text-gray-700">
                          Browser
                        </label>
                        <input
                          type="text"
                          id="browser"
                          {...register('browser')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm placeholder:text-gray-400 text-gray-900"
                          placeholder="e.g., 'Chrome 120.0' or 'Safari 17.2'"
                          data-testid="bug-report-browser"
                        />
                      </div>

                      <div>
                        <label htmlFor="device" className="block text-sm font-medium text-gray-700">
                          Device
                        </label>
                        <input
                          type="text"
                          id="device"
                          {...register('device')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm placeholder:text-gray-400 text-gray-900"
                          placeholder="e.g., 'iPhone 15 Pro' or 'MacBook Pro M3'"
                          data-testid="bug-report-device"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email (optional)
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm placeholder:text-gray-400 text-gray-900"
                        placeholder="your.email@example.com (for follow-up questions)"
                        data-testid="bug-report-email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600" data-testid="email-error">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Screenshot upload section */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Screenshot (optional)
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
                              unoptimized // Since we're using object URLs
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
                            className="mt-2 text-sm text-red-600 hover:text-red-500"
                          >
                            Remove screenshot
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer"
                        data-testid="bug-report-cancel"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[100px]"
                        data-testid="bug-report-submit"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Confirmation Dialog */}
      <Transition show={showConfirmDialog} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-[60]" 
          onClose={handleCancelClose}
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                          Discard Changes?
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            You have unsaved changes in your bug report. Are you sure you want to discard them?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:min-w-[100px]"
                      onClick={handleConfirmClose}
                    >
                      Yes, Discard
                    </button>
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 sm:w-auto sm:min-w-[100px]"
                      onClick={handleCancelClose}
                    >
                      No, Keep Editing
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