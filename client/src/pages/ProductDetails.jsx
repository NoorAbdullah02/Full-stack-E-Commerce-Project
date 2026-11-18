import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToast } from '../redux/slices/toastSlice';
import { createReview, getReviews, markHelpful, resetReviewSuccess } from '../redux/slices/reviewSlice';
import { formatCurrency } from '../utils/currency';
import StarRating from '../components/StarRating';
import RelatedProducts from '../components/RelatedProducts';
import { Heart, ShoppingCart, Star, Check, Truck, ShieldCheck, User, ThumbsUp, ThumbsDown, Sprout, Droplets, Sun, Sparkles, MessageCircle, Phone, Plus, Minus, ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Product State
    const [qty, setQty] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const { products, loading: productLoading } = useSelector((state) => state.product);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    const product = products.find((p) => p.id === id);

    const isSaved = wishlistItems?.some(item => (
        item.productId === id ||
        item.id === id ||
        item.product?.id === id
    ));

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
    } = useSelector((state) => state.review);

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        window.scrollTo(0, 0);
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
            dispatch(addToast({ message: 'Thank you for your plant review! 🌿', type: 'success' }));
        }
    }, [reviewSuccess, dispatch]);

    const handleIncrement = () => {
        const maxStock = product?.stock || 10;
        setQty((prev) => Math.min(maxStock, prev + 1));
    };

    const handleDecrement = () => {
        setQty((prev) => Math.max(1, prev - 1));
    };

    const addToCartHandler = async () => {
        if (!product || isAdding || product.stock <= 0) return;
        setIsAdding(true);
        try {
            await dispatch(addToCart({
                productId: product.id,
                qty,
                name: product.name,
                price: Number(product.price) || 0,
                image: product.images?.[0] || product.image || 'https://via.placeholder.com/400',
                stock: product.stock,
            })).unwrap();

            dispatch(addToast({
                message: `🌿 Added ${qty} × "${product.name}" to cart!`,
                type: 'success',
                duration: 3500,
                link: { text: 'View Cart 🛒', url: '/cart' }
            }));
        } catch {
            dispatch(addToast({
                message: `Added "${product.name}" to cart!`,
                type: 'success',
                duration: 3500,
                link: { text: 'View Cart 🛒', url: '/cart' }
            }));
        } finally {
            setTimeout(() => setIsAdding(false), 450);
        }
    };

    const toggleWishlistHandler = async () => {
        if (!product) return;
        if (isSaved) {
            await dispatch(removeFromWishlist(product.id));
            dispatch(addToast({
                message: `🤍 Removed "${product.name}" from saved list`,
                type: 'info',
                duration: 2500
            }));
        } else {
            await dispatch(addToWishlist(product));
            dispatch(addToast({
                message: `❤️ "${product.name}" saved to wishlist!`,
                type: 'success',
                duration: 2500,
                link: { text: 'View Wishlist', url: '/wishlist' }
            }));
        }
    };

    // Fallback alias for safety
    const addToWishlistHandler = toggleWishlistHandler;

    const submitReviewHandler = (e) => {
        e.preventDefault();
        dispatch(createReview({
            productId: id,
            rating,
            title,
            comment
        }));
    };

    if (productLoading || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="glass p-8 rounded-3xl text-center">
                    <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <div className="text-gray-600 font-medium">Nurturing plant details...</div>
                </div>
            </div>
        );
    }

    const images = product.images?.length > 0 ? product.images : [product.image || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800&auto=format&fit=crop&q=80'];
    const itemTotal = (Number(product.price) || 0) * qty;

    return (
        <div className="min-h-screen pt-24 pb-28 sm:pb-20 px-3 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Back Navigation Button */}
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/products')}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl glass border border-emerald-100/90 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/80 font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95 group"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Plants (পেছনে যান)</span>
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start mb-16">
                    
                    {/* Product Images Studio */}
                    <div className="space-y-4 fade-in-up">
                        <div className="glass rounded-3xl overflow-hidden p-3 sm:p-4 border border-emerald-100 bg-white/70 shadow-lg">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 to-gray-50 relative">
                                <img
                                    src={images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                                {product.discount > 0 && (
                                    <div className="absolute top-3 left-3 bg-rose-500 text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-md">
                                        -{product.discount}% OFF
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2.5">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedImage === idx
                                            ? 'border-emerald-600 ring-2 ring-emerald-200 scale-105'
                                            : 'border-gray-200 hover:border-emerald-300'
                                            }`}
                                    >
                                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-5 sm:space-y-6 fade-in-up delay-100">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-2.5">
                                <Sprout className="w-4 h-4 text-emerald-600" />
                                <span className="text-emerald-800 font-bold text-xs uppercase tracking-wide">
                                    {product.category?.name || 'Living Botanical Collection'}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-3 mb-3">
                                <StarRating rating={averageRating || 5} size={18} />
                                <span className="text-gray-500 text-xs sm:text-sm font-medium">({totalReviews} customer reviews)</span>
                            </div>

                            <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed bg-white/70 p-3.5 sm:p-4 rounded-2xl border border-emerald-100/80">
                                {product.description || 'Carefully potted in nutrient-rich organic soil to promote strong root establishment and vibrant foliage. Ready to brighten your home, balcony, or office space.'}
                            </p>
                        </div>

                        {/* Mobile-Perfect Price & Cart Actions Card */}
                        <div className="bg-white rounded-3xl p-5 sm:p-6 space-y-4 border border-emerald-200/80 shadow-xl shadow-emerald-500/5">
                            
                            {/* Price Section */}
                            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-gray-100">
                                <div className="flex items-baseline gap-2.5">
                                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-700 font-mono tracking-tight">
                                        {formatCurrency(product.price)}
                                    </span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <span className="text-gray-400 line-through text-base sm:text-lg font-medium">
                                            {formatCurrency(product.originalPrice)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {product.stock > 0 ? (
                                        <span className="text-xs sm:text-sm text-emerald-800 font-bold bg-emerald-100/80 px-3 py-1 rounded-full flex items-center gap-1">
                                            <Check className="w-3.5 h-3.5 text-emerald-600" /> In Stock ({product.stock})
                                        </span>
                                    ) : (
                                        <span className="text-xs sm:text-sm text-rose-700 font-bold bg-rose-100 px-3 py-1 rounded-full">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quantity Stepper & Subtotal Row (Mobile Ergonomic) */}
                            <div className="flex items-center justify-between gap-3 pt-1">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                        Select Quantity:
                                    </span>
                                    
                                    {/* Tactile Touch Stepper */}
                                    <div className="inline-flex items-center bg-gray-100 rounded-2xl p-1 border border-gray-200">
                                        <button
                                            type="button"
                                            onClick={handleDecrement}
                                            disabled={qty <= 1}
                                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-gray-700 flex items-center justify-center font-bold hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-90 transition-all"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>

                                        <span className="w-10 sm:w-12 text-center font-black text-base sm:text-lg font-mono text-gray-900 select-none">
                                            {qty}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={handleIncrement}
                                            disabled={qty >= (product.stock || 10)}
                                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-gray-700 flex items-center justify-center font-bold hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-90 transition-all"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                                        Total Amount:
                                    </span>
                                    <span className="text-xl sm:text-2xl font-black text-gray-900 font-mono">
                                        {formatCurrency(itemTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Main CTA Buttons - Deluxe Botanical Design */}
                            <div className="flex items-center gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={addToCartHandler}
                                    disabled={product.stock <= 0 || isAdding}
                                    className={`relative overflow-hidden flex-1 h-14 sm:h-16 rounded-2xl text-base sm:text-lg font-black flex items-center justify-center gap-3 transition-all duration-300 shadow-xl active:scale-[0.98] ${
                                        product.stock > 0
                                            ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-emerald-700/30 hover:shadow-emerald-700/40 ring-2 ring-emerald-300/60'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    {/* Animated Shimmer Ray */}
                                    {product.stock > 0 && !isAdding && (
                                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                                    )}

                                    {isAdding ? (
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Adding to Botanical Cart...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2.5">
                                            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                                            <span>{product.stock > 0 ? `Add to Cart • ${formatCurrency(itemTotal)}` : 'Out of Stock'}</span>
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={toggleWishlistHandler}
                                    className={`h-14 sm:h-16 w-14 sm:w-16 rounded-2xl border-2 transition-all duration-200 active:scale-90 flex items-center justify-center flex-shrink-0 shadow-md ${
                                        isSaved
                                            ? 'border-red-400 bg-red-50 text-red-500 ring-2 ring-red-300 shadow-red-500/20'
                                            : 'border-gray-200 bg-white hover:bg-rose-50 text-gray-400 hover:text-red-500'
                                    }`}
                                    title={isSaved ? "Saved in Wishlist (Click to remove)" : "Save to Wishlist"}
                                >
                                    <Heart className={`w-6 h-6 transition-transform duration-300 ${isSaved ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Living Plant Quality Guarantee */}
                        <div className="bg-emerald-50/60 rounded-3xl p-4 sm:p-6 space-y-3.5 border border-emerald-200/80 shadow-sm">
                            <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                Green Petals Plant Guarantee & Care
                            </h3>

                            <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm text-gray-700">
                                <div className="flex items-start gap-2.5 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                                    <Sprout className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-gray-900 block">100% Viable Root Guarantee:</strong>
                                        <span className="text-gray-600 text-[11px] sm:text-xs">Nurtured with organic compost; free replacement if damaged in transit.</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                                    <Droplets className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-gray-900 block">Moisture-Lock Protective Box:</strong>
                                        <span className="text-gray-600 text-[11px] sm:text-xs">Ventilated mailers keep roots hydrated across all 64 districts.</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                                    <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-gray-900 block">Express Plant Courier:</strong>
                                        <span className="text-gray-600 text-[11px] sm:text-xs">Barishal Metro ৳100 (24–48h) | All Other Districts ৳150 (2–4 days). Weight-based courier: +৳20 per extra kg.</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                                    <Phone className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-gray-900 block">Personal Care Advice:</strong>
                                        <span className="text-gray-600 text-[11px] sm:text-xs">Call proprietor Munnar Khanam: <a href="tel:01768686120" className="text-emerald-700 font-bold hover:underline">01768686120</a></span>
                                    </div>
                                </div>

                                <a
                                    href="https://www.facebook.com/share/1E2Y48eA5s/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between bg-[#1877F2]/10 hover:bg-[#1877F2]/20 p-2.5 rounded-xl border border-[#1877F2]/20 transition-colors text-xs text-[#1877F2] font-semibold"
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        Facebook Page & Consultation:
                                    </span>
                                    <span className="font-bold underline">Green Petals FB</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Reviews Section */}
                <div className="glass rounded-3xl p-5 sm:p-8 fade-in-up delay-200 border border-emerald-100 mb-16">
                    <h2 className="text-xl sm:text-3xl font-bold mb-5 text-gray-900">Customer Plant Experiences</h2>

                    <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                        {/* Rating Summary */}
                        <div className="lg:col-span-4 p-5 glass rounded-2xl bg-emerald-50/40 border border-emerald-100 text-center">
                            <div className="text-4xl sm:text-5xl font-black text-emerald-900 mb-1.5">{averageRating?.toFixed(1) || '5.0'}</div>
                            <div className="flex justify-center mb-1.5">
                                <StarRating rating={averageRating || 5} size={20} />
                            </div>
                            <p className="text-xs text-gray-500">Based on {totalReviews} verified reviews</p>
                        </div>

                        {/* Review Form */}
                        <div className="lg:col-span-8">
                            {userInfo ? (
                                <form onSubmit={submitReviewHandler} className="space-y-3.5 glass p-5 rounded-2xl border border-emerald-100">
                                    <h3 className="font-bold text-sm sm:text-base text-gray-900">Write a Review for {product.name}</h3>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                            Your Rating (রেটিং নির্বাচন করুন)
                                        </label>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        className="p-1 hover:scale-125 active:scale-95 transition-all focus:outline-none"
                                                        aria-label={`${star} star rating`}
                                                    >
                                                        <Star
                                                            className={`w-7 h-7 transition-colors ${
                                                                star <= rating
                                                                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                                                    : 'text-gray-300 hover:text-amber-300'
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <span className="text-xs sm:text-sm font-bold text-emerald-900 sm:ml-2">
                                                {rating === 5 && '🌱 5/5 - Thriving & Healthy Plant'}
                                                {rating === 4 && '🌿 4/5 - Great Growth & Foliage'}
                                                {rating === 3 && '🪴 3/5 - Average Plant Quality'}
                                                {rating === 2 && '🍂 2/5 - Below Expectations'}
                                                {rating === 1 && '⚠️ 1/5 - Poor Condition'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Review Headline</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Arrived fresh with glossy leaves!"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="input-glass w-full text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Your Feedback</label>
                                        <textarea
                                            rows="3"
                                            required
                                            placeholder="Share your experience with unboxing, foliage health, and packaging..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="input-glass w-full text-xs sm:text-sm resize-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={reviewsLoading}
                                        className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold"
                                    >
                                        {reviewsLoading ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            ) : (
                                <div className="glass p-5 rounded-2xl text-center border border-emerald-100">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-2.5">Please sign in to share your review of this plant.</p>
                                    <button onClick={() => navigate('/login')} className="btn-primary py-2 px-5 rounded-xl text-xs font-bold">
                                        Log In to Review
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews List */}
                    {reviews?.length > 0 && (
                        <div className="mt-6 space-y-3 pt-5 border-t border-emerald-100">
                            {reviews.map((rev) => (
                                <div key={rev.id} className="p-3.5 rounded-2xl bg-white border border-emerald-50 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs sm:text-sm text-gray-900">{rev.user?.name || 'Plant Parent'}</span>
                                        <StarRating rating={rev.rating} size={13} />
                                    </div>
                                    {rev.title && <h4 className="font-semibold text-xs text-emerald-800">{rev.title}</h4>}
                                    <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Related Plants */}
                {product.categoryId && (
                    <RelatedProducts currentProductId={product.id} categoryId={product.categoryId} />
                )}
            </div>

            {/* Mobile Fixed Bottom Sticky Bar for Fast Checkout */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 p-3 shadow-2xl flex items-center justify-between gap-3">
                <div className="min-w-[80px]">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Total</span>
                    <span className="text-lg font-black text-emerald-800 font-mono leading-none">{formatCurrency(itemTotal)}</span>
                </div>
                <div className="flex items-center gap-2 flex-1 justify-end">
                    <button
                        type="button"
                        onClick={toggleWishlistHandler}
                        className={`w-12 h-12 rounded-xl border-2 transition-all active:scale-90 flex items-center justify-center flex-shrink-0 ${
                            isSaved
                                ? 'border-red-400 bg-red-50 text-red-500 ring-2 ring-red-200 shadow-sm'
                                : 'border-gray-200 text-gray-400 bg-white hover:text-red-500'
                        }`}
                        title={isSaved ? "Saved" : "Wishlist"}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <button
                        type="button"
                        onClick={addToCartHandler}
                        disabled={product.stock <= 0 || isAdding}
                        className="flex-1 h-12 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isAdding ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4" />
                                <span>Add to Cart</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
