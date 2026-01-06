import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ rating, setRating, interactive = false, size = 20, showCount = false, count = 0 }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    const handleRating = (index) => {
        if (interactive && setRating) {
            setRating(index);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    const isFull = starValue <= fullStars;
                    const isHalf = !isFull && hasHalfStar && starValue === fullStars + 1;

                    return (
                        <div
                            key={index}
                            className={`relative ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                            onClick={() => handleRating(starValue)}
                            onMouseEnter={() => interactive && setRating && setRating(starValue)}
                        >
                            {isHalf ? (
                                <div className="relative">
                                    <Star className={`text-gray-300 w-[${size}px] h-[${size}px]`} style={{ width: size, height: size }} />
                                    <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                                        <Star className={`fill-amber-400 text-amber-400 w-[${size}px] h-[${size}px]`} style={{ width: size, height: size }} />
                                    </div>
                                </div>
                            ) : (
                                <Star
                                    className={`${isFull ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                                        }`}
                                    style={{ width: size, height: size }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {showCount && (
                <span className="text-sm text-gray-500 font-medium">({count})</span>
            )}
        </div>
    );
};

export default StarRating;
