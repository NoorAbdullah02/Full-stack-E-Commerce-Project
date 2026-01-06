import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { addToCart, removeFromCart, updateCartItem } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils/currency';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

// Simple debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// CartItem Component to handle local state and debouncing
const CartItem = ({ item, navigate }) => {
    const dispatch = useDispatch();
    const [localQty, setLocalQty] = useState(item.qty);
    const [isUpdating, setIsUpdating] = useState(false);

    // Sync local state with Redux state when it changes externally
    useEffect(() => {
        if (!isUpdating) {
            setLocalQty(item.qty);
        }
    }, [item.qty, isUpdating]);

    // Create debounced function once per item
    const debouncedDispatch = useCallback(
        debounce((itemId, newQty) => {
            // Use updateCartItem for setting explicit quantity
            dispatch(updateCartItem({ productId: item.productId, quantity: newQty }))
                .finally(() => setIsUpdating(false));
        }, 500),
        [dispatch, item]
    );

    const updateQuantity = (newQty) => {
        const clampedQty = Math.max(1, Math.min(10, newQty));
        setLocalQty(clampedQty);
        setIsUpdating(true);
        debouncedDispatch(item.productId, clampedQty);
    };

    const handleIncrement = () => {
        if (localQty < 10) {
            updateQuantity(Number(localQty) + 1);
        }
    };

    const handleDecrement = () => {
        if (localQty > 1) {
            updateQuantity(Number(localQty) - 1);
        }
    };

    const handleInput = (e) => {
        const val = e.target.value;
        if (val === '') {
            setLocalQty('');
            return;
        }

        const parsed = parseInt(val);
        if (!isNaN(parsed)) {
            setLocalQty(parsed);
            setIsUpdating(true);
            const validQty = Math.max(1, Math.min(10, parsed));
            debouncedDispatch(item.productId, validQty);
        }
    };

    const handleBlur = () => {
        if (localQty === '' || localQty < 1 || localQty > 10) {
            const valid = Math.max(1, Math.min(10, parseInt(localQty) || 1));
            setLocalQty(valid);
            if (valid !== item.qty) {
                setIsUpdating(true);
                debouncedDispatch(item.productId, valid);
            }
        }
    };

    return (
        <div className="glass rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center hover:shadow-lg transition-all duration-300">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0 cursor-pointer" onClick={() => navigate(`/product/${item.productId}`)}>
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate cursor-pointer hover:text-indigo-600" onClick={() => navigate(`/product/${item.productId}`)}>{item.name}</h3>
                <p className="text-2xl sm:text-2xl font-bold text-gradient">{formatCurrency(item.price)}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2 glass rounded-xl p-1">
                    <button
                        onClick={handleDecrement}
                        className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={localQty <= 1}
                        title="Decrease quantity"
                    >
                        <Minus className="w-4 h-4" />
                    </button>

                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={localQty}
                        onChange={handleInput}
                        onBlur={handleBlur}
                        className={`w-10 sm:w-12 text-center font-semibold bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg ${isUpdating ? 'text-gray-400' : ''}`}
                    />

                    <button
                        onClick={handleIncrement}
                        className="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={localQty >= 10}
                        title="Increase quantity"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 sm:flex-none flex justify-between items-center">
                    <div className="flex flex-col items-end gap-1 mr-2">
                        {item.stock && localQty >= item.stock && (
                            <span className="text-[10px] text-amber-600 font-medium">Max stock</span>
                        )}
                        {localQty >= 10 && (
                            <span className="text-[10px] text-indigo-600 font-medium">Max limit</span>
                        )}
                    </div>

                    <button
                        onClick={() => dispatch(removeFromCart(item.productId))}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Remove from cart"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.cart);

    const checkoutHandler = () => {
        navigate('/checkout');
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 5000 ? 0 : 100;
    const total = subtotal + tax + shipping;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 px-6">
                <div className="text-center space-y-6 fade-in-up">
                    <div className="glass rounded-full w-32 h-32 mx-auto flex items-center justify-center">
                        <ShoppingBag className="w-16 h-16 text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Your cart is empty</h2>
                    <p className="text-gray-600 max-w-md">Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
                    <Link to="/">
                        <button className="btn-primary px-6 sm:px-8 flex items-center gap-2 mx-auto">
                            Continue Shopping
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
                <h1 className="text-4xl font-bold mb-12 fade-in-up">
                    Shopping <span className="text-gradient">Cart</span>
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4 fade-in-up delay-100">
                        {cartItems.map((item) => (
                            <CartItem key={item.productId} item={item} navigate={navigate} />
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="fade-in-up delay-200">
                        <div className="glass rounded-2xl p-6 sm:p-8 sm:sticky sm:top-24 space-y-6">
                            <h2 className="text-2xl font-bold">Order Summary</h2>

                            <div className="space-y-4 py-6 border-y border-gray-200">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Tax (10%)</span>
                                    <span className="font-semibold">{formatCurrency(tax)}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping</span>
                                    <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                                        {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                                    </span>
                                </div>
                                {subtotal < 5000 && (
                                    <p className="text-sm text-gray-600 bg-indigo-50 p-3 rounded-lg">
                                        Add {formatCurrency(5000 - subtotal)} more for free shipping!
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between items-baseline">
                                <span className="text-lg font-semibold">Total</span>
                                <span className="text-3xl font-bold text-gradient">{formatCurrency(total)}</span>
                            </div>

                            <button
                                onClick={checkoutHandler}
                                className="btn-primary w-full h-14 text-lg rounded-xl flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <Link to="/">
                                <button className="btn-glass w-full rounded-xl">
                                    Continue Shopping
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
