import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';
import { Star } from 'lucide-react';
import StarRating from './StarRating';

const RelatedProducts = ({ categoryId, currentProductId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!categoryId) return;
            try {
                // Fetch products by category
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products?category=${categoryId}&pageNumber=1`);

                // Filter out current product and take top 4
                const related = data.products
                    .filter(p => p.id !== currentProductId)
                    .slice(0, 4);

                setProducts(related);
            } catch (error) {
                console.error('Failed to fetch related products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelated();
    }, [categoryId, currentProductId]);

    if (loading || products.length === 0) return null;

    return (
        <div className="glass rounded-3xl p-4 sm:p-6 lg:p-8 fade-in-up delay-200 mt-10 sm:mt-14 border border-emerald-100/80">
            <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
                <div>
                    <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                        You May Also Like
                    </h2>
                    <p className="text-[11px] sm:text-xs text-emerald-800 font-medium">আপনার পছন্দের সাথে মানানসই আরও কিছু জীবন্ত চারা</p>
                </div>
                <Link to="/products" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 flex-shrink-0">
                    View All ↗
                </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {products.map((product) => (
                    <Link key={product.id} to={`/product/${product.id}`} className="group flex flex-col">
                        <div className="glass rounded-2xl overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300 h-full flex flex-col bg-white/80 border border-emerald-50">
                            <div className="aspect-square bg-gray-100 overflow-hidden relative">
                                <img
                                    src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=500&auto=format&fit=crop&q=80'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                />
                                {product.discount > 0 && (
                                    <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow">
                                        -{product.discount}%
                                    </span>
                                )}
                            </div>
                            <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-700 line-clamp-1 transition-colors">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-1 my-1">
                                        <StarRating rating={4.5} size={11} />
                                    </div>
                                </div>
                                <p className="font-extrabold text-sm sm:text-base text-gradient mt-1">
                                    {formatCurrency(product.price)}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
