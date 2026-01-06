import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderDetails } from '../redux/slices/orderSlice';
import { formatCurrency } from '../utils/currency';
import { Package, Truck, CheckCircle, Clock, MapPin, ChevronLeft, Download, XCircle } from 'lucide-react';
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
            alert('Failed to download invoice. Please try again.');
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
            alert('Order cancelled successfully!');
        } catch (err) {
            console.error('Error cancelling order:', err);
            alert(err.response?.data?.message || 'Failed to cancel order. Please try again.');
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
                <Link to="/profile" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
                    <ChevronLeft className="w-5 h-5" /> Back to Orders
                </Link>

                <div className="glass rounded-3xl p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Order #{order.id.slice(0, 8)}</h1>
                            <p className="text-gray-500 text-sm">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-full font-medium text-sm border ${order.status === 'CANCELLED'
                                    ? 'bg-red-50 text-red-700 border-red-100'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-100'
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
                            className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 rounded-full transition-all duration-1000 ease-out"
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
                                            ? 'border-indigo-600 text-indigo-600 scale-110'
                                            : 'border-gray-200 text-gray-300'
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-xs font-medium ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
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
                                    <p className="mt-2 text-xs text-indigo-600 font-medium bg-indigo-50 inline-block px-2 py-1 rounded">
                                        {order.shippingAddress.city.toLowerCase().includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka'}
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
                                            ? formatCurrency(order.shippingAddress.city.toLowerCase().includes('dhaka') ? 100 : 150)
                                            : 'Calculated'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (10%)</span>
                                    <span>{formatCurrency(order.items.reduce((acc, item) => acc + item.price * item.quantity, 0) * 0.1)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>
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
