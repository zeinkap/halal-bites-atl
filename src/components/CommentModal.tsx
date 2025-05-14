import React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
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
import { ConfirmationDialog } from './ui/ConfirmationDialog';
import { HeartIcon } from './ui/icons';

function CommentItemWithHeart({ comment }: { comment: { id: string; content: string; authorName: string; createdAt: string; rating: number; imageUrl?: string; hearts?: number } }) {
  const [isHearted, setIsHearted] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`hearted-comment-${comment.id}`) === 'true';
    }
    return false;
  });
  const [hearts, setHearts] = React.useState(comment.hearts ?? 0);
  const [pop, setPop] = React.useState(false);

  const handleHeart = async () => {
    const action = isHearted ? 'decrement' : 'increment';
    const res = await fetch('/api/comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: comment.id, action }),
    });
    if (res.ok) {
      const updated = await res.json();
      setHearts(updated.hearts);
      setIsHearted(!isHearted);
      setPop(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`hearted-comment-${comment.id}`, (!isHearted).toString());
      }
      setTimeout(() => setPop(false), 250);
    }
  };

  return (
    <div className="relative group border border-gray-100 rounded-lg p-4 bg-white flex flex-col gap-2">
      <CommentItem comment={{ ...comment, hearts }} />
      <div className="flex items-center gap-2 mt-2">
        <Button
          type="button"
          variant={isHearted ? 'danger' : 'outline'}
          size="icon"
          aria-label={isHearted ? 'Unheart comment' : 'Heart comment'}
          onClick={handleHeart}
          className={`transition-colors ${isHearted ? 'text-red-500' : 'text-gray-400'}`}
        >
          <span
            className={`inline-flex items-center justify-center transition-transform duration-200 ${pop ? 'scale-125' : 'scale-100'} ${isHearted ? 'drop-shadow-[0_2px_8px_rgba(239,68,68,0.25)]' : ''}`}
          >
            <HeartIcon
              fill={isHearted ? 'currentColor' : 'none'}
              stroke="currentColor"
              className="w-5 h-5"
            />
          </span>
        </Button>
        <span className="text-sm text-gray-600 select-none">{hearts}</span>
      </div>
    </div>
  );
}

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
  const [comments, setComments] = useState<Array<{ id: string; content: string; authorName: string; createdAt: string; rating: number; imageUrl?: string; hearts?: number }>>([]);
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
      <ConfirmationDialog
        open={showConfirmDialog}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to close this form? Your changes will be lost."
        onConfirm={() => {
          setShowConfirmDialog(false);
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        onCancel={() => setShowConfirmDialog(false)}
      />
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
        <Card
          className="w-full max-w-md mx-auto rounded-2xl shadow-xl bg-white transform transition-all max-h-[90vh] overflow-y-auto"
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
            <div className="space-y-4 overflow-y-auto max-h-[70vh]" data-testid="comments-list">
              {isLoading ? (
                <p className="text-center text-gray-500" data-testid="comments-loading">
                  Loading comments...
                </p>
              ) : comments.length === 0 ? (
                <p className="text-center text-gray-500" data-testid="no-comments-message">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentItemWithHeart key={comment.id} comment={comment} />
                ))
              )}
            </div>
            {/* Sticky Add Comment Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 bg-gray-50 p-4 rounded-lg"
              data-testid="comment-form"
              autoComplete="off"
            >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add a Comment</h3>
            <div>
              <label htmlFor="authorName" className="block text-base font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="authorName"
                data-testid="comment-author-input"
                required
                ref={nameInputRef}
                className={`mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-black h-12 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-colors ${
                  formErrors.authorName ? 'border-red-500' : ''
                } mb-4`}
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
              <label htmlFor="comment" className="block text-base font-medium text-gray-700 mb-1">
                Your Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                id="comment"
                data-testid="comment-content-input"
                required
                rows={3}
                maxLength={MAX_COMMENT_LENGTH}
                className={`mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-black h-24 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-colors ${
                  formErrors.content ? 'border-red-500' : ''
                } mb-4`}
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
              <label className="block text-base font-medium text-gray-700 mb-1">
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
                  size="lg"
                  className="h-12 text-base rounded-lg w-full sm:w-auto"
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
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-2 rounded-b-2xl flex justify-end gap-3 z-10">
              <Button
                type="submit"
                data-testid="submit-comment-button"
                disabled={isSubmitting || Object.keys(formErrors).length > 0}
                variant="primary"
                size="lg"
                className="w-full h-12 text-base rounded-lg relative"
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
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
    </>
  );
} 

