import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import {
  initialCommentState,
  MAX_COMMENT_LENGTH,
  CommentItem
} from './comment-helpers';
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
  const fetchCommentsCallback = useCallback(() => {
    fetchComments(restaurantId, setComments, setIsLoading);
  }, [restaurantId]);

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
          className="w-full max-w-md mx-auto rounded-2xl shadow-xl bg-white transform transition-all h-[100dvh] max-h-[100dvh] flex flex-col sm:max-h-[90vh] sm:h-auto"
          data-testid="comment-modal-panel"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Header */}
          <Card.Header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-2 sm:p-4 z-10 shadow-sm" data-testid="comment-modal-header">
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
                  if (!canClose) return;
                  if (hasChanges) setShowConfirmDialog(true);
                  else {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }
                }} disabled={!canClose} data-testid="close-modal-button" />
            </div>
          </Card.Header>
          <Card.Content className="flex-1 flex flex-col min-h-0 p-1 sm:p-4 gap-1 sm:gap-4">
              {/* Comments List */}
              <div className="flex-1 min-h-[180px] sm:min-h-[100px] min-h-0 overflow-y-auto space-y-1 sm:space-y-4" data-testid="comments-list">
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
              {/* Add Comment Form pinned at bottom */}
              <form
                className="bg-white/95 backdrop-blur-sm border-t border-gray-200 pt-1 pb-1 px-1 sm:pt-2 sm:pb-1 sm:px-2 z-10 shadow-sm space-y-1 sm:space-y-2 flex-shrink-0"
                onSubmit={handleSubmit}
                aria-busy={isSubmitting}
                data-testid="comment-form"
              >
                <div className="overflow-y-auto max-h-[40vh]">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Add a Comment</h3>
                  <div>
                    <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-0.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="authorName"
                      data-testid="comment-author-input"
                      required
                      ref={nameInputRef}
                      className={`mt-1 block w-full rounded-lg border border-gray-300 px-2 py-1 text-xs sm:text-sm text-black h-8 sm:h-9 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-colors ${
                        formErrors.authorName ? 'border-red-500' : ''
                      } mb-1 sm:mb-2`}
                      value={newComment.authorName}
                      onChange={(e) => setNewComment({ ...newComment, authorName: e.target.value })}
                      aria-invalid={!!formErrors.authorName}
                      aria-describedby={formErrors.authorName ? 'authorName-error' : undefined}
                    />
                      {formErrors.authorName && (
                        <p className="mt-0.5 text-xs text-red-600" id="authorName-error">
                          {formErrors.authorName}
                        </p>
                      )}
                  </div>
                  <div>
                    <label htmlFor="rating" className="block text-xs font-medium text-gray-700">
                      Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center mt-0.5 space-x-1" data-testid="rating-stars-container">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          data-testid={`rating-star-${star}-button`}
                          onClick={() => setNewComment({ ...newComment, rating: star })}
                          className={`${star <= newComment.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 focus:outline-none cursor-pointer transition-transform duration-100 active:scale-110`}
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setNewComment({ ...newComment, rating: star });
                            }
                          }}
                        >
                          <StarIcon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                    {formErrors.rating && (
                      <p className="mt-0.5 text-xs text-red-600">{formErrors.rating}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-0.5">
                      Your Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="comment"
                      data-testid="comment-content-input"
                      required
                      rows={3}
                      maxLength={MAX_COMMENT_LENGTH}
                      className={`mt-1 block w-full rounded-lg border border-gray-300 px-2 py-1 text-xs sm:text-sm text-black h-16 sm:h-20 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-colors ${
                        formErrors.content ? 'border-red-500' : ''
                      } mb-1 sm:mb-2`}
                      value={newComment.content}
                      onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                      aria-invalid={!!formErrors.content}
                      aria-describedby={formErrors.content ? 'comment-error' : undefined}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
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
                    <label className="block text-sm font-medium text-gray-700 mb-0.5">
                      Add Image (optional)
                    </label>
                    <div className="mt-0.5 flex items-center space-x-2">
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
                        className="h-7 sm:h-8 text-xs rounded w-full sm:w-auto"
                        data-testid="image-upload-button"
                      >
                        Choose Image
                      </Button>
                      {imagePreview && (
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12" data-testid="image-preview-container">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            data-testid="image-preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            onClick={() => removeImage(setSelectedImage, setImagePreview, setImageError, fileInputRef)}
                            variant="danger"
                            size="icon"
                            className="absolute -top-1 -right-1"
                            data-testid="remove-image-button"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500" data-testid="image-upload-help">
                      Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                    </p>
                    {imageError && (
                      <p className="mt-0.5 text-xs text-red-500" data-testid="image-error">
                        {imageError}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full flex items-center justify-center h-8 sm:h-9 text-xs sm:text-sm"
                  disabled={isSubmitting}
                  data-testid="submit-comment-button"
                >
                  {isSubmitting && (
                    <span className="animate-spin mr-2 h-3 sm:h-4 w-3 sm:w-4 border-2 border-t-2 border-gray-300 border-t-primary-500 rounded-full"></span>
                  )}
                  {isSubmitting ? 'Submitting...' : 'Add Comment'}
                </Button>
              </form>
          </Card.Content>
        </Card>
      </div>
    </>
  );
}