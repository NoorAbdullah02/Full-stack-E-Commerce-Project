import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderDetails } from '../redux/slices/orderSlice';
import { formatCurrency } from '../utils/currency';
import { showSuccess, showError, showToast } from '../utils/alerts';
import { Package, Truck, CheckCircle, Clock, MapPin, ChevronLeft, Download, XCircle, Sprout, Phone } from 'lucide-react';
import axios from 'axios';

const OrderTracking = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [downloading, setDownloading] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const { order, loading, error } = useSelector((state) => state.order);
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getOrderDetails(id));
    }, [dispatch, id]);

    const handleDownloadInvoice = async () => {
        try {
            setDownloading(true);
            const token = userInfo?.token;

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/orders/${id}/invoice`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: 'blob',
                }
            );

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading invoice:', err);
            showError('ডাউনলোড ব্যর্থ হয়েছে', 'ইনভয়েস ডাউনলোড করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
        } finally {
            setDownloading(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            setCancelling(true);
            const token = userInfo?.token;

            const { data } = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/orders/${id}/cancel`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Refresh order details
            dispatch(getOrderDetails(id));
            setShowCancelModal(false);
            showSuccess('অর্ডার বাতিল সম্পন্ন', 'আপনার অর্ডারটি সফলভাবে বাতিল করা হয়েছে এবং পণ্যের স্টক ফেরত দেওয়া হয়েছে।');
        } catch (err) {
            console.error('Error cancelling order:', err);
            showError('অর্ডার বাতিল ব্যর্থ', err.response?.data?.message || 'অর্ডার বাতিল করা সম্ভব হয়নি।');
        } finally {
            setCancelling(false);
        }
    };

    const canCancelOrder = order && order.status !== 'CANCELLED' && order.status !== 'DELIVERED';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="glass p-8 rounded-3xl">
                    <div className="animate-pulse text-gray-600">Loading order details...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="glass p-8 rounded-3xl text-center">
                    <div className="text-red-500 mb-4 text-xl">Error loading order</div>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/profile" className="btn-primary px-6 py-2 rounded-xl">
                        Back to Profile
                    </Link>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const steps = [
        { status: 'PAID', label: 'Order Placed', icon: Clock },
        { status: 'PROCESSING', label: 'Processing', icon: Package },
        { status: 'SHIPPED', label: 'On the Way', icon: Truck },
        { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
    ];

    const currentStepIndex = steps.findIndex(s => s.status === order.status);
    const progress = Math.max(0, (currentStepIndex / (steps.length - 1)) * 100);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link to="/profile" className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back to Orders
                </Link>

                <div className="glass rounded-3xl p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Green Petals" className="w-12 h-12 rounded-full object-cover shadow ring-2 ring-emerald-500/20 bg-white flex-shrink-0" />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold mb-0.5">Order #{order.id.slice(0, 8)}</h1>
                                <p className="text-gray-500 text-xs sm:text-sm">
                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-BD')} • Green Petals Garden Centre
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-full font-medium text-sm border ${order.status === 'CANCELLED'
                                    ? 'bg-red-50 text-red-700 border-red-100'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                Status: {order.status}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <button
                            onClick={handleDownloadInvoice}
                            disabled={downloading}
                            className="btn-primary px-6 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            {downloading ? 'Downloading...' : 'Download Invoice'}
                        </button>

                        {canCancelOrder && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="px-6 py-2 rounded-xl flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors font-medium"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancel Order
                            </button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative mb-12 px-4">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-emerald-600 -z-10 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>

                        <div className="flex justify-between w-full">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = index <= currentStepIndex;
                                const isCompleted = index < currentStepIndex;

                                return (
                                    <div key={step.status} className="flex flex-col items-center gap-2">
                                        <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all bg-white ${isActive
                                            ? 'border-emerald-600 text-emerald-700 scale-110 shadow-sm'
                                            : 'border-gray-200 text-gray-300'
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-xs font-semibold ${isActive ? 'text-emerald-800' : 'text-gray-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-gray-100 pt-8">
                        <h2 className="font-bold text-lg mb-4">Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 glass rounded-2xl bg-white/40">
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.product?.images?.[0] || item.product?.image || 'https://via.placeholder.com/150'}
                                            alt={item.product?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right font-bold text-gray-900">
                                        {formatCurrency(item.price)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="grid md:grid-cols-2 gap-8 mt-8 border-t border-gray-100 pt-8">
                        <div>
                            <h2 className="font-bold text-lg mb-4">Shipping Address</h2>
                            {order.shippingAddress ? (
                                <div className="text-gray-600 text-sm space-y-1">
                                    <p className="font-medium text-gray-900">{order.user?.name}</p>
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                    <p className="mt-2 text-xs text-emerald-700 font-semibold bg-emerald-50 inline-block px-2.5 py-1 rounded-lg border border-emerald-100">
                                        {order.shippingAddress.city.toLowerCase().includes('barishal') ? 'Inside Barishal Metro' : 'Outside Barishal (All BD)'}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-gray-500">Address not available</p>
                            )}
                        </div>
                        <div>
                            <h2 className="font-bold text-lg mb-4">Summary</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.items.reduce((acc, item) => acc + item.price * item.quantity, 0))}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>
                                        {order.shippingAddress
                                            ? formatCurrency(order.shippingAddress.city && order.shippingAddress.city.toLowerCase().includes('barishal') ? 100 : 180)
                                            : 'Calculated'}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post-Delivery Botanical Plant Care Guide */}
                <div className="glass rounded-3xl p-6 sm:p-8 border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-500/5 via-white to-teal-500/5 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-emerald-100">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Sprout className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg sm:text-xl font-black text-gray-900">
                                    🌱 গ্রিন পেটালস পোস্ট-ডেলিভারি চারাগাছ পরিচর্যা গাইড
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    চারা পৌঁছানোর পর দীর্ঘস্থায়ী বৃদ্ধির ৩-ধাপের বৈজ্ঞানিক যত্ন রুটিন
                                </p>
                            </div>
                        </div>
                        <span className="self-start sm:self-auto text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                            100% Viable Root Care
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Stage 1: Day 1-3 */}
                        <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">১</span>
                                <h4 className="font-bold text-sm text-gray-900">Day 1–3: আনবক্সিং ও হাইড্রেশন</h4>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                পার্সেল খুলে আলতোভাবে ময়েশ্চার-লক কাগজ সরান। কড়া রোদে না দিয়ে ছায়াযুক্ত কিন্তু বাতাস চলাচল করে এমন স্থানে রাখুন। শিকড়ে পরিমিত পানি স্প্রে করুন।
                            </p>
                        </div>

                        {/* Stage 2: Day 7 */}
                        <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-sm space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">২</span>
                                <h4 className="font-bold text-sm text-gray-900">Day 7: শিকড় থিতু হওয়া ও আলো</h4>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                উজ্জ্বল পরোক্ষ আলোতে রাখুন। মাটির ওপরের ১ ইঞ্চি শুকনা লাগলে পানি দিন। অতিরিক্ত পানি নিষ্কাশন নিশ্চিত করুন যেন গোড়ায় পানি জমে না থাকে।
                            </p>
                        </div>

                        {/* Stage 3: Day 30 */}
                        <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">৩</span>
                                <h4 className="font-bold text-sm text-gray-900">Day 30: প্রথম জৈব সার ও নতুন পাতা</h4>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                ১ মাস পর ১-২ চামচ ভার্মিকম্পোস্ট বা পাতা পচা সার টবের কিনার ঘেঁষে দিন। মাটি আলগা করে দিন এবং শুকনো পুরোনো পাতা সাবধানে ছেঁটে দিন।
                            </p>
                        </div>
                    </div>

                    {/* Helpline & WhatsApp support */}
                    <div className="mt-6 pt-4 border-t border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/60 p-4 rounded-2xl">
                        <div className="text-xs text-gray-700">
                            <strong>চারা নিয়ে যেকোনো সংশয় বা সাহায্যের প্রয়োজন?</strong><br/>
                            প্রোপ্রাইটর মুন্নার খানম সরাসরি পরামর্শের জন্য প্রস্তুত আছেন।
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href="https://wa.me/01768686120"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] border-none shadow"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                <span>হোয়াটসঅ্যাপ কেয়ার</span>
                            </a>
                            <a
                                href="tel:01768686120"
                                className="btn-glass text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 border border-emerald-300"
                            >
                                <span>কল: 01768686120</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Order Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-3xl p-8 max-w-md w-full animate-scale-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Cancel Order?</h2>
                            <p className="text-gray-600">
                                Are you sure you want to cancel this order? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors font-medium disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
