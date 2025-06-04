import React from 'react';
import toast from 'react-hot-toast';
import { initialCommentState, MAX_COMMENT_LENGTH, validateCommentForm } from './comment-helpers';

export { initialCommentState, MAX_COMMENT_LENGTH, validateCommentForm };

export function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, setImageError: (msg: string | null) => void, setSelectedImage: (file: File | null) => void, setImagePreview: (url: string | null) => void, fileInputRef: React.RefObject<HTMLInputElement | null>) {
  const file = e.target.files?.[0];
  if (file) {
    setImageError(null);
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      setImageError('Invalid file type. Please upload an image.');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }
}

export function removeImage(setSelectedImage: (file: File | null) => void, setImagePreview: (url: string | null) => void, setImageError: (msg: string | null) => void, fileInputRef: React.RefObject<HTMLInputElement | null>) {
  setSelectedImage(null);
  setImagePreview(null);
  setImageError(null);
  if (fileInputRef.current) fileInputRef.current.value = '';
}

export type CommentForm = {
  content: string;
  authorName: string;
  rating: number;
};

export type Comment = {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  rating: number;
  imageUrl?: string;
  hearts?: number;
};

export async function submitComment({ newComment, selectedImage, restaurantId, setFormErrors, setIsSubmitting, setComments, setNewComment, setSelectedImage, setImagePreview, fileInputRef, onCommentAdded, setIsVisible, onClose }: {
  newComment: CommentForm,
  selectedImage: File | null,
  restaurantId: string,
  setFormErrors: (errors: Record<string, string>) => void,
  setIsSubmitting: (b: boolean) => void,
  setComments: (cb: (prev: Comment[]) => Comment[]) => void,
  setNewComment: (c: CommentForm) => void,
  setSelectedImage: (f: File | null) => void,
  setImagePreview: (s: string | null) => void,
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  onCommentAdded?: () => void,
  setIsVisible: (b: boolean) => void,
  onClose: () => void,
}) {
  const errors = validateCommentForm(newComment);
  setFormErrors(errors);
  if (Object.keys(errors).length > 0) return;
  setIsSubmitting(true);
  try {
    const formData = new FormData();
    formData.append('content', newComment.content);
    formData.append('authorName', newComment.authorName);
    formData.append('rating', newComment.rating.toString());
    formData.append('restaurantId', restaurantId);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    const response = await fetch('/api/comments', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      let errorMsg = 'Failed to add comment';
      try {
        const err = await response.json();
        if (err && err.error) errorMsg = err.error;
      } catch {}
      toast.error(errorMsg);
      setIsSubmitting(false);
      return;
    }
    const newCommentData = await response.json();
    setComments((prev) => [newCommentData, ...prev]);
    setNewComment(initialCommentState);
    setSelectedImage(null);
    setImagePreview(null);
    setFormErrors({} as Record<string, string>);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Comment added successfully!');
    onCommentAdded?.();
    setIsVisible(false);
    setTimeout(onClose, 300);
  } catch {
    toast.error('Failed to add comment. Please try again.');
    setIsSubmitting(false);
  } finally {
    setIsSubmitting(false);
  }
}

export async function fetchComments(restaurantId: string, setComments: (comments: Comment[]) => void, setIsLoading: (b: boolean) => void) {
  setIsLoading(true);
  try {
    const response = await fetch(`/api/comments?restaurantId=${restaurantId}`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    const data = await response.json();
    console.log('fetchComments API response', { restaurantId, data });
    const sortedComments = [...(data as Comment[])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setComments(sortedComments);
  } catch {
    toast.error('Failed to load comments');
  } finally {
    setIsLoading(false);
  }
}

export function calcAvgRating(comments: Comment[]): number {
  if (!comments.length) return 0;
  return (
    Math.round(
      (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length) * 10
    ) / 10
  );
}

export function useKeyboardSubmit(isOpen: boolean, handleSubmit: () => void, deps: unknown[] = []) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isOpen) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line
  }, [isOpen, handleSubmit, ...deps]);
}

export function useFocusTrap(isOpen: boolean, modalRef: React.RefObject<HTMLDivElement | null>) {
  React.useEffect(() => {
    if (!isOpen) return;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !focusable) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [isOpen, modalRef]);
}

export function handleModalClose(hasChanges: boolean, setShowConfirmDialog: (b: boolean) => void, setIsVisible: (b: boolean) => void, onClose: () => void) {
  if (hasChanges) setShowConfirmDialog(true);
  else {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }
}

export function handleConfirmClose(setShowConfirmDialog: (b: boolean) => void, setIsVisible: (b: boolean) => void, onClose: () => void) {
  setShowConfirmDialog(false);
  setIsVisible(false);
  setTimeout(onClose, 300);
} 