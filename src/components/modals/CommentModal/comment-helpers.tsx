import React from 'react';
import { StarIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import ImageWithLightbox from '../../restaurants/ImageWithLightbox';

// Utility for relative time
export function timeAgo(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const initialCommentState = {
  content: '',
  authorName: '',
  rating: 0,
};

export const MAX_COMMENT_LENGTH = 300;

export function validateCommentForm(newComment: typeof initialCommentState) {
  const errors: { [key: string]: string } = {};
  if (!newComment.authorName.trim()) errors.authorName = 'Name is required';
  if (!newComment.rating) errors.rating = 'Rating is required';
  if (!newComment.content.trim()) errors.content = 'Comment is required';
  if (newComment.content.length > MAX_COMMENT_LENGTH)
    errors.content = `Comment must be under ${MAX_COMMENT_LENGTH} characters`;
  return errors;
}

export const CommentItem = React.memo(function CommentItem({ comment }: { comment: { id: string; content: string; authorName: string; createdAt: string; rating: number; imageUrl?: string; hearts?: number } }) {
  return (
    <div
      className="bg-gray-50 p-4 rounded-lg flex gap-3 items-start border border-gray-100 animate-fade-in"
      tabIndex={0}
      aria-label={`Comment by ${comment.authorName}`}
    >
      <div className="flex-shrink-0">
        {comment.authorName ? (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
            {getInitials(comment.authorName)}
          </div>
        ) : (
          <UserCircleIcon className="h-10 w-10 text-gray-300" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{comment.authorName || 'Anonymous'}</span>
          <span className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                aria-hidden="true"
              />
            ))}
          </span>
        </div>
        <p className="mt-1 text-gray-700">{comment.content}</p>
        {comment.imageUrl && (
          <div className="mt-3 relative w-full sm:w-1/2 mx-auto aspect-[4/3] max-h-[300px]">
            <ImageWithLightbox
              src={comment.imageUrl}
              alt={`Image from ${comment.authorName}`}
              width={600}
              height={450}
              className="object-contain rounded-lg w-full h-full"
            />
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500" title={new Date(comment.createdAt).toLocaleString()}>
          {timeAgo(comment.createdAt)}
        </p>
      </div>
    </div>
  );
});

// TODO: Replace 'any' with proper Comment type
export function getCommentKey() {
  // Implementation of getCommentKey function
} 