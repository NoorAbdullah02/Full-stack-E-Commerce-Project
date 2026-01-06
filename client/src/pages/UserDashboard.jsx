import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listMyOrders } from '../redux/slices/orderSlice';
import { formatCurrency } from '../utils/currency';
import { Link } from 'react-router-dom';
import { User, Package, Download, Calendar } from 'lucide-react';
import axios from 'axios';
import store from '../redux/store';

const UserDashboard = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const { orders, loading, error } = useSelector((state) => state.order);

    useEffect(() => {
        dispatch(listMyOrders());
    }, [dispatch]);

    const handleDownloadInvoice = async (orderId) => {
        try {
            const { auth: { userInfo } } = store.getState();
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                responseType: 'blob', // Important
            };
            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/invoice`, config);

            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download invoice');
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-12 fade-in-up">
                    My <span className="text-gradient">Account</span>
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1 fade-in-up">
                        <div className="glass rounded-2xl p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {userInfo?.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{userInfo?.name}</h2>
                                    <p className="text-gray-600">{userInfo?.email}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200 space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <User className="w-5 h-5 text-indigo-600" />
                                    <span className="font-medium">Member since {new Date().getFullYear()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Package className="w-5 h-5 text-indigo-600" />
                                    <span className="font-medium">{orders?.length || 0} Orders</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders Section */}
                    <div className="lg:col-span-2 space-y-6 fade-in-up delay-100">
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6">My Orders</h2>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-pulse text-gray-600">Loading orders...</div>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12">
                                    <div className="text-red-600">{error}</div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No orders found.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="glass rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</span>
                                                        <span className={`badge ${order.status === 'PAID' ? 'badge-success' :
                                                            order.status === 'DELIVERED' ? 'bg-blue-100 text-blue-700' :
                                                                'badge-warning'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{new Date(order.createdAt).toLocaleDateString('en-BD', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">Total</p>
                                                        <p className="text-2xl font-bold text-gradient">{formatCurrency(order.total)}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Link to={`/order/${order.id}`} className="btn-primary px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm">
                                                            <Package className="w-4 h-4" />
                                                            Track
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDownloadInvoice(order.id)}
                                                            className="btn-glass px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Invoice
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
