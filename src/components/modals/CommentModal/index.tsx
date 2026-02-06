import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { StarIcon, XMarkIcon, ChatBubbleLeftRightIcon, PhotoIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  initialCommentState,
  MAX_COMMENT_LENGTH,
  CommentItem
} from './comment-helpers';
import type { Comment, CommentForm } from './utils';
import { Card } from '../../ui/Card';
import { Button, CloseButton } from '../../ui/Button';
import { useModalContext } from '../../ui/ModalContext';
import { ConfirmationDialog } from '../../ui/ConfirmationDialog';
import { HeartIcon } from '../../ui/icons';
import {
  handleImageChange,
  removeImage,
  submitComment,
  fetchComments,
  calcAvgRating,
  useKeyboardSubmit,
  useFocusTrap,
  handleModalClose,
  handleConfirmClose,
} from './utils';

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<CommentForm>(initialCommentState);
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
  const fetchCommentsCallback = useCallback(async () => {
    // Verify restaurant exists before fetching comments
    try {
      const verifyResponse = await fetch(`/api/restaurants`);
      if (verifyResponse.ok) {
        const restaurants = await verifyResponse.json();
        const restaurantExists = restaurants.some((r: { id: string }) => r.id === restaurantId);
        if (!restaurantExists) {
          toast.error('This restaurant is no longer available. Please refresh the page.');
          setTimeout(() => {
            if (confirm('Would you like to refresh the page to see the latest restaurants?')) {
              window.location.reload();
            } else {
              onClose();
            }
          }, 1500);
          return;
        }
      }
    } catch (error) {
      console.error('Error verifying restaurant:', error);
    }
    fetchComments(restaurantId, setComments, setIsLoading);
  }, [restaurantId, onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      fetchCommentsCallback();
      setHasChanges(false);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, restaurantId, fetchCommentsCallback]);

  useEffect(() => {
    setAnyModalOpen(isOpen);
    return () => setAnyModalOpen(false);
  }, [isOpen, setAnyModalOpen]);

  // Average rating
  const avgRating = calcAvgRating(comments);

  // Image upload
  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleImageChange(e, setImageError, setSelectedImage, setImagePreview, fileInputRef);

  // Handle form submit
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await submitComment({
      newComment,
      selectedImage,
      restaurantId,
      setFormErrors,
      setIsSubmitting,
      setComments,
      setNewComment,
      setSelectedImage,
      setImagePreview,
      fileInputRef,
      onCommentAdded,
      setIsVisible,
      onClose,
    });
  };

  // Keyboard submit (Ctrl+Enter/Cmd+Enter)
  useKeyboardSubmit(isOpen, handleSubmit, [newComment, selectedImage]);

  // Modal focus trap
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(isOpen, modalRef);

  // Disable closing modal while submitting
  const canClose = !isSubmitting;

  if (!isOpen) return null;

  return (
    <>
      <ConfirmationDialog
        open={showConfirmDialog}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to close this form? Your changes will be lost."
        onConfirm={() => canClose && handleConfirmClose(setShowConfirmDialog, setIsVisible, onClose)}
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
        aria-busy={isSubmitting}
        onClick={() => canClose && handleModalClose(hasChanges, setShowConfirmDialog, setIsVisible, onClose)}
        data-testid="comment-modal-backdrop"
      >
        <Card
          className="w-full max-w-md mx-auto rounded-2xl shadow-xl bg-white transform transition-all h-[100dvh] max-h-[100dvh] flex flex-col sm:max-h-[90vh] sm:h-auto overflow-hidden"
          data-testid="comment-modal-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header: compact and scannable */}
          <Card.Header className="flex-shrink-0 bg-white border-b border-stone-200 px-4 py-3 sm:px-5 sm:py-4" data-testid="comment-modal-header">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Card.Title className="text-lg sm:text-xl font-bold text-stone-900 truncate" data-testid="comment-modal-title">
                  {restaurantName}
                </Card.Title>
                <p className="text-sm text-stone-500 mt-0.5 flex items-center gap-2 flex-wrap" data-testid="comment-modal-subtitle">
                  <span>{comments.length} review{comments.length !== 1 && 's'}</span>
                  <span className="text-stone-300">·</span>
                  <span className="inline-flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-amber-400" />
                    <span className="font-semibold text-stone-700">{avgRating ? avgRating.toFixed(1) : '—'}</span>
                    <span className="text-stone-400 text-xs">avg</span>
                  </span>
                </p>
              </div>
              <CloseButton
                onClick={() => {
                  if (!canClose) return;
                  if (hasChanges) setShowConfirmDialog(true);
                  else {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }
                }}
                disabled={!canClose}
                data-testid="close-modal-button"
                className="flex-shrink-0"
              />
            </div>
          </Card.Header>

          <Card.Content className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
            {/* Scrollable: reviews list + form */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Reviews section */}
              <section className="px-4 pt-4 sm:px-5 sm:pt-5" aria-label="Reviews">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  What others say
                </h2>
                <div className="space-y-3" data-testid="comments-list">
                  {isLoading ? (
                    <p className="text-center text-stone-500 py-6 text-sm" data-testid="comments-loading">
                      Loading reviews…
                    </p>
                  ) : comments.length === 0 ? (
                    <p className="text-center text-stone-500 py-6 text-sm" data-testid="no-comments-message">
                      No reviews yet. Be the first to share your experience.
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <CommentItemWithHeart key={comment.id} comment={comment} />
                    ))
                  )}
                </div>
              </section>

              {/* Add review form: clear card-style block */}
              <section className="px-4 pb-4 pt-6 sm:px-5 sm:pb-5 sm:pt-6 border-t border-stone-200 bg-stone-50/80 mt-4" aria-label="Add your review">
                <form
                  onSubmit={handleSubmit}
                  aria-busy={isSubmitting}
                  data-testid="comment-form"
                  className="space-y-4"
                >
                  <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                    Add your review
                  </h3>

                  <div>
                    <label htmlFor="authorName" className="block text-sm font-medium text-stone-700 mb-1">
                      Your name <span className="text-red-500" aria-hidden>*</span>
                    </label>
                    <input
                      type="text"
                      id="authorName"
                      data-testid="comment-author-input"
                      required
                      ref={nameInputRef}
                      placeholder="How should we call you?"
                      className={`block w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 ${
                        formErrors.authorName ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500' : 'border-stone-200'
                      }`}
                      value={newComment.authorName}
                      onChange={(e) => setNewComment({ ...newComment, authorName: e.target.value })}
                      aria-invalid={!!formErrors.authorName}
                      aria-describedby={formErrors.authorName ? 'authorName-error' : undefined}
                    />
                    {formErrors.authorName && (
                      <p className="mt-1 text-xs text-red-600" id="authorName-error">
                        {formErrors.authorName}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="block text-sm font-medium text-stone-700 mb-2">
                      Your rating <span className="text-red-500" aria-hidden>*</span>
                    </span>
                    <div className="flex items-center gap-1" data-testid="rating-stars-container">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          data-testid={`rating-star-${star}-button`}
                          onClick={() => setNewComment({ ...newComment, rating: star })}
                          className={`p-1.5 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 ${
                            star <= newComment.rating
                              ? 'text-amber-400 scale-100'
                              : 'text-stone-300 hover:text-amber-200'
                          }`}
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setNewComment({ ...newComment, rating: star });
                            }
                          }}
                        >
                          <StarIcon className="h-8 w-8 sm:h-9 sm:w-9" />
                        </button>
                      ))}
                      {newComment.rating > 0 && (
                        <span className="ml-2 text-sm text-stone-500">
                          {newComment.rating}/5
                        </span>
                      )}
                    </div>
                    {formErrors.rating && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.rating}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-stone-700 mb-1">
                      Your comment <span className="text-red-500" aria-hidden>*</span>
                    </label>
                    <textarea
                      id="comment"
                      data-testid="comment-content-input"
                      required
                      rows={4}
                      maxLength={MAX_COMMENT_LENGTH}
                      placeholder="Share what you liked (or didn’t)…"
                      className={`block w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 ${
                        formErrors.content ? 'border-red-400 focus:ring-red-500/30 focus:border-red-500' : 'border-stone-200'
                      }`}
                      value={newComment.content}
                      onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                      aria-invalid={!!formErrors.content}
                      aria-describedby={formErrors.content ? 'comment-error' : 'comment-count'}
                    />
                    <div className="flex justify-between items-start mt-1 gap-2">
                      {formErrors.content ? (
                        <span className="text-xs text-red-600" id="comment-error">
                          {formErrors.content}
                        </span>
                      ) : <span />}
                      <span
                        className={`text-xs tabular-nums flex-shrink-0 ${
                          newComment.content.length >= MAX_COMMENT_LENGTH ? 'text-amber-600' : 'text-stone-400'
                        }`}
                        id="comment-count"
                        aria-live="polite"
                      >
                        {newComment.content.length}/{MAX_COMMENT_LENGTH}
                      </span>
                    </div>
                  </div>

                  {/* Image upload: compact row */}
                  <div data-testid="image-upload-section">
                    <span className="block text-sm font-medium text-stone-700 mb-1.5">Photo (optional)</span>
                    <div className="flex items-center gap-3 flex-wrap">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageInputChange}
                        className="hidden"
                        data-testid="comment-image-input"
                      />
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 rounded-xl border-stone-200 text-stone-600 hover:bg-stone-100 hover:border-stone-300 flex items-center gap-2"
                        data-testid="image-upload-button"
                      >
                        <PhotoIcon className="h-4 w-4" />
                        Choose image
                      </Button>
                      {imagePreview && (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 flex-shrink-0" data-testid="image-preview-container">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            data-testid="image-preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(setSelectedImage, setImagePreview, setImageError, fileInputRef)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                            data-testid="remove-image-button"
                            aria-label="Remove image"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-stone-500" data-testid="image-upload-help">
                      Max 5MB · JPG, PNG, GIF
                    </p>
                    {imageError && (
                      <p className="mt-1 text-xs text-red-600" data-testid="image-error">
                        {imageError}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
                    disabled={isSubmitting}
                    data-testid="submit-comment-button"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>Post review</>
                    )}
                  </Button>
                </form>
              </section>
            </div>
          </Card.Content>
        </Card>
      </div>
    </>
  );
}