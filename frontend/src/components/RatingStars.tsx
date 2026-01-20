import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  onRate: (rating: number) => void;
}

const RatingStars = ({ rating, onRate }: RatingStarsProps) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          className="transition-transform duration-200 hover:scale-110"
        >
          <Star
            className={cn(
              "w-10 h-10 transition-colors duration-300",
              star <= rating
                ? "fill-primary text-primary"
                : "text-muted-foreground hover:text-primary/50"
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
