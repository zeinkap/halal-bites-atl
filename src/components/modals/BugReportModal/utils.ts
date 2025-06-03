// Utilities and helpers for BugReportModal
import { toast } from 'react-hot-toast';

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

export async function submitBugReport(formData: any, setIsSubmitting: (b: boolean) => void, closeModal: () => void, setPreviewUrl: (url: string | null) => void) {
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
    setPreviewUrl(null);
  } catch (err) {
    toast.error('Failed to submit bug report. Please try again.');
    console.error('Error submitting bug report:', err);
  } finally {
    setIsSubmitting(false);
  }
} 