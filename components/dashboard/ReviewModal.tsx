
import React, { useState } from 'react';
import { CloseIcon, StarIcon } from '../icons';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
    lawyerName: string;
}

const StarRating: React.FC<{ rating: number; onRate: (rating: number) => void; hoverRating: number; setHoverRating: (rating: number) => void; }> = ({ rating, onRate, hoverRating, setHoverRating }) => {
    return (
        <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transform transition-transform duration-150 hover:scale-125"
                >
                    <StarIcon
                        className={`w-10 h-10 cursor-pointer transition-colors ${
                            (hoverRating || rating) >= star ? 'text-cla-gold' : 'text-gray-600'
                        }`}
                        isFilled={(hoverRating || rating) >= star}
                    />
                </button>
            ))}
        </div>
    );
};

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, lawyerName }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0) {
            onSubmit(rating, comment);
        } else {
            alert('Please select a star rating.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[101] animate-fade-in p-4">
            <div className="bg-cla-bg-dark text-cla-text-dark rounded-lg shadow-xl w-full max-w-lg m-4 border border-cla-border-dark">
                <div className="p-6 border-b border-cla-border-dark flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                        Rate Your Experience with <span className="text-cla-gold">{lawyerName}</span>
                    </h2>
                    <button onClick={onClose} className="text-cla-text-muted-dark hover:text-white">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-center text-sm font-medium text-white mb-2">Overall Rating</label>
                        <StarRating rating={rating} onRate={setRating} hoverRating={hoverRating} setHoverRating={setHoverRating} />
                    </div>
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-white">
                            Share your feedback (optional)
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-cla-border-dark rounded-md bg-cla-surface-dark text-white focus:ring-cla-gold focus:border-cla-gold"
                            placeholder="How was your experience? What did they do well?"
                        />
                    </div>
                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={rating === 0}
                            className="w-full bg-cla-gold hover:bg-cla-gold-darker text-cla-text font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Submit Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};