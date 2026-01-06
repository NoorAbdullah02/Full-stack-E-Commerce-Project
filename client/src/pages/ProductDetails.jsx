import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist } from '../redux/slices/wishlistSlice';
import { createReview, getReviews, markHelpful, resetReviewSuccess } from '../redux/slices/reviewSlice';
import { formatCurrency } from '../utils/currency';
import StarRating from '../components/StarRating';
import RelatedProducts from '../components/RelatedProducts';
import { Heart, ShoppingCart, Star, Check, Truck, Shield, RotateCcw, User, ThumbsUp, ThumbsDown } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Product State
    const [qty, setQty] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { products, loading: productLoading } = useSelector((state) => state.product);
    const product = products.find((p) => p.id === id);

    // Review State
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');

    const {
        reviews,
        averageRating,
        totalReviews,
        loading: reviewsLoading,
        success: reviewSuccess,
        ratingDistribution
    } = useSelector((state) => state.review);

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!products.length) {
            dispatch(listProducts());
        }
        dispatch(getReviews({ productId: id }));
    }, [dispatch, products.length, id]);

    useEffect(() => {
        if (reviewSuccess) {
            setRating(5);
            setTitle('');
            setComment('');
            dispatch(resetReviewSuccess());
        }
    }, [reviewSuccess, dispatch]);

    const addToCartHandler = () => {
        dispatch(addToCart({
            productId: product.id,
            qty,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || product.image
        }));
        navigate('/cart');
    };

    const addToWishlistHandler = () => {
        dispatch(addToWishlist(product.id));
    };

    const submitReviewHandler = (e) => {
        e.preventDefault();
        dispatch(createReview({
            productId: id,
            rating,
            title,
            comment
        }));
    };

    const handleHelpful = (reviewId, type) => {
        dispatch(markHelpful({ reviewId, type }));
    };

    if (productLoading || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="glass p-8 rounded-3xl">
                    <div className="animate-pulse text-gray-600">Loading product...</div>
                </div>
            </div>
        );
    }

    const images = product.images || [product.image || 'https://via.placeholder.com/400'];

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
                    {/* Product Images */}
                    <div className="space-y-4 fade-in-up">
                        <div className="glass rounded-3xl overflow-hidden p-4">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                                <img
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedImage === idx
                                            ? 'border-indigo-600 ring-2 ring-indigo-200'
                                            : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6 fade-in-up delay-100">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/20 mb-4">
                                <span className="text-indigo-600 font-semibold text-xs uppercase tracking-wide">
                                    {product.category?.name || 'Premium Collection'}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1">
                                    <StarRating rating={averageRating || 0} size={20} />
                                </div>
                                <span className="text-gray-600 text-sm">({totalReviews} reviews)</span>
                            </div>

                            <p className="text-gray-700 text-lg leading-relaxed">
                                {product.description || 'Experience premium quality and exceptional design with this carefully curated product. Crafted with attention to detail and built to last.'}
                            </p>
                        </div>

                        <div className="glass rounded-2xl p-6 space-y-6">
                            <div className="flex items-baseline gap-4">
                                <span className="text-5xl font-bold text-gradient">
                                    {formatCurrency(product.price)}
                                </span>
                                {product.price && (
                                    <span className="text-gray-500 line-through text-xl">
                                        {formatCurrency(product.price * 1.3)}
                                    </span>
                                )}
                                <span className="badge bg-green-100 text-green-700">Save 30%</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                                    <select
                                        value={qty}
                                        onChange={(e) => setQty(Number(e.target.value))}
                                        className="glass rounded-xl px-4 py-2 border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                    >
                                        {[...Array(Math.max(0, Math.min(product.stock || 10, 10))).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                                        ))}
                                    </select>
                                    {product.stock > 0 ? (
                                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                            <Check className="w-4 h-4" /> In Stock
                                        </span>
                                    ) : (
                                        <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={addToCartHandler}
                                        className={`flex-1 h-14 text-lg rounded-xl flex items-center justify-center gap-2 transition-all ${product.stock > 0 ? 'btn-primary' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                        disabled={!product.stock || product.stock <= 0}
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                    <button
                                        onClick={addToWishlistHandler}
                                        className="h-14 px-6 rounded-xl glass border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105"
                                    >
                                        <Heart className="w-5 h-5 text-pink-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="glass rounded-2xl p-6 space-y-4">
                            <h3 className="font-semibold text-lg mb-4">Why Choose This Product?</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <Truck className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Free Shipping</h4>
                                        <p className="text-sm text-gray-600">On orders over ৳5000</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-amber-400 flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">1-Year Warranty</h4>
                                        <p className="text-sm text-gray-600">Full coverage included</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-400 flex items-center justify-center flex-shrink-0">
                                        <RotateCcw className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">30-Day Returns</h4>
                                        <p className="text-sm text-gray-600">Hassle-free returns</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="glass rounded-3xl p-8 fade-in-up delay-200">
                    <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>

                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Rating Summary */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="text-center p-6 glass rounded-2xl bg-white/30">
                                <div className="text-5xl font-bold mb-2">{averageRating?.toFixed(1) || 0}</div>
                                <div className="flex justify-center mb-2">
                                    <StarRating rating={averageRating || 0} size={24} />
                                </div>
                                <p className="text-gray-600">Based on {totalReviews} reviews</p>
                            </div>

                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star} className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 w-16">
                                            <span className="font-medium">{star}</span>
                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        </div>
                                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-400 rounded-full"
                                                style={{ width: `${totalReviews ? (ratingDistribution?.[star] / totalReviews) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <div className="w-10 text-right text-sm text-gray-600">
                                            {ratingDistribution?.[star] || 0}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!userInfo && (
                                <div className="p-6 bg-indigo-50 rounded-2xl text-center">
                                    <h3 className="font-semibold mb-2">Have this product?</h3>
                                    <p className="text-sm text-gray-600 mb-4">Log in to share your thoughts with other customers.</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="btn-primary w-full py-2 rounded-xl"
                                    >
                                        Log In to Review
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Reviews List & Form */}
                        <div className="lg:col-span-8 space-y-8">
                            {userInfo && (
                                <div className="glass rounded-2xl p-6">
                                    <h3 className="text-xl font-bold mb-4">Write a Review</h3>
                                    <form onSubmit={submitReviewHandler} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                            <StarRating rating={rating} setRating={setRating} interactive={true} size={28} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="input-glass w-full"
                                                placeholder="Summarize your experience"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                className="input-glass w-full h-32 resize-none"
                                                placeholder="What did you like or dislike?"
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary px-8 py-3 rounded-xl">
                                            Submit Review
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div className="space-y-6">
                                {reviewsLoading ? (
                                    <div className="text-center py-8">Loading reviews...</div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No reviews yet. Be the first to review!
                                    </div>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review.id} className="glass rounded-2xl p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                        {review.user?.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold flex items-center gap-2">
                                                            {review.user?.name}
                                                            {review.verified && (
                                                                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                    <Check className="w-3 h-3" /> Verified
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <StarRating rating={review.rating} size={14} />
                                                            <span>•</span>
                                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <h5 className="font-bold text-lg mb-2">{review.title}</h5>
                                            <p className="text-gray-700 mb-4 whitespace-pre-line">{review.comment}</p>

                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleHelpful(review.id, 'helpful')}
                                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                    Helpful ({review.helpful || 0})
                                                </button>
                                                <button
                                                    onClick={() => handleHelpful(review.id, 'notHelpful')}
                                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                                                >
                                                    <ThumbsDown className="w-4 h-4" />
                                                    Not Helpful ({review.notHelpful || 0})
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
            </div>
        </div>
    );
};

export default ProductDetails;
