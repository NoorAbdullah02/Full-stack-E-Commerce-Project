import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts, createProduct, deleteProduct, generateDescription, getCategories, updateProduct, createCategory } from '../redux/slices/productSlice';
import { listAllOrders, updateOrderStatus, cancelOrder } from '../redux/slices/orderSlice';
import { listUsers } from '../redux/slices/authSlice';
import { formatCurrency } from '../utils/currency';
import { showConfirm, showSuccess, showError, showToast } from '../utils/alerts';
import { Package, ShoppingCart, Sparkles, Trash2, Upload, User, Edit, Plus, TrendingUp, BarChart3, PieChart, XCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const galleryInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [activeTab, setActiveTabState] = useState(() => {
        return new URLSearchParams(window.location.search).get('tab') || 'analytics';
    });

    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url.toString());
    };
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editProductId, setEditProductId] = useState(null);

    // Filters and Search
    const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
    const [paymentFilter, setPaymentFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrders, setSelectedOrders] = useState([]);

    // Product Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState(''); // This will be the "Selling Price" (Auto-calculated)
    const [originalPrice, setOriginalPrice] = useState(''); // This is the "Regular Price"
    const [discount, setDiscount] = useState(''); // Percentage
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [fitMode, setFitMode] = useState('fill');

    const { products, categories, loading: loadingProducts } = useSelector((state) => state.product);
    const { orders, loading: loadingOrders } = useSelector((state) => state.order);
    const { users, loading: loadingUsers } = useSelector((state) => state.auth);

    useEffect(() => {
        if (activeTab === 'products') {
            console.log('Dispatching listProducts and getCategories');
            dispatch(listProducts());
            dispatch(getCategories());
        } else if (activeTab === 'orders') {
            dispatch(listAllOrders());
        } else if (activeTab === 'users') {
            dispatch(listUsers());
        }
    }, [dispatch, activeTab]);

    useEffect(() => {
        console.log('AdminDashboard Categories State:', categories);
    }, [categories]);

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        const formData = {
            name,
            price,
            description,
            stock,
            categoryId,
            ...(image && { images: image }), // This needs logic update for file upload if changing image
        };

        if (!name || !price || stock === '' || !categoryId) {
            showToast({ icon: 'warning', title: 'অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন' });
            return;
        }

        // For file upload with FormData (if image is selected)
        // Construction of FormData for BOTH Create and Update
        const data = new FormData();
        data.append('name', name);
        data.append('price', Number(price).toString());
        if (originalPrice) data.append('originalPrice', Number(originalPrice).toString());
        if (discount) data.append('discount', Number(discount).toString());
        data.append('description', description);
        data.append('stock', Number(stock).toString());
        data.append('categoryId', categoryId);
        data.append('aspectRatio', aspectRatio);
        data.append('fitMode', fitMode);
        if (image) data.append('images', image);
        if (imageUrl) data.append('imageUrl', imageUrl);

        try {
            if (isEditing) {
                // If editing, we pass the FormData as productData
                await dispatch(updateProduct({
                    id: editProductId,
                    productData: data // Pass FormData instad of JSON object
                })).unwrap();
                showToast({ icon: 'success', title: `🌿 "${name}" সফলভাবে আপডেট হয়েছে!` });
            } else {
                await dispatch(createProduct(data)).unwrap();
                showToast({ icon: 'success', title: `🌱 "${name}" নতুন গাছ হিসেবে যুক্ত হয়েছে!` });
            }

            setIsAddingProduct(false);
            resetForm();
        } catch (err) {
            console.error('Failed to save product:', err);
            showError('সংরক্ষণ ব্যর্থ হয়েছে', err.message || err);
        }
    };

    const resetForm = () => {
        setName(''); setPrice(''); setOriginalPrice(''); setDiscount(''); setDescription(''); setStock(''); setImage(null); setImagePreview(null); setCategoryId('');
        setShowNewCategoryInput(false);
        setNewCategoryName('');
        setIsEditing(false);
        setEditProductId(null);
    };

    const handleAddCategorySubmit = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const created = await dispatch(createCategory(newCategoryName.trim())).unwrap();
            setCategoryId(created.id);
            setNewCategoryName('');
            setShowNewCategoryInput(false);
            showToast({ icon: 'success', title: `🌿 "${created.name}" নতুন ক্যাটাগরি তৈরি ও নির্বাচন সম্পন্ন!` });
        } catch (err) {
            showError('ক্যাটাগরি তৈরি ব্যর্থ', err || 'ক্যাটাগরি তৈরি করা সম্ভব হয়নি');
        }
    };

    const handleEditProduct = (product) => {
        setName(product.name || '');
        setPrice(product.price || '');
        setOriginalPrice(product.originalPrice || '');
        setDiscount(product.discount || '');
        setDescription(product.description || '');
        setStock(product.stock || '');
        setCategoryId(product.categoryId || '');
        setImage(null);
        setImagePreview(product.images?.[0] || product.image || null);
        setEditProductId(product.id);
        setIsEditing(true);
        setIsAddingProduct(true);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    // Auto-calculate Discount/Price
    useEffect(() => {
        if (originalPrice && discount) {
            const discounted = Number(originalPrice) - (Number(originalPrice) * (Number(discount) / 100));
            setPrice(discounted.toFixed(2)); // Selling Price
        } else if (originalPrice && !discount) {
            // If discount is cleared, you might want to reset price to original? 
            // Or let user edit price manually. For now, let's auto-fill if null
            setPrice(originalPrice);
        }
    }, [originalPrice, discount]);

    const handleDeleteProduct = async (product) => {
        const prodId = typeof product === 'object' ? product.id : product;
        const prodName = typeof product === 'object' ? product.name : 'this product';
        const isConfirmed = await showConfirm({
            title: 'গাছটি কি মুছে ফেলতে চান?',
            text: `"${prodName}" ক্যাটালগ থেকে সম্পূর্ণভাবে ডিলিট হয়ে যাবে।`,
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন 🗑️',
            cancelButtonText: 'বাতিল'
        });
        if (isConfirmed) {
            try {
                await dispatch(deleteProduct(prodId)).unwrap();
                showToast({ icon: 'success', title: `🌿 "${prodName}" সফলভাবে মুছে ফেলা হয়েছে!` });
            } catch (err) {
                console.error('Failed to delete product:', err);
                showError('মুছে ফেলতে সমস্যা হয়েছে', err.message || err);
            }
        }
    };

    const handleGenerateDescription = async () => {
        if (!name) {
            showToast({ icon: 'warning', title: 'প্রথমে গাছের নাম লিখুন (Enter plant name first)' });
            return;
        }
        showToast({ icon: 'info', title: 'AI বিবরণ তৈরি করছে...', timer: 1500 });
        const res = await dispatch(generateDescription(`Write a compelling botanical plant description and care guide for: ${name}`));
        if (res.payload) {
            setDescription(res.payload);
            showToast({ icon: 'success', title: 'বিবরণ প্রস্তুত সম্পন্ন!' });
        }
    };

    // Filter orders based on status, payment method, and search
    const filteredOrders = orders?.filter(order => {
        const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
        const matchesPayment = paymentFilter === 'ALL' ||
            (paymentFilter === 'ONLINE' && order.transactionId) ||
            (paymentFilter === 'COD' && !order.transactionId);
        const matchesSearch = !searchQuery ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user?.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesPayment && matchesSearch;
    }) || [];

    // Bulk order actions
    const handleBulkStatusUpdate = async (status) => {
        if (selectedOrders.length === 0) {
            showToast({ icon: 'warning', title: 'অনুগ্রহ করে প্রথমে অর্ডার নির্বাচন করুন' });
            return;
        }
        const isConfirmed = await showConfirm({
            title: 'অর্ডারের স্ট্যাটাস পরিবর্তন করবেন?',
            text: `${selectedOrders.length}টি অর্ডারের স্ট্যাটাস "${status}" করা হবে।`,
            confirmButtonText: 'হ্যাঁ, পরিবর্তন করুন ✅',
            cancelButtonText: 'বাতিল'
        });
        if (isConfirmed) {
            selectedOrders.forEach(orderId => {
                dispatch(updateOrderStatus({ id: orderId, status }));
            });
            setSelectedOrders([]);
            showToast({ icon: 'success', title: 'স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে' });
        }
    };

    const handleCancelOrder = async (orderId) => {
        const isConfirmed = await showConfirm({
            title: 'অর্ডার বাতিল করবেন?',
            text: `অর্ডার #${orderId.slice(0, 8)} বাতিল করা হবে এবং ইনভেন্টরি স্টক ফিরিয়ে দেওয়া হবে।`,
            confirmButtonText: 'হ্যাঁ, অর্ডার বাতিল করুন',
            cancelButtonText: 'না'
        });
        if (isConfirmed) {
            try {
                await dispatch(cancelOrder(orderId)).unwrap();
                showToast({ icon: 'success', title: 'অর্ডার বাতিল ও স্টক পুনঃস্থাপন সম্পন্ন' });
            } catch (err) {
                showError('অর্ডার বাতিল ব্যর্থ', err.message || err);
            }
        }
    };

    // Export orders to CSV
    const exportToCSV = () => {
        const csvData = filteredOrders.map(order => ({
            'Order ID': order.id.slice(0, 8),
            'User': order.user?.name || 'N/A',
            'Total': order.total,
            'Status': order.status,
            'Payment': order.transactionId ? 'Online' : 'COD',
            'Transaction ID': order.transactionId || 'N/A',
            'Date': new Date(order.createdAt).toLocaleDateString()
        }));

        const headers = Object.keys(csvData[0]).join(',');
        const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Get low stock products
    const lowStockProducts = products?.filter(p => p.stock < 10) || [];


    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-12 fade-in-up">
                    Admin <span className="text-gradient">Dashboard</span>
                </h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 glass rounded-2xl p-2 inline-flex fade-in-up delay-100">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'analytics'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <TrendingUp className="w-5 h-5 inline mr-2" />
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'products'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <Package className="w-5 h-5 inline mr-2" />
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'orders'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <ShoppingCart className="w-5 h-5 inline mr-2" />
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'users'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <User className="w-5 h-5 inline mr-2" />
                        Users
                    </button>
                </div>

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6 fade-in-up delay-200">
                        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-xl">💰</span>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gradient">
                                    {formatCurrency(orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0)}
                                </p>
                                <p className="text-xs text-green-600 mt-1">↗ All time</p>
                            </div>
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Total Orders</p>
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <ShoppingCart className="w-5 h-5 text-emerald-700" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-emerald-700">{orders?.length || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">Total placed</p>
                            </div>
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Total Products</p>
                                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                        <Package className="w-5 h-5 text-teal-700" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-teal-700">{products?.length || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">In catalog</p>
                            </div>
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-amber-700" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-amber-700">{users?.length || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">Registered</p>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenue Chart */}
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-xl font-bold">Revenue Overview</h3>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={(() => {
                                        const monthlyData = {};
                                        orders?.forEach(order => {
                                            const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' });
                                            monthlyData[month] = (monthlyData[month] || 0) + Number(order.total);
                                        });
                                        return Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));
                                    })()}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="month" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#059669" fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Order Status Distribution */}
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <PieChart className="w-5 h-5 text-teal-600" />
                                    <h3 className="text-xl font-bold">Order Status</h3>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RePieChart>
                                        <Pie
                                            data={(() => {
                                                const statusCount = {};
                                                orders?.forEach(order => {
                                                    statusCount[order.status] = (statusCount[order.status] || 0) + 1;
                                                });
                                                const colors = {
                                                    'PENDING': '#f59e0b',
                                                    'PROCESSING': '#0284c7',
                                                    'SHIPPED': '#0d9488',
                                                    'DELIVERED': '#10b981',
                                                    'PAID': '#059669',
                                                    'CANCELLED': '#ef4444'
                                                };
                                                return Object.entries(statusCount).map(([status, count]) => ({
                                                    name: status,
                                                    value: count,
                                                    color: colors[status] || '#6b7280'
                                                }));
                                            })()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {(() => {
                                                const statusCount = {};
                                                orders?.forEach(order => {
                                                    statusCount[order.status] = (statusCount[order.status] || 0) + 1;
                                                });
                                                const colors = {
                                                    'PENDING': '#f59e0b',
                                                    'PROCESSING': '#0284c7',
                                                    'SHIPPED': '#0d9488',
                                                    'DELIVERED': '#10b981',
                                                    'PAID': '#059669',
                                                    'CANCELLED': '#ef4444'
                                                };
                                                return Object.entries(statusCount).map(([status], index) => (
                                                    <Cell key={`cell-${index}`} fill={colors[status] || '#6b7280'} />
                                                ));
                                            })()}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-xl font-bold mb-6">Top Products by Stock</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={products?.slice(0, 5).map(p => ({ name: p.name.substring(0, 20), stock: p.stock })) || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="stock" fill="#059669" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-6 fade-in-up delay-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Product Management</h2>
                            <button
                                onClick={() => {
                                    if (isAddingProduct) resetForm();
                                    setIsAddingProduct(!isAddingProduct);
                                }}
                                className={isAddingProduct ? 'btn-secondary' : 'btn-primary'}
                            >
                                {isAddingProduct ? 'Cancel' : '+ Add Product'}
                            </button>
                        </div>

                        {/* Low Stock Alert */}
                        {lowStockProducts.length > 0 && (
                            <div className="glass rounded-2xl p-6 border-l-4 border-amber-500 bg-amber-50/50">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">⚠️</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-amber-900 mb-2">Low Stock Alert!</h3>
                                        <p className="text-sm text-amber-800 mb-3">{lowStockProducts.length} products have stock below 10 units:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {lowStockProducts.slice(0, 5).map(product => (
                                                <span key={product.id} className="text-xs bg-white px-3 py-1 rounded-full border border-amber-200 text-amber-900">
                                                    {product.name} ({product.stock} left)
                                                </span>
                                            ))}
                                            {lowStockProducts.length > 5 && (
                                                <span className="text-xs bg-amber-200 px-3 py-1 rounded-full text-amber-900 font-semibold">
                                                    +{lowStockProducts.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isAddingProduct && (
                            <div className="glass rounded-3xl p-6 sm:p-8 space-y-6 border-2 border-emerald-300 shadow-xl bg-white/95">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                                            {isEditing ? '✏️ Edit Plant / গাছ এডিট করুন' : '🌱 New Plant / নতুন গাছ যুক্ত করুন'}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            {isEditing ? 'Update plant details, prices, discounts, stock, and photography.' : 'Add a fresh plant to the Green Petals live catalog.'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetForm();
                                            setIsAddingProduct(false);
                                        }}
                                        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                        title="Cancel"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateProduct} className="space-y-5">
                                    {/* Field 1: Plant Name */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                                            <span>Product Name (গাছের নাম) <span className="text-red-500">*</span></span>
                                            <span className="text-[11px] font-normal text-gray-400">e.g. Monstera Deliciosa, Areca Palm</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter plant name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="input-glass w-full text-base font-semibold"
                                            required
                                        />
                                    </div>

                                    {/* Field 2: Pricing Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Regular Price (মূল দাম - ৳)
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 2100"
                                                value={originalPrice}
                                                onChange={(e) => setOriginalPrice(e.target.value)}
                                                className="input-glass w-full bg-white font-mono"
                                            />
                                            <span className="text-[10px] text-gray-400 mt-0.5 block">Original catalog price</span>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Discount (ছাড় - %)
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 20"
                                                value={discount}
                                                onChange={(e) => setDiscount(e.target.value)}
                                                className="input-glass w-full bg-white font-mono"
                                            />
                                            <span className="text-[10px] text-gray-400 mt-0.5 block">Discount percentage</span>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                                                <span>Final Selling Price (বিক্রয় মূল্য - ৳)</span>
                                                <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">Auto</span>
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="Selling Price"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                className="input-glass w-full bg-emerald-100/60 font-bold font-mono text-emerald-900 cursor-not-allowed"
                                                required
                                                readOnly
                                            />
                                            <span className="text-[10px] text-emerald-700 mt-0.5 block">Customer checkout price</span>
                                        </div>
                                    </div>

                                    {/* Field 3: Description with AI Generator */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs sm:text-sm font-bold text-gray-800">
                                                Plant Description & Care Tips (গাছের বিবরণ ও যত্ন) <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleGenerateDescription}
                                                className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl flex items-center gap-1.5 font-bold transition-all active:scale-95 shadow-sm"
                                            >
                                                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                                                AI Generate Description
                                            </button>
                                        </div>
                                        <textarea
                                            rows={4}
                                            placeholder="Enter botanical description, watering, light requirements..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="input-glass w-full text-sm leading-relaxed"
                                            required
                                        />
                                    </div>

                                    {/* Field 4: Stock & Category */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                                                Available Stock Quantity (মজুদ সংখ্যা) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 15"
                                                value={stock}
                                                onChange={(e) => setStock(e.target.value)}
                                                className="input-glass w-full font-mono font-semibold"
                                                required
                                            />
                                            <span className="text-[10px] text-gray-400 mt-0.5 block">Units available at Barishal nursery</span>
                                        </div>
                                    </div>

                                    {/* Field 4: Category Selection as Touch-Friendly Interactive Chips + Create Category */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs sm:text-sm font-bold text-gray-800">
                                                Category (ক্যাটাগরি নির্বাচন করুন) <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition-all active:scale-95 shadow-sm"
                                            >
                                                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>{showNewCategoryInput ? 'বাতিল করুন' : '+ New Category (নতুন ক্যাটাগরি)'}</span>
                                            </button>
                                        </div>

                                        {/* Quick Inline New Category Form */}
                                        {showNewCategoryInput && (
                                            <div className="p-3 mb-3 bg-emerald-50/80 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-fade-in shadow-sm">
                                                <input
                                                    type="text"
                                                    placeholder="নতুন ক্যাটাগরির নাম (যেমন: Bonsai & Mini Trees, Aquatic Plants)..."
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddCategorySubmit();
                                                        }
                                                    }}
                                                    className="input-glass flex-1 text-xs sm:text-sm py-2 bg-white font-medium"
                                                    autoFocus
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleAddCategorySubmit}
                                                        disabled={!newCategoryName.trim()}
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95"
                                                    >
                                                        যুক্ত করুন
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowNewCategoryInput(false);
                                                            setNewCategoryName('');
                                                        }}
                                                        className="px-3 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-semibold rounded-xl"
                                                    >
                                                        বন্ধ
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {categories.map((cat) => {
                                                const isSelected = categoryId === cat.id;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => setCategoryId(cat.id)}
                                                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left border ${
                                                            isSelected
                                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300 scale-[1.02]'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                                                        }`}
                                                    >
                                                        <span className="text-base flex-shrink-0">
                                                            {cat.name.includes('Indoor') ? '🪴' :
                                                             cat.name.includes('Flowering') ? '🌸' :
                                                             cat.name.includes('Succulent') ? '🌵' :
                                                             cat.name.includes('Air') ? '🍃' :
                                                             cat.name.includes('Pot') ? '🏺' :
                                                             cat.name.includes('Care') || cat.name.includes('Soil') ? '🧪' : '🌿'}
                                                        </span>
                                                        <span className="truncate">{cat.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <input type="text" value={categoryId} required className="sr-only" onChange={() => {}} />
                                        <span className="text-[10px] text-gray-400 mt-1 block">Tap a category chip above to assign to this plant</span>
                                    </div>

                                    {/* Field 5: Universal Touch-Friendly Image Upload & Preview */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs sm:text-sm font-bold text-gray-800">
                                                Product Image (গাছের ছবি নির্বাচন করুন) <span className="text-red-500">*</span>
                                            </label>
                                            {imagePreview && (
                                                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    ✓ Photo Ready
                                                </span>
                                            )}
                                        </div>

                                        {/* Big Interactive Preview & Dropzone */}
                                        <div 
                                            onClick={() => galleryInputRef.current?.click()}
                                            className={`w-full rounded-2xl p-4 sm:p-5 border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-4 ${
                                                imagePreview
                                                    ? 'border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/70'
                                                    : 'border-emerald-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/30'
                                            }`}
                                        >
                                            {/* Preview Box */}
                                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gray-100 border-2 border-emerald-200 flex-shrink-0 flex items-center justify-center relative shadow-sm">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Plant Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                                                        <Upload className="w-8 h-8 text-emerald-600 mb-1" />
                                                        <span className="text-[11px] font-bold text-emerald-800">Tap to Select</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Instructions */}
                                            <div className="flex-1 text-center sm:text-left space-y-1">
                                                <h4 className="text-sm font-bold text-gray-800">
                                                    {image ? image.name : (imagePreview ? 'Current Active Photo' : 'Upload Plant Photo')}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    Tap anywhere here or use the quick buttons below to choose directly from your phone.
                                                </p>
                                                <p className="text-[11px] text-emerald-700 font-medium">
                                                    Supports Gallery, Camera, Files (JPG, PNG, WEBP, HEIC)
                                                </p>
                                            </div>
                                        </div>

                                        {/* Dedicated Mobile Quick Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => cameraInputRef.current?.click()}
                                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-98 transition-all"
                                            >
                                                <Camera className="w-4 h-4" />
                                                <span>📸 Camera (ছবি তুলুন)</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => galleryInputRef.current?.click()}
                                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border-2 border-emerald-500 text-emerald-800 font-bold text-xs sm:text-sm shadow-sm hover:bg-emerald-50 active:scale-98 transition-all"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                <span>🖼️ Gallery / Files</span>
                                            </button>
                                        </div>

                                        {/* Hidden native inputs */}
                                        <input
                                            ref={galleryInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImage(file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                        <input
                                            ref={cameraInputRef}
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setImage(file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={loadingProducts}
                                            className="btn-primary flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                                        >
                                            <Plus className="w-5 h-5" />
                                            {loadingProducts ? 'Saving to Database...' : (isEditing ? 'Save & Update Plant' : 'Publish New Plant')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetForm();
                                                setIsAddingProduct(false);
                                            }}
                                            className="px-6 h-12 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-sm transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {loadingProducts ? (
                            <div className="text-center py-12">
                                <div className="animate-pulse text-gray-600">Loading products...</div>
                            </div>
                        ) : (
                            <>
                                {/* Mobile Cards View (Visible on sm/mobile screens) */}
                                <div className="block lg:hidden space-y-3">
                                    {products.map((product) => (
                                        <div key={product.id} className="glass p-3.5 rounded-2xl flex items-center gap-3 border border-emerald-100 bg-white/95 shadow-sm">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                                <img
                                                    src={product.images?.[0] || 'https://via.placeholder.com/150'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-gray-900 truncate">{product.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="font-extrabold text-sm text-emerald-800">{formatCurrency(product.price)}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                                                        {product.stock > 0 ? `${product.stock} in stock` : 'Stock Out'}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-gray-500 block truncate">{product.category?.name || 'Plant'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors active:scale-95"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product)}
                                                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors active:scale-95"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View Table */}
                                <div className="hidden lg:block glass rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white">
                                                <tr>
                                                    <th className="px-6 py-4 text-left font-semibold">Image</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Name</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Price</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Stock</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map((product) => (
                                                    <tr key={product.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                                                <img
                                                                    src={product.images?.[0] || 'https://via.placeholder.com/150'}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium">{product.name}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold">{formatCurrency(product.price)}</span>
                                                                {product.discount > 0 && (
                                                                    <span className="text-xs text-gray-400 line-through">
                                                                        {formatCurrency(product.originalPrice)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-error'}`}>
                                                                {product.stock}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditProduct(product)}
                                                                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                                                >
                                                                    <Edit className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteProduct(product)}
                                                                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-6 fade-in-up delay-200">
                        <h2 className="text-2xl font-bold">Order Management</h2>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                                        <p className="text-3xl font-bold text-gradient">{orders?.length || 0}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <ShoppingCart className="w-6 h-6 text-emerald-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                        <p className="text-3xl font-bold text-gradient">
                                            {formatCurrency(orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-2xl">💰</span>
                                    </div>
                                </div>
                            </div>
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                                        <p className="text-3xl font-bold text-amber-600">
                                            {orders?.filter(o => o.status === 'PENDING').length || 0}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                        <span className="text-2xl">⏳</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Actions */}
                        <div className="glass rounded-2xl p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="🔍 Search by Order ID or User..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="input-glass w-full"
                                    />
                                </div>
                                <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="input-glass">
                                    <option value="ALL">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="PROCESSING">Processing</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="ON_THE_WAY">On the Way</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="PAID">Paid</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="input-glass">
                                    <option value="ALL">All Payments</option>
                                    <option value="ONLINE">Online Payment</option>
                                    <option value="COD">Cash on Delivery</option>
                                </select>
                            </div>

                            {selectedOrders.length > 0 && (
                                <div className="mt-4 flex flex-wrap items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <span className="font-semibold text-emerald-950">{selectedOrders.length} selected</span>
                                    <button onClick={() => handleBulkStatusUpdate('PROCESSING')} className="text-xs px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Mark Processing</button>
                                    <button onClick={() => handleBulkStatusUpdate('SHIPPED')} className="text-xs px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">Mark Shipped</button>
                                    <button onClick={() => handleBulkStatusUpdate('DELIVERED')} className="text-xs px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">Mark Delivered</button>
                                    <button onClick={() => setSelectedOrders([])} className="text-xs px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">Clear Selection</button>
                                </div>
                            )}

                            <div className="mt-4">
                                <button onClick={exportToCSV} className="btn-glass flex items-center gap-2" disabled={filteredOrders.length === 0}>
                                    <span>📥</span> Export to CSV ({filteredOrders.length} orders)
                                </button>
                            </div>
                        </div>

                        {loadingOrders ? (
                            <div className="text-center py-12">
                                <div className="animate-pulse text-gray-600">Loading orders...</div>
                            </div>
                        ) : (
                            <>
                                {/* Mobile Order Cards View (Optimized for Phones) */}
                                <div className="block lg:hidden space-y-3">
                                    {filteredOrders.length === 0 ? (
                                        <div className="glass p-8 text-center text-gray-500 rounded-2xl">
                                            No orders match your filter criteria.
                                        </div>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <div key={order.id} className="glass p-4 rounded-2xl border border-emerald-100 shadow-sm bg-white/95 space-y-3">
                                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedOrders.includes(order.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedOrders([...selectedOrders, order.id]);
                                                                } else {
                                                                    setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                                                                }
                                                            }}
                                                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                                        />
                                                        <span className="font-mono font-bold text-xs text-emerald-950">#{order.id.slice(0, 8)}</span>
                                                    </div>
                                                    <span className="text-[11px] text-gray-500 font-medium">
                                                        {new Date(order.createdAt).toLocaleDateString('en-BD')}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">{order.user ? order.user.name : 'Customer'}</p>
                                                        <p className="text-xs text-gray-500 truncate max-w-[160px]">{order.user?.email || order.shippingAddress?.phone || 'Barishal'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-base font-extrabold text-emerald-800 font-mono block">
                                                            {formatCurrency(order.total)}
                                                        </span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                            order.transactionId ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {order.transactionId ? 'bKash Trx' : 'Cash on Delivery'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {order.transactionId && (
                                                    <div className="bg-emerald-50/70 p-2 rounded-xl text-xs flex justify-between items-center border border-emerald-100">
                                                        <span className="text-gray-600 font-medium">bKash TrxID:</span>
                                                        <span className="font-mono font-bold text-emerald-900">{order.transactionId}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Status:</label>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => {
                                                                const newStatus = e.target.value;
                                                                if (newStatus === 'CANCELLED') {
                                                                    handleCancelOrder(order.id);
                                                                } else {
                                                                    dispatch(updateOrderStatus({ id: order.id, status: newStatus }));
                                                                    showToast({ icon: 'success', title: `Order Status: ${newStatus}` });
                                                                }
                                                            }}
                                                            className="w-full text-xs font-bold py-1.5 px-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800"
                                                        >
                                                            <option value="PENDING">⏳ PENDING</option>
                                                            <option value="PROCESSING">🔄 PROCESSING</option>
                                                            <option value="SHIPPED">📦 SHIPPED</option>
                                                            <option value="ON_THE_WAY">🚚 ON THE WAY</option>
                                                            <option value="DELIVERED">✅ DELIVERED</option>
                                                            <option value="PAID">💵 PAID</option>
                                                            <option value="CANCELLED">❌ CANCELLED</option>
                                                        </select>
                                                    </div>
                                                    {order.status !== 'CANCELLED' ? (
                                                        <button
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            className="px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold self-end transition-all active:scale-95"
                                                            title="Cancel Order"
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                dispatch(updateOrderStatus({ id: order.id, status: 'PROCESSING' }));
                                                                showToast({ icon: 'success', title: 'Order Reactivated to Processing' });
                                                            }}
                                                            className="px-3 py-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-bold self-end transition-all active:scale-95"
                                                            title="Reactivate Order"
                                                        >
                                                            Reactivate
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Desktop View Table */}
                                <div className="hidden lg:block glass rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white">
                                                <tr>
                                                    <th className="px-6 py-4 text-left font-semibold">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedOrders(filteredOrders.map(o => o.id));
                                                                } else {
                                                                    setSelectedOrders([]);
                                                                }
                                                            }}
                                                            className="w-4 h-4"
                                                        />
                                                    </th>
                                                    <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                                                    <th className="px-6 py-4 text-left font-semibold">User</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Total</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Payment</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Transaction ID</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                                                    <th className="px-6 py-4 text-left font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrders.map((order) => (
                                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedOrders.includes(order.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedOrders([...selectedOrders, order.id]);
                                                                    } else {
                                                                        setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                                                                    }
                                                                }}
                                                                className="w-4 h-4"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 font-medium">#{order.id.slice(0, 8)}</td>
                                                        <td className="px-6 py-4">{order.user ? order.user.name : 'N/A'}</td>
                                                        <td className="px-6 py-4 font-semibold text-gradient">{formatCurrency(order.total)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.transactionId
                                                                ? 'bg-teal-100 text-teal-800'
                                                                : 'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {order.transactionId ? '💳 Online' : '💵 COD'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {order.transactionId ? (
                                                                <span className="font-mono text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-200 text-emerald-800">
                                                                    {order.transactionId}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`badge ${order.status === 'PAID' ? 'badge-success' :
                                                                order.status === 'DELIVERED' ? 'bg-blue-100 text-blue-700' :
                                                                    'badge-warning'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {new Date(order.createdAt).toLocaleDateString('en-BD')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <select
                                                                    value={order.status}
                                                                    onChange={(e) => {
                                                                        const newStatus = e.target.value;
                                                                        if (newStatus === 'CANCELLED') {
                                                                            handleCancelOrder(order.id);
                                                                        } else {
                                                                            dispatch(updateOrderStatus({ id: order.id, status: newStatus }));
                                                                            showToast({ icon: 'success', title: `Order Status: ${newStatus}` });
                                                                        }
                                                                    }}
                                                                    className="text-xs p-1.5 rounded-lg border border-gray-300 bg-white font-medium"
                                                                >
                                                                    <option value="PENDING">Pending</option>
                                                                    <option value="PROCESSING">Processing</option>
                                                                    <option value="SHIPPED">Shipped</option>
                                                                    <option value="ON_THE_WAY">On the Way</option>
                                                                    <option value="DELIVERED">Delivered</option>
                                                                    <option value="PAID">Paid</option>
                                                                    <option value="CANCELLED">Cancelled</option>
                                                                </select>

                                                                {order.status !== 'CANCELLED' ? (
                                                                    <button
                                                                        onClick={() => handleCancelOrder(order.id)}
                                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                        title="Cancel Order"
                                                                    >
                                                                        <XCircle className="w-5 h-5" />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            dispatch(updateOrderStatus({ id: order.id, status: 'PROCESSING' }));
                                                                            showToast({ icon: 'success', title: 'Order Reactivated' });
                                                                        }}
                                                                        className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-bold hover:bg-emerald-100"
                                                                        title="Reactivate Order"
                                                                    >
                                                                        Reactivate
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6 fade-in-up delay-200">
                        <h2 className="text-2xl font-bold">User Management</h2>
                        {loadingUsers ? (
                            <div className="text-center py-12">
                                <div className="animate-pulse text-gray-600">Loading users...</div>
                            </div>
                        ) : (
                            <div className="glass rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-semibold">Name</th>
                                                <th className="px-6 py-4 text-left font-semibold">Email</th>
                                                <th className="px-6 py-4 text-left font-semibold">Role</th>
                                                <th className="px-6 py-4 text-left font-semibold">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users && users.map((user) => (
                                                <tr key={user.id} className="border-b border-gray-100 hover:bg-white/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium">{user.name}</td>
                                                    <td className="px-6 py-4">{user.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
