import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, Flag, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Review {
  id: number;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  content: string;
  helpful: number;
  verified: boolean;
}

const sampleReviews: Review[] = [
  {
    id: 1,
    author: "John Maker",
    rating: 5,
    date: "2024-01-15",
    content: "Excellent quality Arduino board! Works perfectly with all my projects. Fast shipping and great packaging. Highly recommended for beginners and pros alike.",
    helpful: 24,
    verified: true,
  },
  {
    id: 2,
    author: "Sarah Tech",
    rating: 4,
    date: "2024-01-10",
    content: "Good product overall. The board functions well, though I had some minor issues with the USB driver initially. Customer support was helpful in resolving it.",
    helpful: 12,
    verified: true,
  },
  {
    id: 3,
    author: "Mike Electronics",
    rating: 5,
    date: "2024-01-05",
    content: "Best price for genuine Arduino boards. I've ordered multiple times and quality is always consistent. Perfect for my robotics class.",
    helpful: 18,
    verified: false,
  },
];

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

const StarRatingInput = ({ rating, onRatingChange, size = "md" }: StarRatingInputProps) => {
  const [hover, setHover] = useState(0);
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hover || rating)
                ? "text-yellow-500 fill-yellow-500"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

interface ReviewSectionProps {
  productId: number;
  averageRating?: number;
  totalReviews?: number;
}

export const ReviewSection = ({ productId, averageRating = 4.8, totalReviews = 256 }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState(sampleReviews);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState("");

  const handleSubmitReview = () => {
    if (newRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (newReview.trim().length < 10) {
      toast.error("Please write at least 10 characters");
      return;
    }

    const review: Review = {
      id: Date.now(),
      author: "You",
      rating: newRating,
      date: new Date().toISOString().split("T")[0],
      content: newReview,
      helpful: 0,
      verified: false,
    };

    setReviews([review, ...reviews]);
    setNewRating(0);
    setNewReview("");
    setShowWriteReview(false);
    toast.success("Review submitted successfully!");
  };

  const handleHelpful = (reviewId: number) => {
    setReviews(reviews.map((r) => r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r));
    toast.success("Thanks for your feedback!");
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    percentage: (reviews.filter((r) => r.rating === stars).length / reviews.length) * 100,
  }));

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-8 p-6 rounded-2xl bg-card border border-border">
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-foreground mb-2">{averageRating}</div>
          <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <p className="text-muted-foreground">Based on {totalReviews} reviews</p>
        </div>

        <div className="space-y-2">
          {ratingBreakdown.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-8">{stars}★</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: (5 - stars) * 0.1 }}
                  className="h-full gradient-primary"
                />
              </div>
              <span className="text-sm text-muted-foreground w-8">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-foreground">Customer Reviews</h3>
        <Button variant="hero" onClick={() => setShowWriteReview(!showWriteReview)}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {/* Write Review Form */}
      <AnimatePresence>
        {showWriteReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your Rating</label>
                <StarRatingInput rating={newRating} onRatingChange={setNewRating} size="lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Your Review</label>
                <Textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="hero" onClick={handleSubmitReview}>Submit Review</Button>
                <Button variant="outline" onClick={() => setShowWriteReview(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{review.author}</span>
                    {review.verified && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-500">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-4">{review.content}</p>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpful(review.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Helpful ({review.helpful})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
