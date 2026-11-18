import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

const Wishlist = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: wishlistItems, loading } = useSelector((state) => state.wishlist);

    useEffect(() => {
        dispatch(getWishlist());
    }, [dispatch]);

    const removeHandler = (productId) => {
        dispatch(removeFromWishlist(productId));
    };

    const moveToCartHandler = (item) => {
        const prod = item.product || item;
        const pid = prod.id || item.productId;
        dispatch(addToCart({
            productId: pid,
            qty: 1,
            name: prod.name || 'Plant',
            price: Number(prod.price) || 0,
            image: prod.images?.[0] || prod.image || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400'
        }));
        dispatch(removeFromWishlist(item.productId || item.id));
        navigate('/cart');
    };

    if (loading && (!wishlistItems || wishlistItems.length === 0)) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="glass p-8 rounded-3xl">
                    <div className="animate-pulse text-emerald-800 font-semibold">Loading your saved plants...</div>
                </div>
            </div>
        );
    }

    if (!wishlistItems || wishlistItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 px-6">
                <div className="text-center space-y-6 fade-in-up">
                    <div className="glass rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/10 border border-rose-100">
                        <Heart className="w-16 h-16 text-rose-500 fill-rose-100" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Your Wishlist is Empty</h2>
                    <p className="text-gray-600 max-w-md mx-auto text-sm">
                        Save your favorite botanical plants by clicking the heart button on any plant card!
                    </p>
                    <Link to="/products">
                        <button className="btn-primary px-8 py-3.5 rounded-xl flex items-center gap-2 mx-auto shadow-lg shadow-emerald-600/30 font-bold">
                            Explore All Plants
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Navigation */}
                <div className="mb-4">
                    <button
                        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/products')}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl glass border border-emerald-100/90 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/80 font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95 group"
                    >
                        <ArrowRight className="w-4 h-4 text-emerald-600 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        <span>Continue Shopping (আরও গাছ দেখুন)</span>
                    </button>
                </div>

                <div className="flex items-center justify-between mb-8 sm:mb-12">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                            Saved <span className="text-gradient">Plants</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {wishlistItems.length} plants saved in your botanical wishlist
                        </p>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm border border-emerald-200">
                        ❤️ {wishlistItems.length} Saved
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {wishlistItems.map((item, index) => {
                        const prod = item.product || item;
                        const pid = prod.id || item.productId || item.id;
                        const imgSrc = prod.images?.[0] || prod.image || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400';
                        return (
                            <div
                                key={pid || index}
                                className="glass rounded-2xl overflow-hidden group hover:shadow-xl transition-all border border-emerald-50 flex flex-col justify-between"
                            >
                                <div className="relative aspect-square overflow-hidden bg-emerald-50">
                                    <img
                                        src={imgSrc}
                                        alt={prod.name || 'Plant'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <button
                                        onClick={() => removeHandler(pid)}
                                        className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md text-red-500 hover:bg-red-50 transition-all flex items-center justify-center active:scale-90"
                                        title="Remove from saved"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                                    <div>
                                        <Link to={`/product/${pid}`}>
                                            <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-1 hover:text-emerald-700 transition-colors">
                                                {prod.name}
                                            </h3>
                                        </Link>
                                        <p className="text-base sm:text-lg font-extrabold text-emerald-800 mt-1">
                                            {formatCurrency(prod.price || 0)}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => moveToCartHandler(item)}
                                            className="flex-1 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                                        >
                                            <ShoppingCart className="w-3.5 h-3.5" />
                                            <span>Add to Cart</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
