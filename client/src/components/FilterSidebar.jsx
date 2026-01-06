import { useState, useEffect } from 'react';
import axios from 'axios';
import { SlidersHorizontal, Grid, DollarSign, Star, X } from 'lucide-react';
import StarRating from './StarRating';

const FilterSidebar = ({ filters, setFilters, className = '' }) => {
    const [categories, setCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/categories`);
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (categoryId) => {
        setFilters(prev => ({
            ...prev,
            category: prev.category === categoryId ? '' : categoryId,
            pageNumber: 1
        }));
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setPriceRange(prev => ({ ...prev, [name]: value }));
    };

    const applyPriceFilter = () => {
        setFilters(prev => ({
            ...prev,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
            pageNumber: 1
        }));
    };

    const handleSortChange = (e) => {
        setFilters(prev => ({
            ...prev,
            sort: e.target.value,
            pageNumber: 1
        }));
    };

    const clearFilters = () => {
        setFilters({
            keyword: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            sort: '',
            pageNumber: 1
        });
        setPriceRange({ min: '', max: '' });
    };

    return (
        <div className={`glass rounded-3xl p-6 space-y-8 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                    Filters
                </h3>
                {Object.values(filters).some(val => val && val !== 1) && (
                    <button
                        onClick={clearFilters}
                        className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                    >
                        <X className="w-3 h-3" /> Clear All
                    </button>
                )}
            </div>

            {/* Sort */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Sort By</label>
                <select
                    value={filters.sort || ''}
                    onChange={handleSortChange}
                    className="w-full h-12 px-4 rounded-xl glass border border-white/20 bg-white/50 focus:border-indigo-500 outline-none text-sm"
                >
                    <option value="">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                </select>
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Grid className="w-4 h-4" /> Categories
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${filters.category === cat.id
                                    ? 'bg-indigo-600 border-indigo-600'
                                    : 'border-gray-300 group-hover:border-indigo-400'
                                }`}>
                                {filters.category === cat.id && <X className="w-3 h-3 text-white rotate-45" style={{ transform: 'none' }} children={<path d="M20 6L9 17l-5-5" />} />}
                                {filters.category === cat.id && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={filters.category === cat.id}
                                onChange={() => handleCategoryChange(cat.id)}
                            />
                            <span className={`text-sm ${filters.category === cat.id ? 'text-indigo-600 font-medium' : 'text-gray-600'}`}>
                                {cat.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Price Range
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        name="min"
                        value={priceRange.min}
                        onChange={handlePriceChange}
                        placeholder="Min"
                        className="w-full px-3 py-2 rounded-xl glass border border-white/20 bg-white/50 text-sm outline-none focus:border-indigo-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="number"
                        name="max"
                        value={priceRange.max}
                        onChange={handlePriceChange}
                        placeholder="Max"
                        className="w-full px-3 py-2 rounded-xl glass border border-white/20 bg-white/50 text-sm outline-none focus:border-indigo-500"
                    />
                </div>
                <button
                    onClick={applyPriceFilter}
                    className="w-full py-2 btn-primary rounded-xl text-sm"
                >
                    Apply Price
                </button>
            </div>
        </div>
    );
};

export default FilterSidebar;
