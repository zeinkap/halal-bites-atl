import React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StarIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  initialCommentState,
  MAX_COMMENT_LENGTH,
  validateCommentForm,
  CommentItem
} from './comment-helpers';
import { Card } from './ui/Card';
import { Button, CloseButton } from './ui/Button';
import { useModalContext } from './ui/ModalContext';

export default function CommentModal({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
  onCommentAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
  onCommentAdded?: () => void;
}) {
  // TODO: Replace with proper Comment type
  const [comments, setComments] = useState<Array<{ id: string; content: string; authorName: string; createdAt: string; rating: number; imageUrl?: string }>>([]);
  const [newComment, setNewComment] = useState(initialCommentState);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { setAnyModalOpen } = useModalContext();

  // Focus name field on open
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isOpen]);

  // Track form changes
  useEffect(() => {
    const hasFormChanges = 
      newComment.content !== initialCommentState.content ||
      newComment.authorName !== initialCommentState.authorName ||
      newComment.rating !== initialCommentState.rating ||
      selectedImage !== null;
    setHasChanges(hasFormChanges);
  }, [newComment, selectedImage]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      const sortedComments = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComments(sortedComments);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      fetchComments();
      setHasChanges(false);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, restaurantId, fetchComments]);

  useEffect(() => {
    setAnyModalOpen(isOpen);
    return () => setAnyModalOpen(false);
  }, [isOpen, setAnyModalOpen]);

  // Average rating
  const avgRating = useMemo(() => {
    if (!comments.length) return 0;
    return (
      Math.round(
        (comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.length) * 10
      ) / 10
    );
  }, [comments]);

  // Handle form submit
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      if (!response.ok) throw new Error('Failed to add comment');
      const newCommentData = await response.json();
      setComments((prev) => [newCommentData, ...prev]);
      setNewComment(initialCommentState);
      setSelectedImage(null);
      setImagePreview(null);
      setFormErrors({});
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Comment added successfully!');
      onCommentAdded?.();
      setIsVisible(false);
      setTimeout(onClose, 300);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard submit (Ctrl+Enter/Cmd+Enter)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isOpen) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line
  }, [isOpen, newComment, selectedImage]);

  // Image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  // Modal focus trap
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
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
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
    <div 
        ref={modalRef}
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        onClick={() => {
          if (hasChanges) setShowConfirmDialog(true);
          else {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }
        }}
      data-testid="comment-modal-backdrop"
    >
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
          onClick={(e) => e.stopPropagation()}
          data-testid="confirm-dialog-backdrop"
        >
          <Card className="max-w-md w-full mx-4 transform transition-all" data-testid="confirm-dialog">
            <Card.Header className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <Card.Title className="text-lg font-semibold text-gray-900" data-testid="confirm-dialog-title">
                  Discard Changes?
                </Card.Title>
                <Card.Description className="mt-2 text-sm text-gray-600" data-testid="confirm-dialog-message">
                  You have unsaved changes. Are you sure you want to close this form? Your changes will be lost.
                </Card.Description>
                <div className="mt-4 flex gap-3">
                  <Button
                    type="button"
                      onClick={() => setShowConfirmDialog(false)}
                      variant="primary"
                      size="sm"
                    data-testid="confirm-dialog-keep-editing"
                  >
                    No, Keep Editing
                  </Button>
                  <Button
                    type="button"
                      onClick={() => {
                        setShowConfirmDialog(false);
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                      }}
                      variant="outline"
                      size="sm"
                    data-testid="confirm-dialog-discard"
                  >
                    Yes, Discard
                  </Button>
                </div>
              </div>
            </Card.Header>
          </Card>
        </div>
      )}
        <Card
          className={`max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          data-testid="comment-modal-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Header */}
        <Card.Header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 z-10 shadow-sm" data-testid="comment-modal-header">
          <div className="flex items-start justify-between">
            <div>
              <Card.Title className="text-xl font-bold text-gray-900" data-testid="comment-modal-title">
                Comments for {restaurantName}
              </Card.Title>
              <p className="text-sm text-gray-600 mt-1" data-testid="comment-modal-subtitle">
                  {comments.length} comment{comments.length !== 1 && 's'} • Avg. rating:{' '}
                  <span className="inline-flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-1 font-semibold">{avgRating || '-'}</span>
                  </span>
              </p>
            </div>
              <CloseButton onClick={() => {
                if (hasChanges) setShowConfirmDialog(true);
                else {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }
              }} />
          </div>
        </Card.Header>
        <Card.Content className="p-4 space-y-6">
            {/* Comments List */}
            <div className="space-y-4" data-testid="comments-list">
              {isLoading ? (
                <p className="text-center text-gray-500" data-testid="comments-loading">
                  Loading comments...
                </p>
              ) : comments.length === 0 ? (
                <p className="text-center text-gray-500" data-testid="no-comments-message">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
              )}
            </div>
            {/* Sticky Add Comment Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 bg-gray-50 p-4 rounded-lg"
              data-testid="comment-form"
              autoComplete="off"
            >
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-gray-700">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="authorName"
                data-testid="comment-author-input"
                required
                  ref={nameInputRef}
                  className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black ${
                    formErrors.authorName ? 'border-red-500' : ''
                  }`}
                value={newComment.authorName}
                onChange={(e) => setNewComment({ ...newComment, authorName: e.target.value })}
                  aria-invalid={!!formErrors.authorName}
                  aria-describedby={formErrors.authorName ? 'authorName-error' : undefined}
              />
                {formErrors.authorName && (
                  <p className="mt-1 text-sm text-red-600" id="authorName-error">
                    {formErrors.authorName}
                  </p>
                )}
            </div>
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center mt-1 space-x-1" data-testid="rating-stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    data-testid={`rating-star-${star}-button`}
                    onClick={() => setNewComment({ ...newComment, rating: star })}
                    className={`${
                      star <= newComment.rating ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-400 focus:outline-none cursor-pointer transition-transform duration-100 active:scale-110`}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setNewComment({ ...newComment, rating: star });
                        }
                      }}
                  >
                    <StarIcon className="h-5 w-5" />
                  </button>
                ))}
              </div>
                {formErrors.rating && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.rating}</p>
                )}
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                Your Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                id="comment"
                data-testid="comment-content-input"
                required
                rows={3}
                  maxLength={MAX_COMMENT_LENGTH}
                  className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black ${
                    formErrors.content ? 'border-red-500' : ''
                  }`}
                value={newComment.content}
                  onChange={(e) =>
                    setNewComment({ ...newComment, content: e.target.value })
                  }
                  aria-invalid={!!formErrors.content}
                  aria-describedby={formErrors.content ? 'comment-error' : undefined}
              />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{newComment.content.length}/{MAX_COMMENT_LENGTH}</span>
                  {formErrors.content && (
                    <span className="text-red-600" id="comment-error">
                      {formErrors.content}
                    </span>
                  )}
                </div>
            </div>
            {/* Image Upload */}
            <div data-testid="image-upload-section">
              <label className="block text-sm font-medium text-gray-700">
                Add Image (optional)
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  data-testid="comment-image-input"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  data-testid="image-upload-button"
                >
                  Choose Image
                </Button>
                {imagePreview && (
                  <div className="relative w-20 h-20" data-testid="image-preview-container">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      data-testid="image-preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        setImageError(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                        variant="danger"
                        size="icon"
                        className="absolute -top-2 -right-2"
                      data-testid="remove-image-button"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500" data-testid="image-upload-help">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
              {imageError && (
                <p className="mt-1 text-sm text-red-500" data-testid="image-error">
                  {imageError}
                </p>
              )}
            </div>
            <Button
              type="submit"
              data-testid="submit-comment-button"
                disabled={isSubmitting || Object.keys(formErrors).length > 0}
                variant="primary"
                size="md"
                className="w-full relative"
            >
              {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  Adding...
                  </span>
              ) : (
                'Add Comment'
              )}
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
    </>
  );
} 

