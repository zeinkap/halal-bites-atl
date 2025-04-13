import { useState, useEffect } from 'react';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  rating: number;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      fetchComments();
    } else {
      setIsVisible(false);
    }
  }, [isOpen, restaurantId]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const fetchComments = async () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newComment, restaurantId }),
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      const newCommentData = await response.json();
      // Add the new comment to the beginning of the list with a fade-in effect
      setComments(prevComments => [newCommentData, ...prevComments]);
      setNewComment({ content: '', authorName: '', rating: 5 });
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
                    <h4 className="font-medium text-gray-900">{comment.authorName}</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < comment.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600">{comment.content}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
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