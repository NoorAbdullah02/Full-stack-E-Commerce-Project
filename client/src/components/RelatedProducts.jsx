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
        <div className="glass rounded-3xl p-8 fade-in-up delay-200 mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <Link key={product.id} to={`/product/${product.id}`} className="group">
                        <div className="glass rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                            <div className="aspect-square bg-gray-100 overflow-hidden relative">
                                <img
                                    src={product.images?.[0] || product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 truncate transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-1 my-1">
                                    <StarRating rating={4.5} size={12} />
                                </div>
                                <p className="font-bold text-gradient">{formatCurrency(product.price)}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
