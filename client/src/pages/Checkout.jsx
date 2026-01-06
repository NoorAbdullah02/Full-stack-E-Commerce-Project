import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../redux/slices/orderSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { addToast } from '../redux/slices/toastSlice';
import { formatCurrency } from '../utils/currency';
import { CreditCard, MapPin, ArrowRight, X } from 'lucide-react';

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const { loading } = useSelector((state) => state.order);

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [isInsideDhaka, setIsInsideDhaka] = useState(true);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const tax = subtotal * 0.1;

    // Shipping Logic: 100 Inside Dhaka, 150 Outside
    const shipping = isInsideDhaka ? 100 : 150;

    const total = subtotal + tax + shipping;

    const placeOrderHandler = async (e) => {
        if (e) e.preventDefault();

        // If manual payment selected and no transaction ID, show modal
        if (paymentMethod === 'Online Payment' && !transactionId) {
            setShowPaymentModal(true);
            return;
        }

        if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            dispatch(addToast({ message: 'Please fill in all address fields', type: 'error' }));
            return;
        }

        const res = await dispatch(createOrder({
            orderItems: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.qty,
                price: item.price
            })),
            shippingAddress,
            paymentMethod,
            totalPrice: total,
            transactionId: transactionId || null
        }));

        if (!res.error) {
            dispatch(clearCart());
            dispatch(addToast({ message: 'Order placed successfully! 🎉', type: 'success' }));
            navigate('/profile'); // To orders/profile page to see status
        } else {
            dispatch(addToast({ message: 'Order Failed: ' + (res.payload || 'Unknown Error'), type: 'error' }));
        }
    };

    const handleTransactionSubmit = (e) => {
        e.preventDefault();
        if (transactionId.trim()) {
            setShowPaymentModal(false);
            placeOrderHandler();
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-12 fade-in-up">
                    <span className="text-gradient">Checkout</span>
                </h1>

                <form onSubmit={placeOrderHandler}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6 fade-in-up delay-100">
                            {/* Shipping Address */}
                            <div className="glass rounded-2xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold">Shipping Address</h2>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        placeholder="Street Address"
                                        value={shippingAddress.address}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                                        className="input-glass"
                                        required
                                    />
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input
                                            placeholder="City"
                                            value={shippingAddress.city}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                            className="input-glass"
                                            required
                                        />
                                        <input
                                            placeholder="Postal Code"
                                            value={shippingAddress.postalCode}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                            className="input-glass"
                                            required
                                        />
                                    </div>
                                    <input
                                        placeholder="Country"
                                        value={shippingAddress.country}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                        className="input-glass"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Shipping Zone */}
                            <div className="glass rounded-2xl p-8">
                                <h2 className="text-2xl font-display font-bold mb-6">Shipping Zone</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <label className={`cursor-pointer border-2 p-4 rounded-xl transition-all ${isInsideDhaka ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-white/5 hover:bg-white/10'}`}>
                                        <input
                                            type="radio"
                                            name="shippingZone"
                                            checked={isInsideDhaka}
                                            onChange={() => setIsInsideDhaka(true)}
                                            className="hidden"
                                        />
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">Inside Dhaka</span>
                                            <span className="text-indigo-600 font-semibold">{formatCurrency(100)}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">2-3 Days Delivery</p>
                                    </label>
                                    <label className={`cursor-pointer border-2 p-4 rounded-xl transition-all ${!isInsideDhaka ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-white/5 hover:bg-white/10'}`}>
                                        <input
                                            type="radio"
                                            name="shippingZone"
                                            checked={!isInsideDhaka}
                                            onChange={() => setIsInsideDhaka(false)}
                                            className="hidden"
                                        />
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">Outside Dhaka</span>
                                            <span className="text-indigo-600 font-semibold">{formatCurrency(150)}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">3-5 Days Delivery</p>
                                    </label>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="glass rounded-2xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold">Payment Method</h2>
                                </div>
                                <div className="space-y-3">
                                    {['Cash on Delivery', 'Online Payment'].map((method) => (
                                        <label key={method} className="flex items-center gap-3 p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method}
                                                checked={paymentMethod === method}
                                                onChange={(e) => {
                                                    setPaymentMethod(e.target.value);
                                                    if (e.target.value === 'Online Payment') {
                                                        setShowPaymentModal(true);
                                                    } else {
                                                        setTransactionId('');
                                                    }
                                                }}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <span className="font-medium">{method}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="fade-in-up delay-200">
                            <div className="glass rounded-2xl p-8 sticky top-24 space-y-6">
                                <h2 className="text-2xl font-display font-bold">Order Summary</h2>

                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.productId} className="flex gap-3 items-center p-3 rounded-xl bg-white/5">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                                            </div>
                                            <span className="text-sm font-semibold">{formatCurrency(item.price * item.qty)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 py-6 border-y border-white/10">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Tax (10%)</span>
                                        <span className="font-semibold">{formatCurrency(tax)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span>Shipping</span>
                                        <div className="text-right">
                                            <span className="font-semibold block">{formatCurrency(shipping)}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {isInsideDhaka ? '(Inside Dhaka)' : '(Outside Dhaka)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-3xl font-bold text-gradient">{formatCurrency(total)}</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full h-14 text-lg rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? 'Processing...' : (
                                        <>
                                            Place Order
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Payment Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
                        <div className="glass p-8 rounded-3xl w-full max-w-md relative animate-scale-in">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <h3 className="text-2xl font-bold mb-6">Complete Payment</h3>

                            <div className="space-y-4 mb-6 text-gray-700">
                                <p>Please send <strong>{formatCurrency(total)}</strong> to one of the following.</p>
                                <p className="text-sm text-gray-500 mb-4">Click to copy the number.</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText('01700000000');
                                            alert('Bkash number copied!');
                                        }}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent bg-pink-50 hover:border-pink-500 hover:bg-pink-100 transition-all group"
                                    >
                                        <span className="font-bold text-pink-600">Bkash</span>
                                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border group-hover:border-pink-200">01700000000</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText('01800000000');
                                            alert('Nagad number copied!');
                                        }}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent bg-orange-50 hover:border-orange-500 hover:bg-orange-100 transition-all group"
                                    >
                                        <span className="font-bold text-orange-600">Nagad</span>
                                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border group-hover:border-orange-200">01800000000</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleTransactionSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 8N7A6D..."
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="input-glass w-full"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn-primary w-full py-3 rounded-xl font-bold"
                                >
                                    Confirm Payment
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
