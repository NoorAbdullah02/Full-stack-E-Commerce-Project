import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist } from '../redux/slices/wishlistSlice';
import { useNavigate } from 'react-router-dom';
import Newsletter from '../components/Newsletter';
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck, Clock, Sparkles, Shield, Heart, ShoppingCart, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading, error } = useSelector((state) => state.product);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    useEffect(() => {
        dispatch(listProducts());
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        setRecentlyViewed(viewed);
    }, [dispatch]);

    const handleQuickView = (product, e) => {
        e.preventDefault();
        setQuickViewProduct(product);
    };

    const handleAddToCart = (product, e) => {
        e.preventDefault();
        dispatch(addToCart({ productId: product.id, qty: 1 }));
    };

    const handleAddToWishlist = (product, e) => {
        e.preventDefault();
        dispatch(addToWishlist(product.id));
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white pt-32 pb-20">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-0 -right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob delay-200"></div>
                    <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob delay-300"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 animate-fade-in">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Welcome to the Future of Shopping</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-bold mb-6 animate-slide-up leading-tight">
                        Discover Amazing
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-pink-200">
                            Products
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl mb-10 text-indigo-100 max-w-3xl mx-auto animate-slide-up delay-100 px-4">
                        Shop the latest trends with AI-powered recommendations and unbeatable prices
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
                        <a href="#products" className="inline-flex items-center justify-center bg-white text-indigo-600 font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Shop Now
                        </a>
                        <a href="#features" className="inline-flex items-center justify-center glass text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-xl hover:bg-white/20 transition-all duration-300">
                            Learn More
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card-glass text-center group hover-lift">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                <Truck className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
                            <p className="text-gray-600">On all orders over ৳5000</p>
                        </div>

                        <div className="card-glass text-center group hover-lift">
                            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
                            <p className="text-gray-600">100% secure transactions</p>
                        </div>

                        <div className="card-glass text-center group hover-lift">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Best Prices</h3>
                            <p className="text-gray-600">Competitive pricing guaranteed</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Featured <span className="text-gradient">Products</span>
                    </h2>
                    <p className="text-gray-600 text-lg">Check out our latest collection of amazing products</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="card-glass h-96 animate-pulse">
                                <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="glass border border-red-200 text-red-600 px-6 py-4 rounded-2xl inline-block">
                            <p className="font-semibold">{error}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product, index) => (
                            <div key={product.id} className="card-glass group hover:border-indigo-200 fade-in-up relative" style={{ animationDelay: `${index * 100}ms` }}>
                                <Link to={`/product/${product.id}`} className="block">
                                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl mb-4 overflow-hidden relative">
                                        <img src={product.images?.[0] || 'https://via.placeholder.com/400'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        {product.discount > 0 && (
                                            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                -{product.discount}%
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button onClick={(e) => handleAddToWishlist(product, e)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-pink-50 hover:text-pink-600 transition-colors" title="Add to Wishlist">
                                                <Heart className="w-5 h-5" />
                                            </button>
                                            <button onClick={(e) => handleQuickView(product, e)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Quick View">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">{product.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-2xl font-bold text-gradient">{formatCurrency(product.price)}</span>
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <span className="text-sm text-gray-400 line-through ml-2">{formatCurrency(product.originalPrice)}</span>
                                                )}
                                            </div>
                                            <span className="badge badge-primary">{product.category?.name || 'Product'}</span>
                                        </div>
                                        {product.stock > 0 ? (
                                            <p className="text-sm text-green-600 font-medium">In Stock ({product.stock})</p>
                                        ) : (
                                            <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                                        )}
                                    </div>
                                </Link>
                                <button onClick={(e) => handleAddToCart(product, e)} disabled={product.stock === 0} className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-20">
                        <div className="glass px-6 py-8 sm:px-8 sm:py-12 rounded-3xl inline-block">
                            <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Yet</h3>
                            <p className="text-gray-600">Check back soon for amazing products!</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h2 className="text-3xl font-bold mb-8">Recently <span className="text-gradient">Viewed</span></h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {recentlyViewed.slice(0, 6).map((product) => (
                            <Link key={product.id} to={`/product/${product.id}`} className="card-glass p-3 hover:border-indigo-200">
                                <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-full aspect-square object-cover rounded-lg mb-2" />
                                <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                                <p className="text-sm font-bold text-gradient">{formatCurrency(product.price)}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Quick View Modal */}
            {quickViewProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
                    <div className="glass p-8 rounded-3xl w-full max-w-4xl relative animate-scale-in max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setQuickViewProduct(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full">
                            <X className="w-6 h-6" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <img src={quickViewProduct.images?.[0] || 'https://via.placeholder.com/400'} alt={quickViewProduct.name} className="w-full rounded-2xl" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-4">{quickViewProduct.name}</h2>
                                <div className="flex items-baseline gap-3 mb-4">
                                    <span className="text-4xl font-bold text-gradient">{formatCurrency(quickViewProduct.price)}</span>
                                    {quickViewProduct.originalPrice && quickViewProduct.originalPrice > quickViewProduct.price && (
                                        <span className="text-xl text-gray-400 line-through">{formatCurrency(quickViewProduct.originalPrice)}</span>
                                    )}
                                </div>
                                <p className="text-gray-700 mb-6">{quickViewProduct.description}</p>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Category:</span>
                                        <span className="badge badge-primary">{quickViewProduct.category?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">Stock:</span>
                                        {quickViewProduct.stock > 0 ? (
                                            <span className="text-green-600 font-medium">{quickViewProduct.stock} available</span>
                                        ) : (
                                            <span className="text-red-600 font-medium">Out of Stock</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => { handleAddToCart(quickViewProduct, { preventDefault: () => { } }); setQuickViewProduct(null); }} disabled={quickViewProduct.stock === 0} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                                    </button>
                                    <button onClick={() => navigate(`/product/${quickViewProduct.id}`)} className="btn-secondary flex items-center gap-2">
                                        View Details <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Newsletter />
        </div>
    );
};

export default Home;
