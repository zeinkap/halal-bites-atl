import { useState, useEffect, useCallback, useRef } from 'react';
import { StarIcon, XMarkIcon, PhotoIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  rating: number;
  imageUrl?: string;
  createdAt: string;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
}

const initialCommentState = {
  content: '',
  authorName: '',
  rating: 0
};

export default function CommentModal({ isOpen, onClose, restaurantId, restaurantName }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
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

  // Track form changes
  useEffect(() => {
    const hasFormChanges = 
      newComment.content !== initialCommentState.content ||
      newComment.authorName !== initialCommentState.authorName ||
      newComment.rating !== initialCommentState.rating ||
      selectedImage !== null;

    setHasChanges(hasFormChanges);
  }, [newComment, selectedImage]);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      // Sort comments by createdAt in descending order (newest first)
      const sortedComments = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComments(sortedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      fetchComments();
      setHasChanges(false); // Reset changes flag when modal opens
    } else {
      setIsVisible(false);
    }
  }, [isOpen, restaurantId, fetchComments]);

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    setIsVisible(false);
    setNewComment(initialCommentState);
    setSelectedImage(null);
    setImagePreview(null);
    setImageError(null);
    setShowConfirmDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleConfirmClose = () => {
    closeModal();
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageError(null);
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setImageError('Image size must be less than 5MB');
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      if (!file.type.startsWith('image/')) {
        setImageError('Invalid file type. Please upload an image.');
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setComments(prevComments => [newCommentData, ...prevComments]);
      setNewComment({ content: '', authorName: '', rating: 0 });
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
          onClick={(e) => e.stopPropagation()}
          data-testid="confirm-dialog-backdrop"
        >
          <div 
            className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 transform transition-all"
            data-testid="confirm-dialog"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold text-gray-900"
                  data-testid="confirm-dialog-title"
                >
                  Discard Changes?
                </h3>
                <p 
                  className="mt-2 text-sm text-gray-600"
                  data-testid="confirm-dialog-message"
                >
                  You have unsaved changes. Are you sure you want to close this form? Your changes will be lost.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancelClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                    data-testid="confirm-dialog-keep-editing"
                  >
                    No, Keep Editing
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer"
                    data-testid="confirm-dialog-discard"
                  >
                    Yes, Discard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div 
        className={`bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 z-10 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Comments for {restaurantName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                This site is community-driven - we encourage you to share your experiences and help others discover great halal restaurants!
              </p>
            </div>
            <button
              onClick={handleClose}
              data-testid="close-modal-button"
              className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Add Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg" data-testid="comment-form">
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                id="authorName"
                data-testid="comment-author-input"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black"
                value={newComment.authorName}
                onChange={(e) => setNewComment({ ...newComment, authorName: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                Rating
              </label>
              <div className="flex items-center mt-1 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    data-testid={`rating-star-${star}-button`}
                    onClick={() => setNewComment({ ...newComment, rating: star })}
                    className={`${
                      star <= newComment.rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 focus:outline-none cursor-pointer`}
                  >
                    <StarIcon className="h-5 w-5" />
                  </button>
                ))}
              </div>
              {!newComment.rating && (
                <p className="mt-1 text-sm text-red-500" data-testid="rating-error">
                  Please select a rating
                </p>
              )}
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                Your Comment
              </label>
              <textarea
                id="comment"
                data-testid="comment-content-input"
                required
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black"
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
              />
            </div>

            {/* Image Upload */}
            <div>
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
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2"
                  data-testid="image-upload-button"
                >
                  <PhotoIcon className="h-5 w-5" />
                  Choose Image
                </button>
                {imagePreview && (
                  <div className="relative w-20 h-20">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      data-testid="image-preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        setImageError(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      data-testid="remove-image-button"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
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

            <button
              type="submit"
              data-testid="submit-comment-button"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-blue-500 hover:to-blue-600 transform transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-sm cursor-pointer disabled:opacity-50 relative"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                'Add Comment'
              )}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4" data-testid="comments-list">
            {isLoading ? (
              <p className="text-center text-gray-500" data-testid="comments-loading">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-center text-gray-500" data-testid="no-comments-message">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div 
                  key={comment.id} 
                  data-testid={`comment-container-${comment.id}`}
                  className="bg-gray-50 p-4 rounded-lg transform transition-all duration-300 ease-in-out opacity-100 translate-y-0"
                >
                  <div className="flex items-center justify-between">
                    <h4 
                      className="font-medium text-gray-900"
                      data-testid={`comment-author-${comment.id}`}
                    >
                      {comment.authorName}
                    </h4>
                    <div 
                      className="flex items-center"
                      data-testid={`comment-rating-${comment.id}`}
                    >
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          data-testid={`comment-star-${comment.id}-${i + 1}`}
                          className={`h-4 w-4 ${
                            i < comment.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p 
                    className="mt-2 text-gray-600"
                    data-testid={`comment-content-${comment.id}`}
                  >
                    {comment.content}
                  </p>
                  {comment.imageUrl && (
                    <div 
                      className="mt-3 relative w-full aspect-[4/3] max-h-[400px]" 
                      data-testid={`comment-image-container-${comment.id}`}
                    >
                      <Image
                        src={comment.imageUrl}
                        alt={`Image from ${comment.authorName}`}
                        data-testid={`comment-image-${comment.id}`}
                        fill
                        className="object-contain rounded-lg"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    </div>
                  )}
                  <p 
                    className="mt-2 text-sm text-gray-500"
                    data-testid={`comment-date-${comment.id}`}
                  >
                    {new Date(comment.createdAt).toLocaleString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 