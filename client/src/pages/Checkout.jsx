import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../redux/slices/orderSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { addToast } from '../redux/slices/toastSlice';
import { formatCurrency } from '../utils/currency';
import { showOrderSuccess, showToast, showError } from '../utils/alerts';
import PlantGuaranteeCard from '../components/PlantGuaranteeCard';
import { CreditCard, MapPin, ArrowRight, X, Copy, Check, ShieldCheck, Smartphone, Sparkles, Sprout, AlertCircle, Phone, Scale } from 'lucide-react';

const BKASH_NUMBER = '01715020391';

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const addressSectionRef = useRef(null);

    const { cartItems } = useSelector((state) => state.cart);
    const { userInfo } = useSelector((state) => state.auth);
    const { loading } = useSelector((state) => state.order);

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: 'Bangladesh',
        phone: userInfo?.phone || '',
    });

    const [addressError, setAddressError] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [isInsideBarishal, setIsInsideBarishal] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.qty || 1), 0);
    const tax = subtotal * 0.1;

    // Weight-tiered courier calculation:
    // Base covers up to 1kg (Barishal: ৳100, All other districts: ৳150)
    // Live plant with grower pot/packaging estimated at ~0.7kg
    // Extra weight charge: ৳20 per extra kg
    const totalItemsCount = cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);
    const totalWeightKg = Number((totalItemsCount * 0.7).toFixed(1));
    const extraKg = Math.max(0, Math.ceil(totalWeightKg - 1));
    const extraWeightCharge = extraKg * 20;

    const baseShipping = isInsideBarishal ? 100 : 150;
    const shipping = baseShipping + extraWeightCharge;
    const total = subtotal + tax + shipping;

    const copyBkashNumber = () => {
        try {
            navigator.clipboard.writeText(BKASH_NUMBER);
            setCopied(true);
            showToast({
                icon: 'success',
                title: `bKash Number Copied: ${BKASH_NUMBER}`,
                timer: 2500,
            });
            setTimeout(() => setCopied(false), 2500);
        } catch {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const validateAddress = () => {
        if (!shippingAddress.address.trim() || !shippingAddress.city.trim() || !shippingAddress.phone.trim()) {
            setAddressError(true);
            if (addressSectionRef.current) {
                addressSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            showToast({
                icon: 'warning',
                title: 'Please enter your delivery address & contact phone first!',
                timer: 3500,
            });
            dispatch(addToast({
                message: 'Please complete your delivery address before placing order.',
                type: 'error'
            }));
            return false;
        }
        setAddressError(false);
        return true;
    };

    const handleSelectPaymentMethod = (method) => {
        setPaymentMethod(method);
        if (method === 'bKash Payment') {
            // First check if address is filled
            if (!validateAddress()) {
                return;
            }
            setShowPaymentModal(true);
        } else {
            setTransactionId('');
        }
    };

    const placeOrderHandler = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        // 1. First validate address details
        if (!validateAddress()) {
            return;
        }

        // 2. If bKash selected and no transaction ID entered yet, prompt modal
        if (paymentMethod === 'bKash Payment' && !transactionId.trim()) {
            setShowPaymentModal(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await dispatch(createOrder({
                orderItems: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.qty,
                    price: item.price
                })),
                shippingAddress,
                paymentMethod,
                totalPrice: total,
                transactionId: transactionId.trim() || null
            })).unwrap();

            dispatch(clearCart());

            // Show celebration modal
            await showOrderSuccess({
                orderId: res.id || res._id,
                total: total,
                isBkash: paymentMethod === 'bKash Payment',
                transactionId: transactionId.trim()
            });

            // Navigate directly to their order invoice page
            const targetId = res.id || res._id;
            if (targetId) {
                navigate(`/order/${targetId}`);
            } else {
                navigate('/profile');
            }
        } catch (err) {
            console.error('Order placement error:', err);
            showError('Order Failed', err?.message || err || 'Could not place order. Please try again.');
            dispatch(addToast({ message: 'Order Failed: ' + (err?.message || err), type: 'error' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTransactionSubmit = (e) => {
        e.preventDefault();
        if (!transactionId.trim()) {
            showToast({ icon: 'warning', title: 'Please enter your bKash Transaction ID (TrxID)' });
            return;
        }
        setShowPaymentModal(false);
        placeOrderHandler();
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 relative">
            <div className="max-w-7xl mx-auto">
                {/* Back to Cart Navigation */}
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => navigate('/cart')}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl glass border border-emerald-100/90 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/80 font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95 group"
                    >
                        <ArrowRight className="w-4 h-4 text-emerald-600 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Cart (কার্টে ফিরে যান)</span>
                    </button>
                </div>

                <div className="mb-8 fade-in-up">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-3">
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        Green Petals Nursery — Safe Plant Delivery
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Finalize Your <span className="text-gradient">Plant Order</span>
                    </h1>
                </div>

                <form onSubmit={placeOrderHandler}>
                    <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6 fade-in-up delay-100">
                            
                            {/* Shipping Address */}
                            <div
                                ref={addressSectionRef}
                                className={`glass rounded-3xl p-5 sm:p-8 border transition-all ${
                                    addressError
                                        ? 'border-red-400 ring-4 ring-red-400/20 bg-red-50/20'
                                        : 'border-emerald-100'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${addressError ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">1. Delivery Address Details</h2>
                                            <p className="text-xs text-gray-500">Required before placing your order</p>
                                        </div>
                                    </div>
                                    {addressError && (
                                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> Required First
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Full Street Address, House/Flat No. <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            placeholder="e.g. House #12, Road #4, Sadar Road, Barishal"
                                            value={shippingAddress.address}
                                            onChange={(e) => {
                                                setShippingAddress({ ...shippingAddress, address: e.target.value });
                                                if (addressError && e.target.value.trim()) setAddressError(false);
                                            }}
                                            className={`input-glass w-full text-sm sm:text-base ${addressError && !shippingAddress.address.trim() ? 'border-red-400 focus:border-red-500' : ''}`}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                City / District <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                placeholder="e.g. Barishal (or Dhaka, Khulna, etc.)"
                                                value={shippingAddress.city}
                                                onChange={(e) => {
                                                    setShippingAddress({ ...shippingAddress, city: e.target.value });
                                                    // Auto adjust shipping zone if user types Barishal
                                                    if (e.target.value.toLowerCase().includes('barishal')) {
                                                        setIsInsideBarishal(true);
                                                    }
                                                    if (addressError && e.target.value.trim()) setAddressError(false);
                                                }}
                                                className={`input-glass w-full text-sm sm:text-base ${addressError && !shippingAddress.city.trim() ? 'border-red-400' : ''}`}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Active Contact Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    placeholder="e.g. 017XXXXXXXX"
                                                    value={shippingAddress.phone}
                                                    onChange={(e) => {
                                                        setShippingAddress({ ...shippingAddress, phone: e.target.value });
                                                        if (addressError && e.target.value.trim()) setAddressError(false);
                                                    }}
                                                    className={`input-glass w-full text-sm sm:text-base ${addressError && !shippingAddress.phone.trim() ? 'border-red-400' : ''}`}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                                Postal Code (Optional)
                                            </label>
                                            <input
                                                placeholder="e.g. 8200"
                                                value={shippingAddress.postalCode}
                                                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                                                className="input-glass w-full text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                                            <input
                                                value={shippingAddress.country}
                                                readOnly
                                                className="input-glass w-full bg-gray-50/80 text-sm text-gray-600 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Zone */}
                            <div className="glass rounded-3xl p-5 sm:p-8 border border-emerald-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">2. Delivery Location Zone</h2>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                        <Scale className="w-3.5 h-3.5" />
                                        <span>Est. Parcel: {totalWeightKg} kg ({totalItemsCount} plants)</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">
                                    Courier rate is based on delivery district and parcel weight (+৳20 per extra kg above 1kg base).
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <label className={`cursor-pointer border-2 p-4 sm:p-5 rounded-2xl transition-all ${isInsideBarishal ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20' : 'border-gray-200 bg-white/60 hover:bg-emerald-50/30'}`}>
                                        <input
                                            type="radio"
                                            name="shippingZone"
                                            checked={isInsideBarishal}
                                            onChange={() => setIsInsideBarishal(true)}
                                            className="hidden"
                                        />
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-gray-900 text-sm sm:text-base">Inside Barishal Metro</span>
                                            <span className="text-emerald-700 font-black text-base sm:text-lg">{formatCurrency(100 + extraWeightCharge)}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Fast 24-48h Delivery (Base ৳100 up to 1kg{extraKg > 0 ? ` + ৳${extraWeightCharge} extra wt` : ''})</p>
                                    </label>
                                    <label className={`cursor-pointer border-2 p-4 sm:p-5 rounded-2xl transition-all ${!isInsideBarishal ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20' : 'border-gray-200 bg-white/60 hover:bg-emerald-50/30'}`}>
                                        <input
                                            type="radio"
                                            name="shippingZone"
                                            checked={!isInsideBarishal}
                                            onChange={() => setIsInsideBarishal(false)}
                                            className="hidden"
                                        />
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-gray-900 text-sm sm:text-base">Outside Barishal (All 64 Districts)</span>
                                            <span className="text-emerald-700 font-black text-base sm:text-lg">{formatCurrency(150 + extraWeightCharge)}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">2-4 Days Moist-Locked Packaging (Base ৳150 up to 1kg{extraKg > 0 ? ` + ৳${extraWeightCharge} extra wt` : ''})</p>
                                    </label>
                                </div>
                            </div>

                            {/* Payment Option */}
                            <div className="glass rounded-3xl p-5 sm:p-8 border border-emerald-100">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-2xl font-bold text-gray-900">3. Payment Option</h2>
                                        <p className="text-xs text-gray-500">Choose Cash on Delivery or bKash</p>
                                    </div>
                                </div>

                                <div className="space-y-3.5">
                                    {/* Cash on Delivery */}
                                    <label
                                        className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                            paymentMethod === 'Cash on Delivery'
                                                ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                                                : 'border-gray-200 bg-white/60 hover:bg-emerald-50/20'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Cash on Delivery"
                                            checked={paymentMethod === 'Cash on Delivery'}
                                            onChange={() => handleSelectPaymentMethod('Cash on Delivery')}
                                            className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 text-sm sm:text-base">Cash on Delivery (COD)</span>
                                                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Standard</span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                                Inspect your live plants and pots upon arrival, then pay cash directly to the delivery person.
                                            </p>
                                        </div>
                                    </label>

                                    {/* bKash Payment */}
                                    <label
                                        className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                            paymentMethod === 'bKash Payment'
                                                ? 'border-[#E2136E] bg-pink-50/70 shadow-md ring-2 ring-pink-500/20'
                                                : 'border-gray-200 bg-white/60 hover:bg-pink-50/20'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="bKash Payment"
                                            checked={paymentMethod === 'bKash Payment'}
                                            onChange={() => handleSelectPaymentMethod('bKash Payment')}
                                            className="mt-1 w-4 h-4 text-[#E2136E] focus:ring-pink-500"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#E2136E] text-sm sm:text-base">bKash Send Money</span>
                                                    <span className="text-[11px] bg-[#E2136E] text-white px-2 py-0.5 rounded-full font-bold">Fast</span>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-gray-800 bg-white px-2.5 py-0.5 rounded-lg border border-pink-200">
                                                    {BKASH_NUMBER}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                Send Money to Green Petals official bKash: <strong>{BKASH_NUMBER}</strong> and confirm your Transaction ID.
                                            </p>
                                            {transactionId && (
                                                <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                                                    <span>TrxID: <strong className="font-mono uppercase">{transactionId}</strong></span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowPaymentModal(true);
                                                        }}
                                                        className="underline text-emerald-900 ml-2"
                                                    >
                                                        Edit TrxID
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="fade-in-up delay-200">
                            <div className="glass rounded-3xl p-5 sm:p-8 sticky top-24 space-y-5 border border-emerald-100 shadow-xl">
                                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Order Summary</h2>

                                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                    {cartItems.map((item) => (
                                        <div key={item.productId} className="flex gap-3 items-center p-2.5 sm:p-3 rounded-2xl bg-white/70 border border-emerald-50">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                                <p className="text-[11px] text-gray-500">Qty: {item.qty} × {formatCurrency(item.price)}</p>
                                            </div>
                                            <span className="text-xs sm:text-sm font-bold text-gray-900">{formatCurrency(item.price * item.qty)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2.5 py-4 border-y border-emerald-100 text-xs sm:text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)} items)</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Plant Health & VAT (10%)</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(tax)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <div>
                                            <span className="block">Courier Delivery</span>
                                            <span className="text-[11px] text-gray-500">Weight: {totalWeightKg} kg ({totalItemsCount} plants)</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-semibold text-gray-900 block">{formatCurrency(shipping)}</span>
                                            <span className="text-[11px] text-emerald-700 font-medium">
                                                {isInsideBarishal ? 'Barishal (৳100 base)' : 'Outside Barishal (৳150 base)'}
                                                {extraKg > 0 ? ` + ৳${extraWeightCharge} (${extraKg}kg extra)` : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-baseline pt-1">
                                    <div>
                                        <span className="text-sm sm:text-base font-semibold text-gray-700 block">Total Payable</span>
                                        <span className="text-[11px] text-gray-400">All taxes, packaging & courier included</span>
                                    </div>
                                    <span className="text-2xl sm:text-3xl font-extrabold text-gradient">{formatCurrency(total)}</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || isSubmitting || cartItems.length === 0}
                                    className="btn-primary w-full h-13 sm:h-14 text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all"
                                >
                                    {isSubmitting || loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Processing Order...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>Place Order • {formatCurrency(total)}</span>
                                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </>
                                    )}
                                </button>

                                {/* Plant Guarantee & Policy Card */}
                                <PlantGuaranteeCard className="mt-4" />
                            </div>
                        </div>
                    </div>
                </form>

                {/* 100% Mobile-Perfect bKash Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md mx-auto my-auto shadow-2xl border border-pink-100 overflow-hidden animate-scale-in max-h-[92vh] flex flex-col">
                            
                            {/* Header Banner */}
                            <div className="bg-gradient-to-r from-[#D12053] via-[#E2136E] to-[#BE185D] text-white p-4 sm:p-5 relative flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="absolute top-3 right-3 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-2.5 mb-2">
                                    <div className="w-8 h-8 rounded-xl bg-white text-[#E2136E] flex items-center justify-center shadow font-black text-lg">
                                        b
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold tracking-tight leading-tight">bKash Send Money</h3>
                                        <p className="text-[11px] text-pink-100">Green Petals Official Nursery Payment</p>
                                    </div>
                                </div>

                                <div className="mt-2.5 bg-white/15 backdrop-blur-md rounded-xl p-2.5 sm:p-3 flex items-center justify-between border border-white/20">
                                    <div>
                                        <span className="text-[11px] text-pink-100 block">Total Payable</span>
                                        <span className="text-xl sm:text-2xl font-black text-white">{formatCurrency(total)}</span>
                                    </div>
                                    <span className="text-[11px] bg-white text-[#E2136E] px-2.5 py-1 rounded-full font-bold">
                                        Personal Number
                                    </span>
                                </div>
                            </div>

                            {/* Scrollable Body */}
                            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                                
                                {/* bKash Number & Copy Button (Mobile Stacked, Never Truncates) */}
                                <div className="bg-pink-50/90 border-2 border-pink-200 rounded-2xl p-3.5 text-center space-y-2.5">
                                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium">
                                        <Smartphone className="w-3.5 h-3.5 text-[#E2136E]" />
                                        <span>Proprietor: <strong>Munnar Khanam</strong></span>
                                    </div>
                                    
                                    <div className="py-1">
                                        <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-gray-900 block select-all">
                                            {BKASH_NUMBER}
                                        </span>
                                    </div>

                                    {/* Full-width button so it NEVER cuts off on any phone screen */}
                                    <button
                                        type="button"
                                        onClick={copyBkashNumber}
                                        className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                                            copied
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-[#E2136E] text-white hover:bg-[#D12053] active:scale-95'
                                        }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" /> Copied Number!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" /> Copy bKash Number
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Step by Step Guide in Bangla */}
                                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 text-xs text-gray-700 space-y-1.5">
                                    <p className="font-bold text-gray-900 mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                        <Sparkles className="w-3.5 h-3.5 text-[#E2136E]" /> পেমেন্ট করার নিয়ম:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 leading-relaxed text-gray-600">
                                        <li>বিকাশ অ্যাপ ওপেন করুন বা ডায়াল করুন <strong className="font-mono">*247#</strong></li>
                                        <li><strong>Send Money</strong> নির্বাচন করুন</li>
                                        <li>নম্বর দিন: <strong className="text-[#E2136E] font-mono">{BKASH_NUMBER}</strong></li>
                                        <li>পরিমাণ দিন: <strong className="text-gray-900">{formatCurrency(total)}</strong></li>
                                        <li>পিন দিয়ে সফল করুন ও <strong>TrxID</strong> কপি করুন</li>
                                    </ol>
                                </div>

                                {/* Transaction ID Input Form */}
                                <form onSubmit={handleTransactionSubmit} className="space-y-3.5">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1">
                                            Enter bKash Transaction ID (TrxID) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. BL9K4A8M2P"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                                            className="input-glass w-full text-sm sm:text-base font-mono uppercase tracking-wider py-2.5 border-pink-200 focus:border-[#E2136E] focus:ring-[#E2136E]/20"
                                            required
                                            autoFocus
                                        />
                                        <p className="text-[11px] text-gray-500 mt-1">
                                            Found in your bKash SMS or transaction receipt.
                                        </p>
                                    </div>

                                    {/* Full width mobile friendly buttons */}
                                    <div className="pt-1 flex flex-col-reverse sm:flex-row gap-2 w-full">
                                        <button
                                            type="button"
                                            onClick={() => setShowPaymentModal(false)}
                                            className="w-full sm:w-1/3 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-xs sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!transactionId.trim()}
                                            className="w-full sm:w-2/3 bg-gradient-to-r from-[#D12053] to-[#E2136E] text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Confirm & Place Order
                                        </button>
                                    </div>
                                </form>

                                <div className="text-center text-[11px] text-gray-500 pt-0.5">
                                    Hotline: <a href="tel:01768686120" className="text-emerald-700 font-bold hover:underline">01768686120</a> (Munnar Khanam)
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
