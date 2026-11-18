import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { listProducts, createProduct, deleteProduct, generateDescription, getCategories, updateProduct, createCategory } from '../redux/slices/productSlice';
import { listAllOrders, updateOrderStatus, cancelOrder } from '../redux/slices/orderSlice';
import { listUsers } from '../redux/slices/authSlice';
import { formatCurrency } from '../utils/currency';
import { showConfirm, showSuccess, showError, showToast } from '../utils/alerts';
import { Package, ShoppingCart, Sparkles, Trash2, Upload, User, Edit, Plus, TrendingUp, BarChart3, PieChart, XCircle, Camera, Image as ImageIcon, MapPin, Phone, Copy, Check, Eye, Printer, ExternalLink, FileText, CheckCircle2, Sprout, X, Download, Receipt, ShieldCheck, Truck, Calendar, DollarSign, Award, Clock, ArrowUpRight, AlertCircle, Building2 } from 'lucide-react';
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
    const [viewingOrder, setViewingOrder] = useState(null);
    const [orderModalView, setOrderModalView] = useState('invoice'); // 'invoice' | 'slip'
    const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
    const [copiedOrderId, setCopiedOrderId] = useState(null);
    const [analyticsTimeframe, setAnalyticsTimeframe] = useState('ALL'); // 'ALL' | '30D' | '7D' | 'TODAY'

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
    const { users, userInfo, loading: loadingUsers } = useSelector((state) => state.auth);

    useEffect(() => {
        if (activeTab === 'analytics') {
            dispatch(listAllOrders());
            dispatch(listProducts());
            dispatch(listUsers());
        } else if (activeTab === 'products') {
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

    // Helper to safely parse shipping address
    const parseAddress = (addr) => {
        if (!addr) return null;
        if (typeof addr === 'object') return addr;
        try {
            return JSON.parse(addr);
        } catch {
            return { address: String(addr) };
        }
    };

    // Helper to copy complete customer delivery info for couriers (Pathao/Steadfast/RedX)
    const copyCourierAddress = (order) => {
        const addr = parseAddress(order.shippingAddress);
        const customerName = order.user?.name || 'Customer';
        const phone = addr?.phone || order.user?.phone || 'N/A';
        const addressText = addr?.address || 'N/A';
        const city = addr?.city || 'Barishal';
        const postal = addr?.postalCode ? ` - ${addr.postalCode}` : '';
        const items = order.items?.map(i => `${i.product?.name || 'Plant'} (x${i.quantity})`).join(', ') || 'Live Plants';
        const isInsideBarishal = city.toLowerCase().includes('barishal') || city.toLowerCase().includes('বরিশাল');
        const zone = isInsideBarishal ? 'Inside Barishal Metro (৳100)' : 'Outside Barishal (৳180)';

        const text = `🌿 Green Petals Courier Slip
-----------------------------
Order ID: #${order.id.slice(0, 8)}
Customer: ${customerName}
Phone: ${phone}
Delivery Address: ${addressText}, ${city}${postal}
Zone: ${zone}
Items: ${items}
Total Amount: ৳${Number(order.total).toLocaleString()} (Prepaid bKash)
TrxID: ${order.transactionId || 'Prepaid'}
Proprietor Hotline: 01768686120`;

        try {
            navigator.clipboard.writeText(text);
        } catch {
            // Fallback
        }
        setCopiedOrderId(order.id);
        setTimeout(() => setCopiedOrderId(null), 2500);
        showToast({
            icon: 'success',
            title: `কুরিয়ার ডেলিভারি ঠিকানা কপি হয়েছে! (#${order.id.slice(0, 8)})`,
            timer: 3000
        });
    };

    // Helper to print delivery packing slip for plant box
    const printDeliverySlip = (order) => {
        const addr = parseAddress(order.shippingAddress);
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const customerName = order.user?.name || 'Valued Customer';
        const phone = addr?.phone || order.user?.phone || 'N/A';
        const addressText = addr?.address || 'N/A';
        const city = addr?.city || 'Barishal';
        const postal = addr?.postalCode ? ` (${addr.postalCode})` : '';
        const isInsideBarishal = city.toLowerCase().includes('barishal') || city.toLowerCase().includes('বরিশাল');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Delivery Slip - #${order.id.slice(0, 8)}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1f2937; margin: 0; background: #f9fafb; }
                    .card { border: 2px dashed #059669; padding: 24px; border-radius: 20px; max-width: 580px; margin: 0 auto; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
                    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #ecfdf5; padding-bottom: 16px; margin-bottom: 16px; }
                    .logo-box { display: flex; align-items: center; gap: 14px; }
                    .logo-img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #059669; background: #fff; }
                    .brand { font-size: 24px; font-weight: 900; color: #065f46; margin: 0; }
                    .sub { font-size: 11px; text-transform: uppercase; color: #047857; letter-spacing: 1px; font-weight: 700; }
                    .badge { background: #ecfdf5; color: #065f46; border: 1.5px solid #a7f3d0; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 800; }
                    .section { margin-bottom: 16px; padding: 14px; background: #f9fafb; border-radius: 14px; border: 1px solid #e5e7eb; }
                    .recipient-box { background: #ecfdf5; border: 1.5px solid #a7f3d0; }
                    .title { font-size: 11px; text-transform: uppercase; color: #047857; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 6px; }
                    .val { font-size: 17px; font-weight: 800; color: #111827; margin-bottom: 4px; }
                    .text { font-size: 14px; color: #374151; margin-top: 3px; line-height: 1.5; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
                    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
                    th { background: #f3f4f6; color: #374151; font-weight: 700; border-radius: 6px; }
                    .footer { text-align: center; font-size: 11px; color: #4b5563; margin-top: 20px; border-top: 1.5px solid #ecfdf5; padding-top: 14px; line-height: 1.6; }
                    @media print {
                        body { padding: 0; background: #fff; }
                        .card { border: 2px dashed #059669; box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header">
                        <div class="logo-box">
                            <img src="/logo.png" class="logo-img" alt="Green Petals" />
                            <div>
                                <h1 class="brand">Green Petals</h1>
                                <div class="sub">Garden Centre • Live Plant Delivery</div>
                            </div>
                        </div>
                        <div>
                            <span class="badge">#${order.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                    </div>

                    <div class="section recipient-box">
                        <div class="title">Recipient Customer Address (প্রাপকের ঠিকানা)</div>
                        <div class="val">${customerName}</div>
                        <div class="text"><strong>📞 Phone:</strong> ${phone}</div>
                        <div class="text"><strong>📍 Address:</strong> ${addressText}</div>
                        <div class="text"><strong>🏙️ City / District:</strong> ${city}${postal}</div>
                        <div class="text"><strong>🚚 Zone:</strong> ${isInsideBarishal ? 'Barishal Metro (৳100)' : 'Outside Barishal (৳180)'}</div>
                    </div>

                    <div class="section">
                        <div class="title" style="color: #374151;">Parcel Contents (জীবন্ত চারা তালিকা)</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Plant Name</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items?.map(item => `
                                    <tr>
                                        <td><strong>${item.product?.name || 'Live Botanical Plant'}</strong></td>
                                        <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
                                        <td style="text-align: right; font-weight: 600;">৳${Number(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                `).join('') || ''}
                                <tr>
                                    <td colspan="2" style="font-weight: 800; text-align: right; font-size: 14px;">Total Paid:</td>
                                    <td style="font-weight: 900; text-align: right; font-size: 15px; color: #047857;">৳${Number(order.total).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #4b5563; padding: 0 4px;">
                        <div><strong>Payment Method:</strong> bKash (TrxID: <span style="font-family: monospace; font-weight: 700;">${order.transactionId || 'Prepaid'}</span>)</div>
                        <div><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-BD')}</div>
                    </div>

                    <div class="footer">
                        🌿 <strong>100% Viable Root Guarantee</strong> • Moisture-Locked Mailer • Handle With Love<br/>
                        Proprietor: Munnar Khanam • Phone: 01768686120 • Barishal, Bangladesh
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); };
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    // Helper to print full official tax invoice (A4 / Thermal)
    const printOfficialInvoice = (order) => {
        const addr = parseAddress(order.shippingAddress);
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const customerName = order.user?.name || 'Valued Customer';
        const phone = addr?.phone || order.user?.phone || 'N/A';
        const addressText = addr?.address || 'N/A';
        const city = addr?.city || 'Barishal';
        const postal = addr?.postalCode ? ` - ${addr.postalCode}` : '';
        const isInsideBarishal = city.toLowerCase().includes('barishal') || city.toLowerCase().includes('বরিশাল');
        const courierFee = isInsideBarishal ? 100 : 180;
        const subtotal = order.items?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0;
        const total = Number(order.total);
        const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Invoice - INV-${order.id.slice(0, 8).toUpperCase()}</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #1f2937; margin: 0; padding: 20px; background: #fff; line-height: 1.4; }
                    .invoice-box { max-width: 800px; margin: auto; padding: 28px; border: 1.5px solid #d1fae5; border-radius: 20px; box-shadow: 0 4px 15px rgba(5,150,105,0.06); }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2.5px solid #059669; }
                    .brand { display: flex; align-items: center; gap: 14px; }
                    .logo { width: 68px; height: 68px; border-radius: 50%; object-fit: cover; border: 2px solid #059669; background: #fff; }
                    .company-name { font-size: 26px; font-weight: 900; color: #065f46; margin: 0; }
                    .company-sub { font-size: 11px; text-transform: uppercase; color: #059669; font-weight: 800; letter-spacing: 1px; }
                    .company-info { font-size: 12px; color: #4b5563; margin-top: 6px; line-height: 1.5; }
                    .invoice-title-meta { text-align: right; }
                    .invoice-badge { display: inline-block; background: #ecfdf5; color: #065f46; font-size: 18px; font-weight: 900; padding: 5px 16px; border-radius: 8px; border: 1.5px solid #a7f3d0; margin-bottom: 8px; }
                    .meta-row { font-size: 12px; color: #374151; margin-bottom: 3px; }
                    .grid-2 { display: flex; justify-content: space-between; gap: 16px; margin: 22px 0; }
                    .info-card { flex: 1; background: #f9fafb; padding: 15px; border-radius: 14px; border: 1px solid #e5e7eb; }
                    .info-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #059669; margin-bottom: 6px; letter-spacing: 0.5px; }
                    .customer-name { font-size: 16px; font-weight: 800; color: #111827; margin-bottom: 4px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background: #059669; color: #fff; text-align: left; padding: 10px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                    th:first-child { border-radius: 8px 0 0 8px; }
                    th:last-child { border-radius: 0 8px 8px 0; text-align: right; }
                    td { padding: 11px 14px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
                    td:last-child { text-align: right; font-weight: 700; }
                    .totals-section { display: flex; justify-content: flex-end; margin-top: 10px; }
                    .totals-table { width: 330px; }
                    .totals-table td { padding: 6px 10px; border: none; font-size: 13px; }
                    .total-row { font-size: 16px; font-weight: 900; color: #065f46; border-top: 2px solid #059669 !important; }
                    .guarantee-box { margin-top: 22px; padding: 14px; background: #ecfdf5; border-radius: 12px; border: 1.5px dashed #10b981; font-size: 12px; color: #065f46; line-height: 1.6; }
                    .signature-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 35px; padding-top: 18px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
                    .sign-box { text-align: center; }
                    .sign-line { width: 180px; border-top: 1.5px solid #374151; margin-bottom: 6px; }
                    @media print {
                        body { padding: 0; background: #fff; }
                        .invoice-box { border: none; box-shadow: none; padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        <div class="brand">
                            <img src="/logo.png" class="logo" alt="Green Petals" />
                            <div>
                                <h1 class="company-name">Green Petals</h1>
                                <div class="company-sub">Garden Centre • Botanical Boutique</div>
                                <div class="company-info">
                                    📍 Barishal Metro, Bangladesh<br/>
                                    📞 Helpline: 01768686120 • ✉️ munner.ent@gmail.com<br/>
                                    🌐 facebook.com/share/1E2Y48eA5s/
                                </div>
                            </div>
                        </div>
                        <div class="invoice-title-meta">
                            <div class="invoice-badge">OFFICIAL INVOICE</div>
                            <div class="meta-row"><strong>Invoice #:</strong> INV-${order.id.slice(0, 8).toUpperCase()}</div>
                            <div class="meta-row"><strong>Order ID:</strong> #${order.id.slice(0, 8).toUpperCase()}</div>
                            <div class="meta-row"><strong>Date:</strong> ${invoiceDate}</div>
                            <div class="meta-row"><strong>Status:</strong> <span style="font-weight: 800; color: #059669;">${order.status}</span></div>
                        </div>
                    </div>

                    <div class="grid-2">
                        <div class="info-card">
                            <div class="info-title">Billed & Shipped To (গ্রাহকের তথ্য)</div>
                            <div class="customer-name">${customerName}</div>
                            <div style="font-size: 13px; color: #374151; margin-bottom: 3px;"><strong>Phone:</strong> ${phone}</div>
                            <div style="font-size: 13px; color: #374151; margin-bottom: 3px;"><strong>Address:</strong> ${addressText}</div>
                            <div style="font-size: 13px; color: #374151; margin-bottom: 3px;"><strong>City / Area:</strong> ${city}${postal}</div>
                            <div style="font-size: 12px; color: #059669; font-weight: 700; margin-top: 6px;">Zone: ${isInsideBarishal ? 'Barishal Metro (৳100)' : 'Outside Barishal (৳180)'}</div>
                        </div>
                        <div class="info-card">
                            <div class="info-title">Payment Information (পেমেন্ট তথ্য)</div>
                            <div style="font-size: 14px; font-weight: 800; color: #111827;">bKash Send Money</div>
                            <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">Merchant / Personal Account: <strong>01715020391</strong></div>
                            <div style="font-size: 13px; color: #db2777; font-weight: 800; margin-top: 6px;">TrxID: <span style="font-family: monospace;">${order.transactionId || 'Prepaid Verified'}</span></div>
                            <div style="margin-top: 8px; display: inline-block; background: #ecfdf5; color: #047857; font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 6px; border: 1px solid #a7f3d0;">✓ PAYMENT VERIFIED</div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Unit Price</th>
                                <th>Total (BDT)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items?.map(item => `
                                <tr>
                                    <td>
                                        <strong>${item.product?.name || 'Live Botanical Plant'}</strong>
                                        <div style="font-size: 11px; color: #6b7280;">Organic Nursery Conditioned</div>
                                    </td>
                                    <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
                                    <td style="text-align: right;">৳${Number(item.price).toLocaleString()}</td>
                                    <td>৳${Number(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            `).join('') || ''}
                        </tbody>
                    </table>

                    <div class="totals-section">
                        <table class="totals-table">
                            <tr>
                                <td style="color: #6b7280;">Plant Subtotal:</td>
                                <td style="text-align: right; font-weight: 700;">৳${subtotal.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="color: #6b7280;">Express Plant Courier:</td>
                                <td style="text-align: right; font-weight: 700;">৳${courierFee}</td>
                            </tr>
                            <tr>
                                <td style="color: #6b7280;">VAT / Tax (0%):</td>
                                <td style="text-align: right; font-weight: 700; color: #059669;">৳0.00 (No Hidden Charges)</td>
                            </tr>
                            <tr class="total-row">
                                <td>Grand Total Paid:</td>
                                <td style="text-align: right;">৳${total.toLocaleString()}</td>
                            </tr>
                        </table>
                    </div>

                    <div class="guarantee-box">
                        🌿 <strong>Green Petals Plant Guarantee & Care:</strong><br/>
                        • <strong>100% Viable Root Guarantee:</strong> Nurtured with organic compost; free replacement if damaged in transit.<br/>
                        • <strong>Moisture-Lock Protective Packaging:</strong> Mailers keep roots hydrated across all 64 districts.<br/>
                        • <strong>Personal Plant Care Helpline:</strong> Call proprietor Munnar Khanam at 01768686120 for any advice.
                    </div>

                    <div class="signature-section">
                        <div>
                            Delivering Healthy Live Plants Nationwide Across Bangladesh<br/>
                            <em>Green Petals Garden Centre • Barishal</em>
                        </div>
                        <div class="sign-box">
                            <div class="sign-line"></div>
                            <strong>Munnar Khanam</strong><br/>
                            Proprietor & Nursery Director
                        </div>
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); };
                </script>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    // Helper to download official PDF invoice from backend
    const downloadOrderInvoice = async (orderId) => {
        try {
            setIsDownloadingPDF(true);
            const token = userInfo?.token;
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/invoice`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: 'blob'
                }
            );
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `GreenPetals-Invoice-${orderId.slice(0, 8).toUpperCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showToast({ icon: 'success', title: 'ইনভয়েস PDF ডাউনলোড সফল হয়েছে!' });
        } catch (err) {
            console.error('Invoice download failed:', err);
            showError('ডাউনলোড ব্যর্থ', 'ইনভয়েস ডাউনলোড করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
        } finally {
            setIsDownloadingPDF(false);
        }
    };

    // Export orders to CSV with complete address for Courier Bulk Upload
    const exportToCSV = () => {
        const csvData = filteredOrders.map(order => {
            const addr = parseAddress(order.shippingAddress);
            return {
                'Order ID': order.id.slice(0, 8),
                'Customer Name': order.user?.name || 'N/A',
                'Phone': addr?.phone || order.user?.phone || 'N/A',
                'Address': `"${(addr?.address || '').replace(/"/g, '""')}"`,
                'City': addr?.city || 'Barishal',
                'Postal Code': addr?.postalCode || '',
                'Total (BDT)': order.total,
                'Payment Method': 'bKash Send Money',
                'bKash TrxID': order.transactionId || 'Prepaid',
                'Order Status': order.status,
                'Date': new Date(order.createdAt).toLocaleDateString('en-BD'),
                'Ordered Plants': `"${(order.items?.map(i => `${i.product?.name || 'Plant'} x${i.quantity}`).join('; ') || '').replace(/"/g, '""')}"`
            };
        });

        if (csvData.length === 0) return;

        const headers = Object.keys(csvData[0]).join(',');
        const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `green-petals-courier-orders-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Get low stock products
    const lowStockProducts = products?.filter(p => p.stock < 10) || [];

    // Filter orders based on selected timeframe
    const filteredAnalyticsOrders = (orders || []).filter(order => {
        if (analyticsTimeframe === 'ALL') return true;
        const orderDate = new Date(order.createdAt).getTime();
        const now = Date.now();
        if (analyticsTimeframe === 'TODAY') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            return orderDate >= startOfDay.getTime();
        }
        if (analyticsTimeframe === '7D') {
            return (now - orderDate) <= (7 * 24 * 60 * 60 * 1000);
        }
        if (analyticsTimeframe === '30D') {
            return (now - orderDate) <= (30 * 24 * 60 * 60 * 1000);
        }
        return true;
    });

    const validAnalyticsOrders = filteredAnalyticsOrders.filter(o => o.status !== 'CANCELLED');
    const totalAnalyticsRevenue = validAnalyticsOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const deliveredOrdersCount = filteredAnalyticsOrders.filter(o => o.status === 'DELIVERED').length;
    const pendingOrdersCount = filteredAnalyticsOrders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED', 'ON_THE_WAY'].includes(o.status)).length;
    const averageOrderValue = validAnalyticsOrders.length > 0 ? Math.round(totalAnalyticsRevenue / validAnalyticsOrders.length) : 0;

    const barishalAnalyticsCount = validAnalyticsOrders.filter(o => {
        const city = parseAddress(o.shippingAddress)?.city || '';
        return city.toLowerCase().includes('barishal') || city.toLowerCase().includes('বরিশাল');
    }).length;
    const outsideBarishalAnalyticsCount = validAnalyticsOrders.length - barishalAnalyticsCount;

    // Top Selling Plants Map
    const plantSalesMap = {};
    (orders || []).filter(o => o.status !== 'CANCELLED').forEach(order => {
        order.items?.forEach(item => {
            const pId = item.productId || item.product?.id || item.product?.name;
            if (!pId) return;
            if (!plantSalesMap[pId]) {
                plantSalesMap[pId] = {
                    id: pId,
                    name: item.product?.name || 'Botanical Plant',
                    image: item.product?.images?.[0] || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=100&auto=format&fit=crop&q=80',
                    category: item.product?.category?.name || 'Plant',
                    unitsSold: 0,
                    revenue: 0,
                    stock: item.product?.stock ?? 'N/A'
                };
            }
            plantSalesMap[pId].unitsSold += (item.quantity || 1);
            plantSalesMap[pId].revenue += (Number(item.price || 0) * (item.quantity || 1));
        });
    });
    const topSellingPlants = Object.values(plantSalesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Grouping for Revenue Trend Area Chart
    const trendMap = {};
    validAnalyticsOrders.forEach(order => {
        const d = new Date(order.createdAt);
        const key = analyticsTimeframe === 'TODAY'
            ? d.toLocaleTimeString('en-US', { hour: 'numeric' })
            : (analyticsTimeframe === '7D'
                ? d.toLocaleDateString('en-US', { weekday: 'short' })
                : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        if (!trendMap[key]) {
            trendMap[key] = { name: key, revenue: 0, orders: 0 };
        }
        trendMap[key].revenue += Number(order.total || 0);
        trendMap[key].orders += 1;
    });
    const trendData = Object.values(trendMap);


    return (
        <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3.5 sm:gap-4 mb-8 fade-in-up">
                    <img
                        src="/logo.png"
                        alt="Green Petals Garden Centre"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-lg ring-2 ring-emerald-500/30 bg-white flex-shrink-0"
                    />
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                                Green Petals <span className="text-gradient">Admin Center</span>
                            </h1>
                            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Garden Centre
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                            Nursery Inventory, Customer Orders & Express Nationwide Delivery Hub
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 sm:gap-4 mb-8 glass rounded-2xl p-1.5 sm:p-2 overflow-x-auto max-w-full fade-in-up delay-100 scrollbar-none">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-xs sm:text-sm whitespace-nowrap ${activeTab === 'analytics'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1.5 sm:mr-2" />
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-xs sm:text-sm whitespace-nowrap ${activeTab === 'products'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1.5 sm:mr-2" />
                        Products ({products?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-xs sm:text-sm whitespace-nowrap ${activeTab === 'orders'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1.5 sm:mr-2" />
                        Orders ({orders?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-xs sm:text-sm whitespace-nowrap ${activeTab === 'users'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <User className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1.5 sm:mr-2" />
                        Users ({users?.length || 0})
                    </button>
                </div>

                {/* Analytics Tab (Mobile View First & Desktop Optimized) */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6 fade-in-up delay-200">
                        {/* Analytics Header with Timeframe Pill Filters */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-100 shadow-sm">
                            <div>
                                <h2 className="text-lg sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                                    <span>Nursery Analytics & Live Operations</span>
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    লাইভ বিক্রয়, অর্ডার প্রবাহ ও কুরিয়ার ডেলিভারি পারফরম্যান্স
                                </p>
                            </div>

                            {/* Timeframe selector (Touch Friendly) */}
                            <div className="flex items-center gap-1.5 bg-gray-100/90 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
                                {[
                                    { key: 'ALL', label: 'All Time' },
                                    { key: '30D', label: '30 Days' },
                                    { key: '7D', label: '7 Days' },
                                    { key: 'TODAY', label: 'Today' }
                                ].map(tf => (
                                    <button
                                        key={tf.key}
                                        type="button"
                                        onClick={() => setAnalyticsTimeframe(tf.key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                            analyticsTimeframe === tf.key
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                                        }`}
                                    >
                                        {tf.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Top 4 Primary KPI Cards (Grid: 2 cols on mobile, 4 on desktop) */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {/* Revenue */}
                            <div className="glass rounded-2xl p-4 sm:p-6 border border-emerald-100 relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Revenue (মোট আয়)</p>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">
                                        ৳
                                    </div>
                                </div>
                                <p className="text-xl sm:text-3xl font-black text-emerald-800 tracking-tight">
                                    {formatCurrency(totalAnalyticsRevenue)}
                                </p>
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                        {validAnalyticsOrders.length} Paid Orders
                                    </span>
                                    <span className="text-[10px] text-gray-400">100% bKash</span>
                                </div>
                            </div>

                            {/* Total Orders */}
                            <div className="glass rounded-2xl p-4 sm:p-6 border border-teal-100 relative overflow-hidden bg-gradient-to-br from-teal-500/10 via-white to-emerald-500/5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Orders (অর্ডার)</p>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                                <p className="text-xl sm:text-3xl font-black text-teal-800 tracking-tight">
                                    {filteredAnalyticsOrders.length}
                                </p>
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] sm:text-xs font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                                        {deliveredOrdersCount} Delivered
                                    </span>
                                    <span className="text-[10px] text-gray-400">{pendingOrdersCount} Active</span>
                                </div>
                            </div>

                            {/* Average Order Value */}
                            <div className="glass rounded-2xl p-4 sm:p-6 border border-sky-100 relative overflow-hidden bg-gradient-to-br from-sky-500/10 via-white to-teal-500/5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Avg. Order (গড় টিকিট)</p>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
                                        <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                                <p className="text-xl sm:text-3xl font-black text-sky-900 tracking-tight">
                                    {formatCurrency(averageOrderValue)}
                                </p>
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] sm:text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                                        Per Plant Box
                                    </span>
                                </div>
                            </div>

                            {/* Products in Catalog */}
                            <div className="glass rounded-2xl p-4 sm:p-6 border border-amber-100 relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-white to-emerald-500/5 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-600">Live Plants (ক্যাটালগ)</p>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                                        <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                </div>
                                <p className="text-xl sm:text-3xl font-black text-amber-900 tracking-tight">
                                    {products?.length || 0}
                                </p>
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                    {lowStockProducts.length > 0 ? (
                                        <span className="text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                            ⚠️ {lowStockProducts.length} Low Stock
                                        </span>
                                    ) : (
                                        <span className="text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                            ✓ Healthy Stock
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Logistics & Payment Highlights (3 Highlights) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-md shadow-emerald-600/30">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900">100% bKash Send Money</p>
                                    <p className="text-[11px] text-gray-600">Personal: 01715020391 • 0% COD Fraud Risk</p>
                                </div>
                            </div>

                            <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-50/80 border border-teal-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-md shadow-teal-600/30">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900">Barishal Metro ({barishalAnalyticsCount} Orders)</p>
                                    <p className="text-[11px] text-gray-600">৳100 Courier Rate • 24–48h Plant Courier</p>
                                </div>
                            </div>

                            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-md shadow-emerald-700/30">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900">All 63 Other Districts ({outsideBarishalAnalyticsCount} Orders)</p>
                                    <p className="text-[11px] text-gray-600">৳180 Courier Rate • Moisture-Lock Boxes</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Pipeline Status Strip (Mobile Horizontal Scrollable) */}
                        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5">
                                Live Order Fulfillment Funnel (অর্ডার অগ্রগতি ধাপ)
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                                    <span className="text-xs text-amber-700 font-bold block">⏳ Pending</span>
                                    <span className="text-lg sm:text-xl font-black text-amber-900">
                                        {orders?.filter(o => o.status === 'PENDING').length || 0}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-center">
                                    <span className="text-xs text-sky-700 font-bold block">🔄 Processing</span>
                                    <span className="text-lg sm:text-xl font-black text-sky-900">
                                        {orders?.filter(o => o.status === 'PROCESSING').length || 0}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
                                    <span className="text-xs text-purple-700 font-bold block">🚚 In Transit</span>
                                    <span className="text-lg sm:text-xl font-black text-purple-900">
                                        {orders?.filter(o => ['SHIPPED', 'ON_THE_WAY'].includes(o.status)).length || 0}
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                                    <span className="text-xs text-emerald-700 font-bold block">✅ Delivered</span>
                                    <span className="text-lg sm:text-xl font-black text-emerald-900">
                                        {orders?.filter(o => o.status === 'DELIVERED').length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row (Mobile Optimized Height) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Revenue Growth Chart */}
                            <div className="glass rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-emerald-600" />
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Revenue & Sales Trend</h3>
                                    </div>
                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                        BDT (৳)
                                    </span>
                                </div>
                                <div className="w-full h-56 sm:h-72 min-w-0">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                                        <AreaChart data={trendData.length > 0 ? trendData : [{ name: 'No data', revenue: 0 }]}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.7} />
                                                    <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `৳${val}`} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    border: '1px solid #d1fae5',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                                                    fontSize: '12px'
                                                }}
                                                formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Revenue']}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Order Status Donut Chart */}
                            <div className="glass rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-teal-600" />
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Order Status Breakdown</h3>
                                    </div>
                                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                                        {orders?.length || 0} Total
                                    </span>
                                </div>
                                <div className="w-full h-56 sm:h-72 min-w-0">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                                        <RePieChart>
                                            <Pie
                                                data={(() => {
                                                    const statusCount = {};
                                                    (orders || []).forEach(order => {
                                                        statusCount[order.status] = (statusCount[order.status] || 0) + 1;
                                                    });
                                                    const colors = {
                                                        'PENDING': '#f59e0b',
                                                        'PROCESSING': '#0284c7',
                                                        'SHIPPED': '#7c3aed',
                                                        'ON_THE_WAY': '#0d9488',
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
                                                innerRadius={45}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {(() => {
                                                    const statusCount = {};
                                                    (orders || []).forEach(order => {
                                                        statusCount[order.status] = (statusCount[order.status] || 0) + 1;
                                                    });
                                                    const colors = {
                                                        'PENDING': '#f59e0b',
                                                        'PROCESSING': '#0284c7',
                                                        'SHIPPED': '#7c3aed',
                                                        'ON_THE_WAY': '#0d9488',
                                                        'DELIVERED': '#10b981',
                                                        'PAID': '#059669',
                                                        'CANCELLED': '#ef4444'
                                                    };
                                                    return Object.entries(statusCount).map(([status], index) => (
                                                        <Cell key={`cell-${index}`} fill={colors[status] || '#6b7280'} />
                                                    ));
                                                })()}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    fontSize: '12px'
                                                }}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Two Columns: Top Selling Botanical Plants + Nursery Low Stock Radar */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Top Selling Plants */}
                            <div className="glass rounded-2xl p-4 sm:p-6 border border-emerald-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-amber-500" />
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Top-Selling Botanical Plants</h3>
                                    </div>
                                    <span className="text-[11px] text-gray-500">By Revenue</span>
                                </div>

                                {topSellingPlants.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {topSellingPlants.map((plant, index) => (
                                            <div key={plant.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-gray-100 hover:border-emerald-200 transition-colors">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${
                                                        index === 0 ? 'bg-amber-100 text-amber-800' :
                                                        index === 1 ? 'bg-gray-200 text-gray-800' :
                                                        index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-emerald-50 text-emerald-800'
                                                    }`}>
                                                        #{index + 1}
                                                    </span>
                                                    <img
                                                        src={plant.image}
                                                        alt={plant.name}
                                                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-emerald-100"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{plant.name}</p>
                                                        <p className="text-[11px] text-gray-500">{plant.unitsSold} units sold • {plant.category}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <span className="font-black text-xs sm:text-sm text-emerald-700 block">
                                                        {formatCurrency(plant.revenue)}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">Stock: {plant.stock}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-xs">
                                        No sales recorded in this period yet.
                                    </div>
                                )}
                            </div>

                            {/* Nursery Low Stock Radar */}
                            <div className="glass rounded-2xl p-4 sm:p-6 border border-amber-100 shadow-sm bg-gradient-to-br from-amber-500/5 via-white to-orange-500/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-amber-600" />
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900">Nursery Stock Replenishment</h3>
                                    </div>
                                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                        {lowStockProducts.length} Needs Attention
                                    </span>
                                </div>

                                {lowStockProducts.length > 0 ? (
                                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                                        {lowStockProducts.map(p => (
                                            <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <img
                                                        src={p.images?.[0] || 'https://via.placeholder.com/50'}
                                                        alt={p.name}
                                                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{p.name}</p>
                                                        <p className="text-[11px] text-gray-500">{formatCurrency(p.price)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                                        p.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleEditProduct(p);
                                                            setActiveTab('products');
                                                        }}
                                                        className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                                                    >
                                                        + Restock
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-emerald-700 text-xs font-semibold">
                                        🌿 All nursery plants have healthy stock levels (&gt;10 units)!
                                    </div>
                                )}
                            </div>
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
                                {/* Mobile Order Cards View (Optimized for Phones & Delivery) */}
                                <div className="block lg:hidden space-y-3.5">
                                    {filteredOrders.length === 0 ? (
                                        <div className="glass p-8 text-center text-gray-500 rounded-2xl">
                                            No orders match your filter criteria.
                                        </div>
                                    ) : (
                                        filteredOrders.map((order) => {
                                            const addr = parseAddress(order.shippingAddress);
                                            const phone = addr?.phone || order.user?.phone;
                                            const city = addr?.city || 'Barishal';
                                            const isInsideBarishal = city.toLowerCase().includes('barishal') || city.toLowerCase().includes('বরিশাল');
                                            return (
                                                <div key={order.id} className="glass p-4 rounded-2xl border-2 border-emerald-100 shadow-sm bg-white/95 space-y-3">
                                                    {/* Card Header: ID, Date, Status */}
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
                                                            <span className="font-mono font-bold text-xs text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                                #{order.id.slice(0, 8)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] text-gray-500 font-medium">
                                                                {new Date(order.createdAt).toLocaleDateString('en-BD')}
                                                            </span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                                order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                                                                order.status === 'SHIPPED' ? 'bg-teal-100 text-teal-800' :
                                                                order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                                'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Customer & Total */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <User className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                                <span className="font-bold text-sm text-gray-900">{order.user?.name || 'Customer'}</span>
                                                            </div>
                                                            {phone ? (
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <a
                                                                        href={`tel:${phone}`}
                                                                        className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold hover:underline"
                                                                    >
                                                                        <Phone className="w-3 h-3 text-emerald-600" />
                                                                        <span>{phone}</span>
                                                                    </a>
                                                                    <a
                                                                        href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-semibold"
                                                                    >
                                                                        WhatsApp
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">No phone provided</span>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-base font-extrabold text-emerald-800 font-mono block">
                                                                {formatCurrency(order.total)}
                                                            </span>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-pink-100 text-[#E2136E]">
                                                                bKash
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Customer Delivery Address Box */}
                                                    <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200/90 space-y-2">
                                                        <div className="flex items-start gap-1.5">
                                                            <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                                                            <div className="min-w-0 flex-1">
                                                                <span className="text-[10px] uppercase font-bold text-emerald-900 tracking-wider block">
                                                                    Delivery Address (ডেলিভারি ঠিকানা):
                                                                </span>
                                                                <p className="text-xs font-semibold text-gray-900 leading-snug break-words">
                                                                    {addr?.address || 'Address not provided'}
                                                                </p>
                                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-700">
                                                                    <span>🏙️ <strong>{city}</strong> {addr?.postalCode ? `(${addr.postalCode})` : ''}</span>
                                                                    <span>•</span>
                                                                    <span className="font-bold text-emerald-800">
                                                                        {isInsideBarishal ? 'Barishal Metro (৳100)' : 'Outside Barishal (৳180)'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* 1-Click Copy Courier Slip */}
                                                        <button
                                                            type="button"
                                                            onClick={() => copyCourierAddress(order)}
                                                            className="w-full py-1.5 px-3 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                                                        >
                                                            {copiedOrderId === order.id ? (
                                                                <>
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                                    <span>কুরিয়ার ঠিকানা কপি হয়েছে!</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3.5 h-3.5 text-emerald-600" />
                                                                    <span>কুরিয়ার ঠিকানা কপি করুন (Copy for Courier)</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Plant Items Preview */}
                                                    {order.items && order.items.length > 0 && (
                                                        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                                                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">
                                                                Live Plants ({order.items.length}):
                                                            </span>
                                                            <div className="space-y-1">
                                                                {order.items.slice(0, 3).map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center text-gray-700">
                                                                        <span className="truncate max-w-[200px]">🌿 {item.product?.name || 'Plant'}</span>
                                                                        <span className="font-bold text-gray-900">x{item.quantity}</span>
                                                                    </div>
                                                                ))}
                                                                {order.items.length > 3 && (
                                                                    <span className="text-[11px] text-emerald-700 font-semibold italic block">
                                                                        + {order.items.length - 3} more items
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* bKash TrxID */}
                                                    {order.transactionId && (
                                                        <div className="bg-pink-50/70 p-2 rounded-xl text-xs flex justify-between items-center border border-pink-200">
                                                            <span className="text-gray-600 font-medium">bKash TrxID:</span>
                                                            <span className="font-mono font-bold text-[#E2136E] uppercase">{order.transactionId}</span>
                                                        </div>
                                                    )}

                                                    {/* Actions & Status */}
                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                                                        <div className="flex-1 min-w-[120px]">
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => {
                                                                    const newStatus = e.target.value;
                                                                    if (newStatus === 'CANCELLED') {
                                                                        handleCancelOrder(order.id);
                                                                    } else {
                                                                        dispatch(updateOrderStatus({ id: order.id, status: newStatus }));
                                                                        showToast({ icon: 'success', title: `Status: ${newStatus}` });
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
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setViewingOrder(order);
                                                                    setOrderModalView('invoice');
                                                                }}
                                                                className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-1 font-bold text-xs"
                                                                title="Official Customer Invoice (চালান)"
                                                            >
                                                                <FileText className="w-4 h-4 text-blue-600" />
                                                                <span className="text-[11px]">Invoice</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setViewingOrder(order);
                                                                    setOrderModalView('slip');
                                                                }}
                                                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => printDeliverySlip(order)}
                                                                className="p-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl transition-all"
                                                                title="Print Packing Slip"
                                                            >
                                                                <Printer className="w-4 h-4" />
                                                            </button>
                                                            {order.status !== 'CANCELLED' ? (
                                                                <button
                                                                    onClick={() => handleCancelOrder(order.id)}
                                                                    className="px-2.5 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        dispatch(updateOrderStatus({ id: order.id, status: 'PROCESSING' }));
                                                                        showToast({ icon: 'success', title: 'Order Reactivated' });
                                                                    }}
                                                                    className="px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-bold"
                                                                >
                                                                    Reactivate
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Desktop View Table with Customer Address Column */}
                                <div className="hidden lg:block glass rounded-2xl overflow-hidden shadow-lg border border-emerald-100">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs sm:text-sm">
                                            <thead className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white">
                                                <tr>
                                                    <th className="px-4 py-3.5 font-semibold">
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
                                                            className="w-4 h-4 rounded"
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3.5 font-semibold">Order</th>
                                                    <th className="px-4 py-3.5 font-semibold">Customer & Contact</th>
                                                    <th className="px-4 py-3.5 font-semibold min-w-[240px]">Delivery Address (ঠিকানা)</th>
                                                    <th className="px-4 py-3.5 font-semibold">Zone</th>
                                                    <th className="px-4 py-3.5 font-semibold">Total & bKash</th>
                                                    <th className="px-4 py-3.5 font-semibold">Status</th>
                                                    <th className="px-4 py-3.5 font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white/90">
                                                {filteredOrders.map((order) => {
                                                    const addr = parseAddress(order.shippingAddress);
                                                    const phone = addr?.phone || order.user?.phone;
                                                    const city = addr?.city || 'Barishal';
                                                    const isInsideBarishal = city.toLowerCase().includes('barishal') || city.toLowerCase().includes('বরিশাল');
                                                    return (
                                                        <tr key={order.id} className="hover:bg-emerald-50/40 transition-colors">
                                                            <td className="px-4 py-3">
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
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="font-mono font-bold text-emerald-950 block">#{order.id.slice(0, 8)}</span>
                                                                <span className="text-[11px] text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-BD')}</span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="font-bold text-gray-900 block">{order.user ? order.user.name : 'Customer'}</span>
                                                                {phone ? (
                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <a href={`tel:${phone}`} className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                                                                            <Phone className="w-3 h-3 text-emerald-600" />
                                                                            <span>{phone}</span>
                                                                        </a>
                                                                        <a
                                                                            href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-[10px] bg-green-100 text-green-800 px-1 py-0.2 rounded font-semibold"
                                                                            title="Chat on WhatsApp"
                                                                        >
                                                                            WA
                                                                        </a>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">No phone</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100/80 space-y-1">
                                                                    <div className="flex items-start gap-1">
                                                                        <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 mt-0.5" />
                                                                        <span className="text-xs text-gray-800 font-medium leading-snug line-clamp-2">
                                                                            {addr?.address || 'Address not specified'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between text-[11px] text-gray-600 pt-0.5">
                                                                        <span>{city} {addr?.postalCode ? `(${addr.postalCode})` : ''}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => copyCourierAddress(order)}
                                                                            className="text-[10px] bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold px-2 py-0.5 rounded flex items-center gap-1 transition-all"
                                                                            title="Copy delivery address for courier software"
                                                                        >
                                                                            {copiedOrderId === order.id ? (
                                                                                <>
                                                                                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                                                                                    <span>Copied!</span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Copy className="w-2.5 h-2.5 text-emerald-600" />
                                                                                    <span>Copy</span>
                                                                                </>
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${
                                                                    isInsideBarishal ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                                                                }`}>
                                                                    {isInsideBarishal ? 'Barishal (৳100)' : 'Outside (৳180)'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="font-extrabold text-emerald-800 text-sm block">{formatCurrency(order.total)}</span>
                                                                {order.transactionId ? (
                                                                    <span className="font-mono text-[11px] bg-pink-50 text-[#E2136E] px-1.5 py-0.5 rounded border border-pink-200 font-bold block truncate max-w-[120px]" title={`bKash TrxID: ${order.transactionId}`}>
                                                                        {order.transactionId}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[11px] text-gray-400">Prepaid bKash</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <select
                                                                    value={order.status}
                                                                    onChange={(e) => {
                                                                        const newStatus = e.target.value;
                                                                        if (newStatus === 'CANCELLED') {
                                                                            handleCancelOrder(order.id);
                                                                        } else {
                                                                            dispatch(updateOrderStatus({ id: order.id, status: newStatus }));
                                                                            showToast({ icon: 'success', title: `Status: ${newStatus}` });
                                                                        }
                                                                    }}
                                                                    className="text-xs font-bold p-1.5 rounded-lg border border-gray-300 bg-white"
                                                                >
                                                                    <option value="PENDING">PENDING</option>
                                                                    <option value="PROCESSING">PROCESSING</option>
                                                                    <option value="SHIPPED">SHIPPED</option>
                                                                    <option value="ON_THE_WAY">ON THE WAY</option>
                                                                    <option value="DELIVERED">DELIVERED</option>
                                                                    <option value="PAID">PAID</option>
                                                                    <option value="CANCELLED">CANCELLED</option>
                                                                </select>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setViewingOrder(order);
                                                                            setOrderModalView('invoice');
                                                                        }}
                                                                        className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 font-bold text-xs"
                                                                        title="View & Print Official Customer Invoice (চালান)"
                                                                    >
                                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                                        <span>Invoice</span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setViewingOrder(order);
                                                                            setOrderModalView('slip');
                                                                        }}
                                                                        className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                                                        title="View Order Details & Delivery Slip"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => printDeliverySlip(order)}
                                                                        className="p-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                                                                        title="Print Packing Slip"
                                                                    >
                                                                        <Printer className="w-4 h-4" />
                                                                    </button>
                                                                    {order.status !== 'CANCELLED' ? (
                                                                        <button
                                                                            onClick={() => handleCancelOrder(order.id)}
                                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                            title="Cancel Order"
                                                                        >
                                                                            <XCircle className="w-4 h-4" />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => {
                                                                                dispatch(updateOrderStatus({ id: order.id, status: 'PROCESSING' }));
                                                                                showToast({ icon: 'success', title: 'Order Reactivated' });
                                                                            }}
                                                                            className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-bold hover:bg-emerald-100"
                                                                        >
                                                                            Reactivate
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Order Details, Official Invoice & Delivery Packing Slip Modal */}
                                {viewingOrder && (
                                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
                                        <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-scale-in max-h-[94vh] flex flex-col">
                                            {/* Modal Header with View Switcher */}
                                            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-3.5 sm:p-5 flex-shrink-0">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                        <img src="/logo.png" alt="Green Petals" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/50 bg-white flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h3 className="text-sm sm:text-lg font-bold truncate">Green Petals Admin Hub</h3>
                                                                <span className="font-mono text-[11px] sm:text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                                                                    #{viewingOrder.id.slice(0, 8).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] sm:text-xs text-emerald-100 truncate">Garden Centre • Barishal, Bangladesh</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setViewingOrder(null)}
                                                        className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* View Switcher Pills */}
                                                <div className="mt-3 pt-3 border-t border-white/15 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOrderModalView('invoice')}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                            orderModalView === 'invoice'
                                                                ? 'bg-white text-emerald-900 shadow-md'
                                                                : 'bg-white/15 text-white hover:bg-white/25'
                                                        }`}
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        <span>Official Invoice (চালান)</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOrderModalView('slip')}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                            orderModalView === 'slip'
                                                                ? 'bg-white text-emerald-900 shadow-md'
                                                                : 'bg-white/15 text-white hover:bg-white/25'
                                                        }`}
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                        <span>Courier Box Slip (ডেলিভারি স্লিপ)</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Modal Body */}
                                            <div className="p-3 sm:p-6 overflow-y-auto space-y-4">
                                                {/* ================= INVOICE VIEW ================= */}
                                                {orderModalView === 'invoice' && (() => {
                                                    const addr = parseAddress(viewingOrder.shippingAddress);
                                                    const phone = addr?.phone || viewingOrder.user?.phone || 'N/A';
                                                    const city = addr?.city || 'Barishal';
                                                    const isInsideBarishal = city.toLowerCase().includes('barishal') || city.toLowerCase().includes('বরিশাল');
                                                    const courierFee = isInsideBarishal ? 100 : 180;
                                                    const subtotal = viewingOrder.items?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0;
                                                    const invoiceDate = new Date(viewingOrder.createdAt).toLocaleDateString('en-BD', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    });

                                                    return (
                                                        <div className="space-y-4">
                                                            {/* Printable Invoice Sheet Card */}
                                                            <div className="bg-white border-2 border-emerald-100 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
                                                                {/* Invoice Header */}
                                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-emerald-600">
                                                                    <div className="flex items-center gap-3">
                                                                        <img src="/logo.png" alt="Green Petals" className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600 bg-white flex-shrink-0" />
                                                                        <div>
                                                                            <h2 className="text-xl sm:text-2xl font-black text-emerald-900 tracking-tight">Green Petals</h2>
                                                                            <p className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase">Garden Centre • Botanical Boutique</p>
                                                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                                                📍 Barishal Metro, Bangladesh • 📞 01768686120
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="sm:text-right bg-emerald-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                                                                        <span className="inline-block bg-emerald-100 text-emerald-900 font-black text-xs sm:text-sm px-3 py-1 rounded-lg border border-emerald-200">
                                                                            OFFICIAL INVOICE
                                                                        </span>
                                                                        <div className="text-xs text-gray-600 mt-1.5 space-y-0.5">
                                                                            <p><strong>Invoice #:</strong> INV-{viewingOrder.id.slice(0, 8).toUpperCase()}</p>
                                                                            <p><strong>Date:</strong> {invoiceDate}</p>
                                                                            <p><strong>Status:</strong> <span className="font-bold text-emerald-700">{viewingOrder.status}</span></p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Billed To & Payment Meta */}
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                                                                        <p className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">Billed & Shipped To (গ্রাহক)</p>
                                                                        <p className="font-bold text-gray-900 text-sm">{viewingOrder.user?.name || 'Valued Customer'}</p>
                                                                        <div className="flex items-center gap-2 text-gray-700">
                                                                            <span>📞 {phone}</span>
                                                                            {phone && phone !== 'N/A' && (
                                                                                <a
                                                                                    href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded"
                                                                                >
                                                                                    WhatsApp
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-gray-700">📍 {addr?.address || 'Address N/A'}</p>
                                                                        <p className="text-gray-700">🏙️ {city} {addr?.postalCode ? `(${addr.postalCode})` : ''}</p>
                                                                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                            isInsideBarishal ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                                                                        }`}>
                                                                            Zone: {isInsideBarishal ? 'Barishal Metro (৳100)' : 'Outside Barishal (৳180)'}
                                                                        </span>
                                                                    </div>

                                                                    <div className="p-3.5 rounded-xl bg-pink-50/50 border border-pink-200 space-y-1">
                                                                        <p className="text-[10px] font-extrabold uppercase text-[#E2136E] tracking-wider">Payment Method (পেমেন্ট)</p>
                                                                        <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                                                                            <span>bKash Send Money</span>
                                                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">✓ Paid</span>
                                                                        </p>
                                                                        <p className="text-gray-600">bKash Account: <strong>01715020391</strong></p>
                                                                        <p className="text-gray-700">
                                                                            TrxID: <span className="font-mono font-bold text-[#E2136E] bg-pink-100 px-1.5 py-0.5 rounded">{viewingOrder.transactionId || 'Prepaid Verified'}</span>
                                                                        </p>
                                                                        <p className="text-[10px] text-gray-500 pt-1">
                                                                            Proprietor: Munnar Khanam (01768686120)
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Itemized Table */}
                                                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                                    <table className="w-full text-left text-xs">
                                                                        <thead className="bg-emerald-700 text-white font-bold">
                                                                            <tr>
                                                                                <th className="p-2.5">Live Plant Item</th>
                                                                                <th className="p-2.5 text-center">Qty</th>
                                                                                <th className="p-2.5 text-right">Unit Price</th>
                                                                                <th className="p-2.5 text-right">Total</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-100">
                                                                            {viewingOrder.items?.map((item, idx) => (
                                                                                <tr key={idx} className="hover:bg-gray-50/80">
                                                                                    <td className="p-2.5">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <img
                                                                                                src={item.product?.images?.[0] || 'https://via.placeholder.com/40'}
                                                                                                alt={item.product?.name}
                                                                                                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                                                                            />
                                                                                            <div>
                                                                                                <p className="font-bold text-gray-900">{item.product?.name || 'Plant'}</p>
                                                                                                <p className="text-[10px] text-gray-400">Botanical Nursery Stock</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="p-2.5 text-center font-bold text-gray-800">{item.quantity}</td>
                                                                                    <td className="p-2.5 text-right text-gray-600">{formatCurrency(item.price)}</td>
                                                                                    <td className="p-2.5 text-right font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                                {/* Financial Totals Breakdown */}
                                                                <div className="flex justify-end">
                                                                    <div className="w-full sm:w-72 space-y-1.5 text-xs bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                                                                        <div className="flex justify-between text-gray-600">
                                                                            <span>Plant Subtotal:</span>
                                                                            <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-gray-600">
                                                                            <span>Courier & Packaging:</span>
                                                                            <span className="font-semibold">{formatCurrency(courierFee)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-gray-600">
                                                                            <span>Tax / VAT (0%):</span>
                                                                            <span className="font-semibold text-emerald-700">৳0.00 (0% VAT)</span>
                                                                        </div>
                                                                        <div className="pt-2 border-t border-emerald-300 flex justify-between font-black text-sm text-emerald-900">
                                                                            <span>Grand Total Paid:</span>
                                                                            <span className="text-base text-emerald-800">{formatCurrency(viewingOrder.total)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Botanical Guarantee Notice */}
                                                                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                                                                    <Sprout className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <strong>100% Viable Root Guarantee:</strong> Nurtured with organic compost; free replacement if damaged in transit.
                                                                        Moisture-locked mailers keep roots hydrated across all 64 districts.
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Invoice Actions Bar */}
                                                            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => printOfficialInvoice(viewingOrder)}
                                                                        className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md"
                                                                    >
                                                                        <Printer className="w-4 h-4" />
                                                                        <span>Print Invoice (প্রিন্ট চালান)</span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={isDownloadingPDF}
                                                                        onClick={() => downloadOrderInvoice(viewingOrder.id)}
                                                                        className="btn-glass text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 border border-emerald-200"
                                                                    >
                                                                        <Download className="w-4 h-4 text-emerald-700" />
                                                                        <span>{isDownloadingPDF ? 'Downloading...' : 'PDF Download'}</span>
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => copyCourierAddress(viewingOrder)}
                                                                    className="btn-glass text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
                                                                >
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                    <span>Copy Delivery Address</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* ================= COURIER PACKING SLIP VIEW ================= */}
                                                {orderModalView === 'slip' && (() => {
                                                    const addr = parseAddress(viewingOrder.shippingAddress);
                                                    const phone = addr?.phone || viewingOrder.user?.phone;
                                                    const city = addr?.city || 'Barishal';
                                                    const isInsideBarishal = city.toLowerCase().includes('barishal') || city.toLowerCase().includes('বরিশাল');
                                                    return (
                                                        <div className="space-y-4">
                                                            {/* Recipient Address Card */}
                                                            <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-200 space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin className="w-5 h-5 text-emerald-700" />
                                                                        <h4 className="font-bold text-sm sm:text-base text-gray-900">Customer Delivery Address (প্রাপকের ঠিকানা)</h4>
                                                                    </div>
                                                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                                                        isInsideBarishal ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                                                                    }`}>
                                                                        {isInsideBarishal ? 'Barishal Metro (৳100)' : 'Outside Barishal (৳180)'}
                                                                    </span>
                                                                </div>

                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                                                                    <div>
                                                                        <span className="text-gray-500 block text-xs font-semibold">Customer Name:</span>
                                                                        <span className="font-bold text-gray-900 text-base">{viewingOrder.user?.name || 'Customer'}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 block text-xs font-semibold">Contact Phone:</span>
                                                                        <div className="flex items-center gap-3">
                                                                            <a href={`tel:${phone}`} className="font-bold text-emerald-700 hover:underline flex items-center gap-1">
                                                                                <Phone className="w-3.5 h-3.5" />
                                                                                <span>{phone || 'N/A'}</span>
                                                                            </a>
                                                                            {phone && (
                                                                                <a
                                                                                    href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="text-xs text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded hover:underline"
                                                                                >
                                                                                    WhatsApp
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="sm:col-span-2">
                                                                        <span className="text-gray-500 block text-xs font-semibold">Detailed Street Address:</span>
                                                                        <p className="font-bold text-gray-900 text-sm mt-0.5">{addr?.address || 'N/A'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 block text-xs font-semibold">City / District:</span>
                                                                        <span className="font-bold text-gray-900">{city}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 block text-xs font-semibold">Postal Code:</span>
                                                                        <span className="font-bold text-gray-900">{addr?.postalCode || 'N/A'}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="pt-2 border-t border-emerald-200/70 flex flex-wrap gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => copyCourierAddress(viewingOrder)}
                                                                        className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow"
                                                                    >
                                                                        <Copy className="w-3.5 h-3.5" />
                                                                        <span>Copy for Courier (Pathao / Steadfast)</span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => printDeliverySlip(viewingOrder)}
                                                                        className="btn-glass text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5"
                                                                    >
                                                                        <Printer className="w-3.5 h-3.5" />
                                                                        <span>Print Box Packing Slip</span>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Items in Order */}
                                                            <div>
                                                                <h4 className="font-bold text-sm text-gray-900 mb-2">Live Plants in Parcel</h4>
                                                                <div className="space-y-2 border border-gray-100 rounded-2xl p-3 bg-gray-50/70 max-h-56 overflow-y-auto">
                                                                    {viewingOrder.items?.map((item, index) => (
                                                                        <div key={index} className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-gray-100">
                                                                            <div className="flex items-center gap-3 min-w-0">
                                                                                <img
                                                                                    src={item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                                                                                    alt={item.product?.name}
                                                                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                                                                />
                                                                                <div className="min-w-0">
                                                                                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.product?.name || 'Plant'}</p>
                                                                                    <p className="text-[11px] text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                                                                                </div>
                                                                            </div>
                                                                            <span className="font-bold text-xs sm:text-sm text-gray-900">
                                                                                {formatCurrency(item.price * item.quantity)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Financial & Status Summary */}
                                                            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-3">
                                                                <div>
                                                                    <span className="text-[11px] text-gray-500 block">Total Amount</span>
                                                                    <span className="text-xl sm:text-2xl font-black text-emerald-800">{formatCurrency(viewingOrder.total)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[11px] text-gray-500 block">bKash Transaction ID</span>
                                                                    <span className="font-mono font-bold text-xs sm:text-sm bg-pink-100 text-[#E2136E] px-2.5 py-1 rounded-lg">
                                                                        {viewingOrder.transactionId || 'Prepaid'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[11px] text-gray-500 block">Order Status</span>
                                                                    <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">
                                                                        {viewingOrder.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
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
