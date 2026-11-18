import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToast } from '../redux/slices/toastSlice';
import { useNavigate } from 'react-router-dom';
import Newsletter from '../components/Newsletter';
import PlantGuaranteeCard from '../components/PlantGuaranteeCard';
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck, Clock, Sparkles, Shield, Heart, ShoppingCart, Eye, X, ChevronLeft, ChevronRight, Sprout, Shuffle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

const defaultHeroSlides = [
    {
        url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1600&auto=format&fit=crop&q=80',
        title: 'Bring Nature’s Peace Into Your Living Space',
        subtitle: 'Hand-selected indoor plants, exotic flowering blooms, succulents, and artisan planters nurtured with organic love.',
        tag: '🌿 Green Petals — Botanical Nursery & Plant Boutique'
    },
    {
        url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=1600&auto=format&fit=crop&q=80',
        title: 'Breathe Pure Air with Lush Houseplants',
        subtitle: 'NASA-recommended air purifying plants like Monstera, Snake Plant, and Peace Lily delivered fresh across Bangladesh.',
        tag: '🌱 100% Organic & Healthy Plant Guarantee'
    },
    {
        url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1600&auto=format&fit=crop&q=80',
        title: 'Exotic Blossoms & Fragrant Petals',
        subtitle: 'Sweet Arabian Jasmine (Beli), Royal Desert Roses, and cascading Orchids cultivated by proprietor Munnar Khanam.',
        tag: '🌸 Fragrant & Flowering Specialties'
    },
    {
        url: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=1600&auto=format&fit=crop&q=80',
        title: 'Handcrafted Planters & Organic Plant Care',
        subtitle: 'Artisan terracotta pots, brass mist sprayers, and vermicompost soil formulations for thriving botanical life.',
        tag: '🪴 Ceramic Pots & Premium Botanical Care'
    }
];

const CATEGORIES = [
    'All Plants',
    'Indoor Plants',
    'Flowering Plants',
    'Air Purifying',
    'Succulents & Cacti',
    'Pots & Planters',
    'Organic Plant Care'
];

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading, error } = useSelector((state) => state.product);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [addingId, setAddingId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All Plants');
    const [displayProducts, setDisplayProducts] = useState([]);
    const [isShuffling, setIsShuffling] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // 8 products per page so layout is pristine

    // Load admin customized banners if present, else default
    const [heroSlides] = useState(() => {
        try {
            const saved = localStorage.getItem('greenPetalsHeroBanners');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.error('Failed to parse saved banners:', e);
        }
        return defaultHeroSlides;
    });

    useEffect(() => {
        dispatch(listProducts());
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        setRecentlyViewed(viewed);
    }, [dispatch]);

    useEffect(() => {
        if (products && products.length > 0) {
            setDisplayProducts(products);
        }
    }, [products]);

    // Auto-advance hero background slides every 5 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    // Shuffle products feature
    const handleShuffle = () => {
        setIsShuffling(true);
        setTimeout(() => {
            const array = [...displayProducts];
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            setDisplayProducts(array);
            setIsShuffling(false);
            dispatch(addToast({
                message: '🔀 Shuffled! Discover fresh botanical varieties.',
                type: 'info',
                duration: 2000
            }));
        }, 300);
    };

    const handleQuickView = (product, e) => {
        if (e && e.preventDefault) e.preventDefault();
        setQuickViewProduct(product);
    };

    const handleAddToCart = async (product, e) => {
        if (e && e.preventDefault) e.preventDefault();
        setAddingId(product.id);
        try {
            await dispatch(addToCart({
                productId: product.id,
                name: product.name,
                price: Number(product.price) || 0,
                image: product.images?.[0] || 'https://via.placeholder.com/400',
                stock: product.stock,
                qty: 1
            })).unwrap();

            dispatch(addToast({
                message: `🌿 "${product.name}" added to cart!`,
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
            setTimeout(() => setAddingId(null), 400);
        }
    };

    const isProductSaved = (productId) => {
        return wishlistItems?.some(item => (
            item.productId === productId ||
            item.id === productId ||
            item.product?.id === productId
        ));
    };

    const handleToggleWishlist = async (product, e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        const saved = isProductSaved(product.id);
        if (saved) {
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

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    // Filter by category
    const filteredProducts = displayProducts.filter(p => {
        if (selectedCategory === 'All Plants') return true;
        const catName = p.category?.name || '';
        return catName.toLowerCase().includes(selectedCategory.toLowerCase());
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="min-h-screen">
            {/* Mobile-First Hero Section with Dynamic Background Slider */}
            <section className="relative overflow-hidden bg-emerald-950 text-white min-h-[500px] sm:min-h-[580px] md:min-h-[640px] flex items-center justify-center pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
                
                {/* Background Slides with Smooth Crossfade & Subtle Zoom */}
                {heroSlides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <img
                            src={slide.url}
                            alt="Green Petals Botanical Hero"
                            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-[6000ms] ease-out"
                        />
                    </div>
                ))}

                {/* Dark Botanical Contrast Scrim Overlay (Clean legibility while keeping lush leaves visible) */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/70 to-emerald-950/50 z-[1]"></div>

                {/* Content Container (Spacious, Elegant, Responsive) */}
                <div className="relative max-w-5xl mx-auto text-center z-10 space-y-4 sm:space-y-6">
                    {/* Tagline Pill */}
                    <div className="inline-flex items-center gap-2 bg-emerald-900/70 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-emerald-400/40 text-emerald-200 animate-fade-in shadow-lg">
                        <Sprout className="w-4 h-4 text-emerald-400" />
                        <span>{heroSlides[currentSlide]?.tag || 'Green Petals — Botanical Nursery'}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight animate-slide-up text-white">
                        {heroSlides[currentSlide]?.title || 'Bring Nature’s Peace Into Your Living Space'}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-lg md:text-xl text-emerald-100/90 max-w-2xl mx-auto font-normal leading-relaxed animate-slide-up delay-100 px-2">
                        {heroSlides[currentSlide]?.subtitle || 'Hand-selected indoor plants, exotic flowering blooms, succulents, and artisan planters nurtured with love across Bangladesh.'}
                    </p>

                    {/* Action CTA Buttons (Exquisitely Styled with Botanical Glow) */}
                    <div className="pt-3 sm:pt-5 flex flex-col sm:flex-row gap-3.5 justify-center items-center max-w-md sm:max-w-none mx-auto">
                        <a
                            href="#products"
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold py-4 px-8 rounded-2xl shadow-xl shadow-emerald-600/30 ring-2 ring-emerald-300/40 hover:scale-105 active:scale-95 transition-all duration-300 text-sm sm:text-base gap-2.5"
                        >
                            <Sparkles className="w-5 h-5 text-emerald-200" />
                            <span>Shop Plants Catalog</span>
                        </a>
                        <Link
                            to="/about"
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-white/95 hover:bg-white text-emerald-950 font-bold py-4 px-7 rounded-2xl shadow-lg hover:shadow-xl border-2 border-emerald-300/80 hover:border-emerald-500 hover:scale-105 active:scale-95 transition-all duration-300 text-sm sm:text-base gap-2"
                        >
                            <Sprout className="w-5 h-5 text-emerald-700" />
                            <span>Our Nursery & Story</span>
                        </Link>
                    </div>

                    {/* Carousel Navigation Dots */}
                    <div className="pt-4 sm:pt-6 flex items-center justify-center gap-2.5 z-20">
                        {heroSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`h-2.5 rounded-full transition-all duration-300 ${
                                    idx === currentSlide
                                        ? 'w-8 bg-emerald-400 shadow-md shadow-emerald-400/50'
                                        : 'w-2.5 bg-white/40 hover:bg-white/70'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop Prev/Next Arrow Controls */}
                <button
                    onClick={prevSlide}
                    aria-label="Previous Slide"
                    className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all shadow-lg"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    aria-label="Next Slide"
                    className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all shadow-lg"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </section>

            {/* Features Banner */}
            <section id="features" className="py-8 sm:py-12 bg-white border-b border-emerald-100/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        <div className="card-glass p-5 rounded-2xl border-emerald-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Cushioned Safe Transit</h3>
                                <p className="text-gray-500 text-xs sm:text-sm">Safe delivery across Barishal and all 64 districts.</p>
                            </div>
                        </div>

                        <div className="card-glass p-5 rounded-2xl border-emerald-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Healthy Plant Guarantee</h3>
                                <p className="text-gray-500 text-xs sm:text-sm">Rooted in organic soil with pest-free assurance.</p>
                            </div>
                        </div>

                        <div className="card-glass p-5 rounded-2xl border-emerald-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Personal Nursery Support</h3>
                                <p className="text-gray-500 text-xs sm:text-sm">Care guidance from Munnar Khanam (01768686120).</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section: Broad, Balanced Grid with Category Pills & Real-time Shuffle */}
            <section id="products" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-emerald-100">
                    <div>
                        <span className="text-emerald-700 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                            <Sprout className="w-4 h-4 text-emerald-600" /> Curated Botanical Collection
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mt-1">
                            Featured <span className="text-gradient">Plants & Planters</span>
                        </h2>
                    </div>

                    {/* Shuffle Button */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-xs text-gray-500 font-medium">
                            {filteredProducts.length} varieties ready to ship
                        </span>
                        <button
                            onClick={handleShuffle}
                            disabled={isShuffling}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm border border-emerald-200 transition-all shadow-sm active:scale-95"
                            title="Shuffle and explore random plants"
                        >
                            <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
                            <span>Shuffle Plants</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Scrollable Category Tabs */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-4 mb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setSelectedCategory(cat);
                                setCurrentPage(1);
                            }}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex-shrink-0 ${
                                selectedCategory === cat
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                                    : 'bg-white text-gray-700 border border-emerald-100 hover:bg-emerald-50 hover:text-emerald-800'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products Grid: 2-Cols on Mobile, 3 on Tablet, 4 on Desktop */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="card-glass h-72 sm:h-80 animate-pulse rounded-2xl">
                                <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <div className="glass border border-red-200 text-red-600 px-6 py-4 rounded-2xl inline-block">
                            <p className="font-semibold">{error}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                            {paginatedProducts.map((product) => {
                                const saved = isProductSaved(product.id);
                                return (
                                    <div
                                        key={product.id}
                                        className="card-glass group hover:border-emerald-300 transition-all duration-300 relative flex flex-col justify-between p-3 sm:p-4 rounded-2xl"
                                    >
                                        <Link to={`/product/${product.id}`} className="block">
                                            {/* Image with Discount Badge & Quick Actions */}
                                            <div className="aspect-square bg-gradient-to-br from-emerald-50 to-gray-50 rounded-xl mb-3 overflow-hidden relative">
                                                <img
                                                    src={product.images?.[0] || 'https://via.placeholder.com/400'}
                                                    alt={product.name}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {product.discount > 0 && (
                                                    <div className="absolute top-2 left-2 bg-rose-500 text-white px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold shadow-md">
                                                        -{product.discount}%
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                                                    {/* Saved Heart: RED if saved, WHITE if not */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleToggleWishlist(product, e)}
                                                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 ${
                                                            saved
                                                                ? 'bg-white text-red-500 ring-2 ring-red-400 shadow-red-500/20'
                                                                : 'bg-black/35 backdrop-blur-md text-white hover:bg-black/50'
                                                        }`}
                                                        title={saved ? "Saved (Click to remove)" : "Save to Wishlist"}
                                                    >
                                                        <Heart className={`w-4 h-4 transition-transform ${saved ? 'fill-red-500 text-red-500 scale-110' : 'text-white fill-white/10'}`} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleQuickView(product, e)}
                                                        className="w-8 h-8 sm:w-9 sm:h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 transition-colors hidden sm:flex"
                                                        title="Quick View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Product Meta */}
                                            <div className="space-y-1 mb-2">
                                                <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wide block truncate">
                                                    {product.category?.name || 'Botanical'}
                                                </span>
                                                <h3 className="font-semibold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-baseline gap-1.5 pt-1">
                                                    <span className="text-sm sm:text-lg font-bold text-emerald-800">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    {product.originalPrice && product.originalPrice > product.price && (
                                                        <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                                                            {formatCurrency(product.originalPrice)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Add to Cart Button (Mobile Optimized Touch Target) */}
                                        <button
                                            onClick={(e) => handleAddToCart(product, e)}
                                            disabled={addingId === product.id || product.stock <= 0}
                                            className="w-full mt-2 py-2 sm:py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                                        >
                                            {addingId === product.id ? (
                                                <>
                                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Adding...</span>
                                                </>
                                            ) : product.stock <= 0 ? (
                                                <span>Out of Stock</span>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-3.5 h-3.5" />
                                                    <span>Add to Cart</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Luxury Botanical Pagination for Home */}
                        {totalPages > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-10 pt-6 border-t border-emerald-100">
                                <button
                                    disabled={currentPage <= 1}
                                    onClick={() => {
                                        setCurrentPage(prev => Math.max(1, prev - 1));
                                        const el = document.getElementById('products');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-4 py-2 rounded-xl border border-emerald-200 bg-white text-xs sm:text-sm font-bold text-gray-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    ‹ Previous
                                </button>

                                {[...Array(totalPages).keys()].map((x) => (
                                    <button
                                        key={x + 1}
                                        onClick={() => {
                                            setCurrentPage(x + 1);
                                            const el = document.getElementById('products');
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all ${
                                            currentPage === x + 1
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300'
                                                : 'border border-emerald-100 bg-white hover:bg-emerald-50 text-gray-700'
                                        }`}
                                    >
                                        {x + 1}
                                    </button>
                                ))}

                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => {
                                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                        const el = document.getElementById('products');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-4 py-2 rounded-xl border border-emerald-200 bg-white text-xs sm:text-sm font-bold text-gray-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    Next ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Quick View Modal */}
            {quickViewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass rounded-3xl max-w-2xl w-full p-6 relative bg-white shadow-2xl border border-emerald-100 animate-scale-in">
                        <button
                            onClick={() => setQuickViewProduct(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-emerald-50">
                                <img
                                    src={quickViewProduct.images?.[0] || 'https://via.placeholder.com/400'}
                                    alt={quickViewProduct.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="space-y-4">
                                <span className="text-xs font-bold text-emerald-700 uppercase">
                                    {quickViewProduct.category?.name || 'Plant'}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900">{quickViewProduct.name}</h3>
                                <p className="text-2xl font-black text-emerald-800">
                                    {formatCurrency(quickViewProduct.price)}
                                </p>
                                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                    {quickViewProduct.description}
                                </p>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={(e) => {
                                            handleAddToCart(quickViewProduct, e);
                                            setQuickViewProduct(null);
                                        }}
                                        className="btn-primary flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            handleToggleWishlist(quickViewProduct, e);
                                        }}
                                        className={`p-3 rounded-xl border transition-all ${
                                            isProductSaved(quickViewProduct.id)
                                                ? 'border-red-300 bg-red-50 text-red-500 ring-1 ring-red-200'
                                                : 'border-emerald-200 hover:bg-rose-50 hover:text-rose-600 text-gray-700'
                                        }`}
                                        title={isProductSaved(quickViewProduct.id) ? "Saved" : "Save to Wishlist"}
                                    >
                                        <Heart className={`w-5 h-5 ${isProductSaved(quickViewProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Green Petals Guarantee & Policy Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 sm:my-14">
                <PlantGuaranteeCard />
            </div>

            <Newsletter />
        </div>
    );
};

export default Home;
