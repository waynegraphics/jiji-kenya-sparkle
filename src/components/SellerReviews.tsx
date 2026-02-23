import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string | null;
}

interface SellerReviewsProps {
  sellerId: string;
}

const SellerReviews = ({ sellerId }: SellerReviewsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [sellerId]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Fetch reviewer profiles
    const reviewerIds = (data || []).map((r: any) => r.reviewer_id);
    let profileMap: Record<string, { display_name: string; avatar_url: string | null }> = {};
    if (reviewerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", reviewerIds);
      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap[p.user_id] = p;
        });
      }
    }

    const enriched = (data || []).map((r: any) => ({
      ...r,
      reviewer_name: profileMap[r.reviewer_id]?.display_name || "Anonymous",
      reviewer_avatar: profileMap[r.reviewer_id]?.avatar_url,
    }));

    setReviews(enriched);

    if (user) {
      const existing = enriched.find((r: Review) => r.reviewer_id === user.id);
      if (existing) {
        setUserReview(existing);
        setRating(existing.rating);
        setComment(existing.comment || "");
      }
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);

    if (userReview) {
      const { error } = await supabase
        .from("reviews")
        .update({ rating, comment: comment || null })
        .eq("id", userReview.id);
      if (error) toast.error("Failed to update review");
      else toast.success("Review updated!");
    } else {
      const { error } = await supabase.from("reviews").insert({
        reviewer_id: user.id,
        seller_id: sellerId,
        rating,
        comment: comment || null,
      });
      if (error) {
        if (error.code === "23505") toast.error("You already reviewed this seller");
        else toast.error("Failed to submit review");
      } else {
        toast.success("Review submitted! It will be visible after admin approval.");
      }
    }

    await fetchReviews();
    setSubmitting(false);
  };

  const StarRating = ({ value, onChange, hover, onHover, size = "h-5 w-5" }: any) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onHover?.(star)}
          onMouseLeave={() => onHover?.(0)}
          className="transition-colors"
        >
          <Star
            className={`${size} ${
              star <= (hover || value)
                 ? "fill-apa-yellow text-apa-yellow"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Reviews ({reviews.filter(r => r.status === 'approved' || (user && r.reviewer_id === user.id)).length})</h3>

      {/* Write review form */}
      {user && user.id !== sellerId && (
        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium">
            {userReview ? "Update your review" : "Leave a review"}
          </p>
          <StarRating
            value={rating}
            onChange={setRating}
            hover={hoverRating}
            onHover={setHoverRating}
          />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={submitting} size="sm">
            {submitting ? "Saving..." : userReview ? "Update Review" : "Submit Review"}
          </Button>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className={`border-b pb-4 last:border-0 ${review.status === 'pending' ? 'opacity-70' : ''}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                  {review.reviewer_avatar ? (
                    <img
                      src={review.reviewer_avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    review.reviewer_name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{review.reviewer_name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= review.rating
                              ? "fill-apa-yellow text-apa-yellow"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground ml-11">{review.comment}</p>
              )}
              {review.status === 'pending' && user && review.reviewer_id === user.id && (
                <p className="text-xs text-muted-foreground ml-11 mt-1 italic">⏳ Awaiting admin approval</p>
              )}
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerReviews;
