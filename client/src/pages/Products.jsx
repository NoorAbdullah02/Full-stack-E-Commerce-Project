import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { listProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToast } from '../redux/slices/toastSlice';
import { formatCurrency } from '../utils/currency';
import StarRating from '../components/StarRating';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';
import { Heart, ShoppingCart, SlidersHorizontal, Star, X } from 'lucide-react';

const Products = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const { products, loading, error, page, pages, total } = useSelector((state) => state.product);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);

    // Local state for filters to handle updates
    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || '',
        pageNumber: Number(searchParams.get('pageNumber')) || 1
    });

    useEffect(() => {
        // Fetch products when filters/URL params change
        dispatch(listProducts(filters));
    }, [dispatch, filters]);

    // Update URL when filters change state
    useEffect(() => {
        const params = {};
        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.category) params.category = filters.category;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.sort) params.sort = filters.sort;
        if (filters.pageNumber > 1) params.pageNumber = filters.pageNumber;
        setSearchParams(params);
    }, [filters, setSearchParams]);

    const isProductSaved = (productId) => {
        return wishlistItems?.some(item => (
            item.productId === productId ||
            item.id === productId ||
            item.product?.id === productId
        ));
    };

    const toggleWishlistHandler = async (product, e) => {
        if (e) {
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

    const addToCartHandler = async (product) => {
        try {
            await dispatch(addToCart({
                productId: product.id,
                qty: 1,
                name: product.name,
                price: Number(product.price) || 0,
                image: product.images?.[0] || 'https://via.placeholder.com/400'
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
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-gradient">
                            Botanical Plant Catalog
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Showing {total || products.length} fresh live plants & botanical accessories
                        </p>
                    </div>

                    <div className="w-full sm:w-auto flex items-center gap-3">
                        <div className="hidden md:block w-72">
                            <SearchBar />
                        </div>
                        <button
                            className="md:hidden w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
                            onClick={() => setShowFilters(true)}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Filters & Sort Options</span>
                        </button>
                    </div>
                </div>

                <div className="md:hidden mb-5">
                    <SearchBar />
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Mobile Filter Overlay */}
                    <div className={`fixed inset-0 z-[150] lg:hidden transition-opacity duration-300 ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
                        <div className={`absolute right-0 top-0 bottom-0 w-[85vw] max-w-xs bg-white p-6 shadow-2xl transition-transform duration-300 transform ${showFilters ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-emerald-100">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                                    Filter Plants
                                </h3>
                                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-emerald-50 text-gray-700 rounded-xl">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <FilterSidebar
                                filters={filters}
                                setFilters={setFilters}
                                className="border-0 shadow-none p-0"
                            />
                        </div>
                    </div>

                    {/* Desktop Filter Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <FilterSidebar filters={filters} setFilters={setFilters} />
                    </div>

                    {/* Product List */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="card-glass animate-pulse">
                                        <div className="bg-gray-200 h-48 rounded-2xl mb-4"></div>
                                        <div className="bg-gray-200 h-6 w-3/4 rounded mb-2"></div>
                                        <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 glass rounded-3xl">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                    {products.map((product) => {
                                        const saved = isProductSaved(product.id);
                                        return (
                                            <div key={product.id} className="card-glass group flex flex-col justify-between">
                                                <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-xl">
                                                    <img
                                                        src={product.images?.[0] || product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />

                                                    {/* Saved (Love) Button - Top Right of Image: RED when saved, WHITE when not */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleWishlistHandler(product, e)}
                                                        aria-label={saved ? "Remove from saved" : "Save plant"}
                                                        className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md active:scale-90 ${
                                                            saved
                                                                ? 'bg-white text-red-500 ring-2 ring-red-400 shadow-red-500/20'
                                                                : 'bg-black/35 backdrop-blur-md text-white hover:bg-black/50 hover:scale-105'
                                                        }`}
                                                        title={saved ? "Saved (Click to remove)" : "Save plant"}
                                                    >
                                                        <Heart
                                                            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                                                                saved
                                                                    ? 'fill-red-500 text-red-500 scale-110'
                                                                    : 'text-white fill-white/10'
                                                            }`}
                                                        />
                                                    </button>

                                                    {/* Out of stock or discount badges */}
                                                    {product.stock === 0 ? (
                                                        <div className="absolute top-2 left-2 bg-red-500/95 backdrop-blur text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg shadow-sm">
                                                            Out of Stock
                                                        </div>
                                                    ) : product.discount > 0 ? (
                                                        <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg shadow-sm">
                                                            -{product.discount}%
                                                        </div>
                                                    ) : null}
                                                </div>

                                                <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wide font-medium truncate">
                                                                {product.category?.name || 'Plant'}
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                <StarRating rating={4.5} size={12} />
                                                                <span className="text-[10px] sm:text-xs text-gray-400">({product.reviews?.length || 0})</span>
                                                            </div>
                                                        </div>
                                                        <Link to={`/product/${product.id}`}>
                                                            <h3 className="font-bold text-xs sm:text-base text-gray-900 mb-2 line-clamp-2 hover:text-emerald-700 transition-colors">
                                                                {product.name}
                                                            </h3>
                                                        </Link>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                        <div>
                                                            <span className="text-sm sm:text-xl font-extrabold text-emerald-800">
                                                                {formatCurrency(product.price)}
                                                            </span>
                                                            {product.originalPrice && product.originalPrice > product.price && (
                                                                <span className="text-[10px] sm:text-xs text-gray-400 line-through block">
                                                                    {formatCurrency(product.originalPrice)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => toggleWishlistHandler(product, e)}
                                                                className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 active:scale-95 ${
                                                                    saved
                                                                        ? 'bg-rose-50 text-red-500 ring-1 ring-red-200'
                                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-red-500'
                                                                }`}
                                                                title={saved ? "Saved" : "Save"}
                                                            >
                                                                <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${saved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => addToCartHandler(product)}
                                                                disabled={product.stock === 0}
                                                                className="p-1.5 sm:p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                                                                title="Add to Cart"
                                                            >
                                                                <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Luxury Botanical Pagination */}
                                {pages > 1 && (
                                    <div className="flex flex-wrap items-center justify-center gap-2 mt-12 pt-6 border-t border-emerald-100">
                                        <button
                                            disabled={page <= 1}
                                            onClick={() => {
                                                setFilters(prev => ({ ...prev, pageNumber: page - 1 }));
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-xs sm:text-sm font-bold text-gray-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                        >
                                            ‹ Previous
                                        </button>

                                        {[...Array(pages).keys()].map((x) => (
                                            <button
                                                key={x + 1}
                                                onClick={() => {
                                                    setFilters(prev => ({ ...prev, pageNumber: x + 1 }));
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className={`w-10 h-10 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all ${page === x + 1
                                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-300'
                                                    : 'border border-emerald-100 bg-white hover:bg-emerald-50 text-gray-700'
                                                    }`}
                                            >
                                                {x + 1}
                                            </button>
                                        ))}

                                        <button
                                            disabled={page >= pages}
                                            onClick={() => {
                                                setFilters(prev => ({ ...prev, pageNumber: page + 1 }));
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-xs sm:text-sm font-bold text-gray-700 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                        >
                                            Next ›
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
