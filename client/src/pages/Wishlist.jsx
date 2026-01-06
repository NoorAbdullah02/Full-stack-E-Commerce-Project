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
        dispatch(addToCart({ productId: item.product.id, qty: 1, name: item.product.name, price: item.product.price, image: item.product.image }));
        dispatch(removeFromWishlist(item.productId));
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="glass p-8 rounded-3xl">
                    <div className="animate-pulse text-gray-600">Loading wishlist...</div>
                </div>
            </div>
        );
    }

    if (!wishlistItems || wishlistItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 px-6">
                <div className="text-center space-y-6 fade-in-up">
                    <div className="glass rounded-full w-32 h-32 mx-auto flex items-center justify-center">
                        <Heart className="w-16 h-16 text-pink-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Your wishlist is empty</h2>
                    <p className="text-gray-600 max-w-md">Save items you love for later. Start adding products to your wishlist!</p>
                    <Link to="/">
                        <button className="btn-primary px-8 flex items-center gap-2 mx-auto">
                            Start Shopping
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
                <div className="flex items-center justify-between mb-12 fade-in-up">
                    <h1 className="text-4xl font-bold">
                        My <span className="text-gradient">Wishlist</span>
                    </h1>
                    <span className="text-gray-600">{wishlistItems.length} items</span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item, index) => (
                        <div
                            key={item.id}
                            className={`glass rounded-2xl overflow-hidden group hover:shadow-xl transition-all fade-in-up delay-${Math.min(index * 100, 300)}`}
                        >
                            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                                <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <button
                                    onClick={() => removeHandler(item.productId)}
                                    className="absolute top-4 right-4 w-10 h-10 rounded-full glass border border-white/20 text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="font-bold text-xl mb-2">{item.product.name}</h3>
                                    <p className="text-2xl font-bold text-gradient">{formatCurrency(item.product.price)}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => moveToCartHandler(item)}
                                        className="flex-1 btn-primary rounded-xl flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </button>
                                    <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                                        <button className="btn-glass px-6 rounded-xl">
                                            View
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
