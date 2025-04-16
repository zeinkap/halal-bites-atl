import { useState, useEffect, useCallback, useRef } from 'react';
import { StarIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/solid';
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

export default function CommentModal({ isOpen, onClose, restaurantId, restaurantName }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ content: '', authorName: '', rating: 5 });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?restaurantId=${restaurantId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
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
    } else {
      setIsVisible(false);
    }
  }, [isOpen, restaurantId, fetchComments]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
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
      setNewComment({ content: '', authorName: '', rating: 5 });
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
      <div 
        className={`bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
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
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
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
                >
                  <PhotoIcon className="h-5 w-5" />
                  Choose Image
                </button>
                {imagePreview && (
                  <div className="relative w-20 h-20">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
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
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-gray-500">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div 
                  key={comment.id} 
                  data-testid={`comment-container-${comment.id}`}
                  className="bg-gray-50 p-4 rounded-lg transform transition-all duration-300 ease-in-out opacity-100 translate-y-0"
                  style={{
                    animation: 'fadeSlideIn 0.3s ease-out'
                  }}
                >
                  <style jsx>{`
                    @keyframes fadeSlideIn {
                      from {
                        opacity: 0;
                        transform: translateY(10px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>
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
                    <div className="mt-3 relative w-full aspect-video">
                      <Image
                        src={comment.imageUrl}
                        alt={`Image from ${comment.authorName}`}
                        fill
                        className="object-cover rounded-lg"
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