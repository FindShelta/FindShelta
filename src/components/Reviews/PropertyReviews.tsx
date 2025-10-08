import React, { useState } from 'react';
import { Star, MessageCircle, ThumbsUp, User } from 'lucide-react';

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
}

interface PropertyReviewsProps {
  propertyId: string;
  reviews: Review[];
  averageRating: number;
  onAddReview: (rating: number, comment: string) => void;
}

const PropertyReviews: React.FC<PropertyReviewsProps> = ({ 
  propertyId, 
  reviews, 
  averageRating, 
  onAddReview 
}) => {
  const [showAddReview, setShowAddReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddReview(newRating, newComment);
      setNewComment('');
      setNewRating(5);
      setShowAddReview(false);
    }
  };

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reviews</h3>
          <div className="flex items-center space-x-1">
            {renderStars(Math.round(averageRating))}
            <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
              {averageRating.toFixed(1)} ({reviews.length})
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowAddReview(!showAddReview)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Add Review
        </button>
      </div>

      {showAddReview && (
        <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNewRating(i + 1)}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 ${i < newRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience with this property..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
              rows={3}
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowAddReview(false)}
              className="px-3 py-1.5 text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Submit Review
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 dark:border-slate-700 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{review.user_name}</span>
                    <div className="flex space-x-1">
                      {renderStars(review.rating, 'w-3 h-3')}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{review.comment}</p>
                  <button className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({review.helpful_count})</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertyReviews;