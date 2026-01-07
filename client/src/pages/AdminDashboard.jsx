import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts, createProduct, deleteProduct, generateDescription, getCategories, updateProduct } from '../redux/slices/productSlice';
import { listAllOrders, updateOrderStatus, cancelOrder } from '../redux/slices/orderSlice';
import { listUsers } from '../redux/slices/authSlice';
import { formatCurrency } from '../utils/currency';
import { Package, ShoppingCart, Sparkles, Trash2, Upload, User, Edit, Plus, TrendingUp, BarChart3, PieChart, XCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('analytics');
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
    const [image, setImage] = useState(null);

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
            alert('Please fill in all required fields');
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
        if (image) data.append('images', image);

        try {
            if (isEditing) {
                // If editing, we pass the FormData as productData
                await dispatch(updateProduct({
                    id: editProductId,
                    productData: data // Pass FormData instad of JSON object
                })).unwrap();
            } else {
                await dispatch(createProduct(data)).unwrap();
            }

            setIsAddingProduct(false);
            resetForm();
        } catch (err) {
            console.error('Failed to save product:', err);
            alert(`Failed to save product: ${err.message || err}`);
        }
    };

    const resetForm = () => {
        setName(''); setPrice(''); setOriginalPrice(''); setDiscount(''); setDescription(''); setStock(''); setImage(null); setCategoryId('');
        setIsEditing(false);
        setEditProductId(null);
    };

    const handleEditProduct = (product) => {
        setName(product.name);
        setPrice(product.price);
        setOriginalPrice(product.originalPrice || '');
        setDiscount(product.discount || '');
        setDescription(product.description);
        setStock(product.stock);
        setCategoryId(product.categoryId);
        setEditProductId(product.id);
        setIsEditing(true);
        setIsAddingProduct(true);
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

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
                // Optional: success notification
            } catch (err) {
                console.error('Failed to delete product:', err);
                alert(`Failed to delete product: ${err.message || err}`);
            }
        }
    };

    const handleGenerateDescription = async () => {
        if (!name) return alert('Please enter product name first');
        const res = await dispatch(generateDescription(`Write a compelling product description for: ${name}`));
        if (res.payload) {
            setDescription(res.payload);
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
    const handleBulkStatusUpdate = (status) => {
        if (selectedOrders.length === 0) {
            alert('Please select orders first');
            return;
        }
        if (window.confirm(`Update ${selectedOrders.length} orders to ${status}?`)) {
            selectedOrders.forEach(orderId => {
                dispatch(updateOrderStatus({ id: orderId, status }));
            });
            setSelectedOrders([]);
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
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <TrendingUp className="w-5 h-5 inline mr-2" />
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'products'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <Package className="w-5 h-5 inline mr-2" />
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'orders'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <ShoppingCart className="w-5 h-5 inline mr-2" />
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'users'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
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
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <ShoppingCart className="w-5 h-5 text-indigo-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-indigo-600">{orders?.length || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">Total placed</p>
                            </div>
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Total Products</p>
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                        <Package className="w-5 h-5 text-purple-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-purple-600">{products?.length || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">In catalog</p>
                            </div>
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-pink-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-pink-600">{users?.length || 0}</p>
                                <p className="text-xs text-gray-500 mt-1">Registered</p>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenue Chart */}
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart3 className="w-5 h-5 text-indigo-600" />
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
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="month" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Order Status Distribution */}
                            <div className="glass rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <PieChart className="w-5 h-5 text-purple-600" />
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
                                                    'PROCESSING': '#3b82f6',
                                                    'SHIPPED': '#8b5cf6',
                                                    'DELIVERED': '#10b981',
                                                    'PAID': '#06b6d4',
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
                                                    'PROCESSING': '#3b82f6',
                                                    'SHIPPED': '#8b5cf6',
                                                    'DELIVERED': '#10b981',
                                                    'PAID': '#06b6d4',
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
                                    <Bar dataKey="stock" fill="#6366f1" radius={[8, 8, 0, 0]} />
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
                            <div className="glass rounded-2xl p-8 space-y-6">
                                <h3 className="text-xl font-bold">{isEditing ? 'Edit Product' : 'New Product'}</h3>
                                <form onSubmit={handleCreateProduct} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input-glass w-full"
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number"
                                            placeholder="Regular Price (৳)"
                                            value={originalPrice}
                                            onChange={(e) => setOriginalPrice(e.target.value)}
                                            className="input-glass w-full"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Discount (%)"
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value)}
                                            className="input-glass w-full"
                                        />
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Selling Price (Auto-calculated)"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="input-glass w-full bg-gray-50"
                                        required
                                        readOnly
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="input-glass flex-1"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGenerateDescription}
                                            className="btn-glass px-6 flex items-center gap-2"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            AI Generate
                                        </button>
                                    </div>

                                    <input
                                        type="number"
                                        placeholder="Stock"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        className="input-glass w-full"
                                        required
                                    />
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="input-glass w-full text-gray-700"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <Upload className="w-5 h-5 text-indigo-600" />
                                            <span className="text-sm font-medium">Upload Image</span>
                                            <input
                                                type="file"
                                                onChange={(e) => setImage(e.target.files[0])}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </label>
                                        {image && <span className="text-sm text-gray-600">{image.name}</span>}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loadingProducts}
                                        className="btn-primary w-full h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Plus className="w-5 h-5" />
                                        {loadingProducts ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
                                    </button>
                                </form>
                            </div>
                        )}

                        {loadingProducts ? (
                            <div className="text-center py-12">
                                <div className="animate-pulse text-gray-600">Loading products...</div>
                            </div>
                        ) : (
                            <div className="glass rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
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
                                                                onClick={() => handleDeleteProduct(product.id)}
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
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <ShoppingCart className="w-6 h-6 text-indigo-600" />
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
                                <div className="mt-4 flex flex-wrap items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                                    <span className="font-semibold text-indigo-900">{selectedOrders.length} selected</span>
                                    <button onClick={() => handleBulkStatusUpdate('PROCESSING')} className="text-xs px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Mark Processing</button>
                                    <button onClick={() => handleBulkStatusUpdate('SHIPPED')} className="text-xs px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">Mark Shipped</button>
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
                            <div className="glass rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
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
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {order.transactionId ? '💳 Online' : '💵 COD'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {order.transactionId ? (
                                                            <span className="font-mono text-xs bg-indigo-50 px-2 py-1 rounded border border-indigo-200 text-indigo-700">
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
                                                                onChange={(e) => dispatch(updateOrderStatus({ id: order.id, status: e.target.value }))}
                                                                className="text-xs p-1 rounded border border-gray-300 bg-white"
                                                                disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                                                            >
                                                                <option value="PENDING">Pending</option>
                                                                <option value="PROCESSING">Processing</option>
                                                                <option value="SHIPPED">Shipped</option>
                                                                <option value="ON_THE_WAY">On the Way</option>
                                                                <option value="DELIVERED">Delivered</option>
                                                                <option value="PAID">Paid</option>
                                                                <option value="CANCELLED" disabled>Cancelled</option>
                                                            </select>

                                                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm(`Are you sure you want to cancel Order #${order.id.slice(0, 8)}? This will restore stock and cannot be undone.`)) {
                                                                            dispatch(cancelOrder(order.id))
                                                                                .unwrap()
                                                                                .then(() => alert('Order cancelled successfully'))
                                                                                .catch(err => alert(err));
                                                                        }
                                                                    }}
                                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                    title="Cancel Order"
                                                                >
                                                                    <XCircle className="w-5 h-5" />
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
                                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
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
