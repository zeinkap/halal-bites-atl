// Utilities and helpers for BugReportModal
import { toast } from 'react-hot-toast';
import type { BugReportFormData } from './index';

export const BUG_REPORT_DEFAULTS = {
  title: '',
  description: '',
  stepsToReproduce: '',
  expectedBehavior: '',
  actualBehavior: '',
  browser: '',
  device: '',
  email: '',
};

export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export function handleFileChange(event: React.ChangeEvent<HTMLInputElement>, setPreviewUrl: (url: string | null) => void, fileInputRef: React.RefObject<HTMLInputElement | null>) {
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
}

export function removeScreenshot(setPreviewUrl: (url: string | null) => void, fileInputRef: React.RefObject<HTMLInputElement | null>) {
  setPreviewUrl(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
}

export function handleCloseModal(dirtyFields: Record<string, boolean>, previewUrl: string | null, setShowConfirmDialog: (open: boolean) => void, closeModal: () => void) {
  if (Object.keys(dirtyFields).length > 0 || previewUrl) {
    setShowConfirmDialog(true);
    return;
  }
  closeModal();
}

export function closeModal(setShowConfirmDialog: (open: boolean) => void, setPreviewUrl: (url: string | null) => void, reset: () => void, onClose: () => void) {
  setShowConfirmDialog(false);
  setPreviewUrl(null);
  reset();
  onClose();
}

export function handleConfirmClose(closeModal: () => void) {
  closeModal();
}

export async function submitBugReport(
  formData: BugReportFormData,
  setIsSubmitting: (b: boolean) => void,
  setError: (e: string | null) => void,
  onSuccess: () => void
) {
  try {
    setIsSubmitting(true);
    // Validate required fields
    if (typeof formData !== 'object' || formData === null) {
      setError('Invalid form data');
      setIsSubmitting(false);
      return;
    }
    const requiredFields: (keyof BugReportFormData)[] = [
      'title',
      'description',
    ];
    const missingFields = requiredFields.filter(
      (key) => !formData[key] || (typeof formData[key] === 'string' && (formData[key] as string).trim() === '')
    );
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }
    // Prepare form data for submission
    const data = new FormData();
    (Object.keys(formData) as (keyof BugReportFormData)[]).forEach((key) => {
      const value = formData[key];
      if (value !== undefined && key !== 'screenshot') {
        data.append(key as string, value as string);
      }
    });
    // Add screenshot if present
    if (formData.screenshot && formData.screenshot.length > 0) {
      data.append('screenshot', formData.screenshot[0]);
    }
    const response = await fetch('/api/bug-report', {
      method: 'POST',
      body: data,
    });
    if (!response.ok) {
      throw new Error('Failed to submit bug report');
    }
    toast.success('Thank you! Your bug report has been submitted successfully. We will look into it.');
    onSuccess();
  } catch (err) {
    toast.error('Failed to submit bug report. Please try again.');
    console.error('Error submitting bug report:', err);
  } finally {
    setIsSubmitting(false);
  }
} 