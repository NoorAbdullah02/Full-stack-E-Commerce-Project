import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { listProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist } from '../redux/slices/wishlistSlice';
import { formatCurrency } from '../utils/currency';
import StarRating from '../components/StarRating';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';
import { Heart, ShoppingCart, SlidersHorizontal, Star } from 'lucide-react';

const Products = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const { products, loading, error, page, pages, total } = useSelector((state) => state.product);

    // Local state for filters to handle updates
    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || '',
        pageNumber: Number(searchParams.get('pageNumber')) || 1
    });

    // Initial sync with URL only on mount
    useEffect(() => {
        // Only set if params exist, to avoid overwriting initial state unnecessarily
        // This is simplified to just rely on initial state setting or manual filter changes
    }, []);

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

    const addToCartHandler = (product) => {
        dispatch(addToCart({
            productId: product.id,
            qty: 1,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || product.image
        }));
        navigate('/cart');
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Explore Collections
                    </h1>
                    <div className="w-full md:w-auto flex items-center gap-4">
                        <div className="hidden md:block">
                            <SearchBar />
                        </div>
                        <button
                            className="md:hidden p-3 glass rounded-xl border border-white/20"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="md:hidden mb-6">
                    <SearchBar />
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
                        <FilterSidebar
                            filters={filters}
                            setFilters={setFilters}
                            className="sticky top-24"
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3 space-y-8">
                        {error ? (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-12 rounded-3xl text-center">
                                <h3 className="text-xl font-bold mb-2">Oops! Something went wrong</h3>
                                <p>{error}</p>
                                <button
                                    onClick={() => dispatch(listProducts(filters))}
                                    className="mt-4 btn-primary px-6 py-2 rounded-xl"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="glass rounded-3xl p-4 h-[400px] animate-pulse">
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
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <div key={product.id} className="card-glass group">
                                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                                <img
                                                    src={product.images?.[0] || product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                                    <button
                                                        onClick={() => addToCartHandler(product)}
                                                        className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center hover:scale-110 transition-transform btn-primary"
                                                        disabled={product.stock === 0}
                                                    >
                                                        <ShoppingCart className="w-5 h-5" />
                                                    </button>
                                                    <Link
                                                        to={`/product/${product.id}`}
                                                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                                                    >
                                                        <Star className="w-5 h-5" />
                                                    </Link>
                                                </div>
                                                {product.stock === 0 && (
                                                    <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                                                        Out of Stock
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5">
                                                <Link to={`/product/${product.id}`}>
                                                    <h3 className="font-bold text-lg mb-1 truncate hover:text-indigo-600 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-gray-500 text-sm">{product.category?.name}</span>
                                                    <div className="flex items-center gap-1">
                                                        <StarRating rating={4.5} size={14} /> {/* Placeholder average, real requires relation */}
                                                        <span className="text-xs text-gray-400">({product.reviews?.length || 0})</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xl font-bold text-gradient">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    <button
                                                        onClick={() => dispatch(addToWishlist(product.id))}
                                                        className="p-2 hover:bg-pink-50 rounded-full transition-colors group/heart"
                                                    >
                                                        <Heart className="w-5 h-5 text-gray-400 group-hover/heart:text-pink-500 transition-colors" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pages > 1 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        {[...Array(pages).keys()].map((x) => (
                                            <button
                                                key={x + 1}
                                                onClick={() => setFilters(prev => ({ ...prev, pageNumber: x + 1 }))}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${page === x + 1
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'glass hover:bg-white/80'
                                                    }`}
                                            >
                                                {x + 1}
                                            </button>
                                        ))}
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
