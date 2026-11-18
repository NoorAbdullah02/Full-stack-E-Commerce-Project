import { useState, useEffect, useRef } from 'react';
import { Search, X, Sprout, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { listProducts } from '../redux/slices/productSlice';
import { formatCurrency } from '../utils/currency';

const SearchBar = ({ onSearch }) => {
    const [keyword, setKeyword] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { products } = useSelector((state) => state.product);

    useEffect(() => {
        if (!products || products.length === 0) {
            dispatch(listProducts());
        }
    }, [dispatch, products]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Instant filtered suggestions (Bengali & English supported)
    const suggestions = keyword.trim().length > 0
        ? (products || []).filter((p) => {
            const query = keyword.trim().toLowerCase();
            const nameMatch = p.name?.toLowerCase().includes(query);
            const descMatch = p.description?.toLowerCase().includes(query);
            const catMatch = p.category?.name?.toLowerCase().includes(query);
            return nameMatch || descMatch || catMatch;
        }).slice(0, 5)
        : [];

    const submitHandler = (e) => {
        if (e) e.preventDefault();
        setIsOpen(false);
        if (keyword.trim()) {
            navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
        } else {
            navigate('/products');
        }
        if (onSearch) {
            onSearch();
        }
    };

    const handleSelectProduct = (productId) => {
        setIsOpen(false);
        setKeyword('');
        navigate(`/product/${productId}`);
        if (onSearch) {
            onSearch();
        }
    };

    return (
        <div ref={dropdownRef} className="relative w-full group">
            <form onSubmit={submitHandler} className="relative w-full">
                <input
                    type="text"
                    name="q"
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search plants (e.g. Monstera, বেলি, Areca)..."
                    className="w-full h-11 sm:h-12 pl-11 pr-10 rounded-2xl glass border border-emerald-200/80 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/60 text-gray-800 placeholder-gray-400 text-xs sm:text-sm font-medium shadow-sm transition-all"
                />
                <button
                    type="submit"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-900 transition-colors"
                    title="Search"
                >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {keyword && (
                    <button
                        type="button"
                        onClick={() => {
                            setKeyword('');
                            setIsOpen(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                        title="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </form>

            {/* Instant Suggestions Dropdown Card */}
            {isOpen && keyword.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-50 animate-scale-in">
                    {suggestions.length > 0 ? (
                        <div className="p-2 space-y-1">
                            <div className="px-3 py-1.5 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100">
                                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                                Matching Botanical Plants
                            </div>
                            {suggestions.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleSelectProduct(item.id)}
                                    className="w-full p-2.5 rounded-xl hover:bg-emerald-50/80 flex items-center gap-3 transition-colors text-left group/item"
                                >
                                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                        <img
                                            src={item.images?.[0] || item.image || 'https://via.placeholder.com/100'}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-xs sm:text-sm text-gray-900 group-hover/item:text-emerald-800 truncate">
                                            {item.name}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[11px] text-gray-400">{item.category?.name || 'Plant'}</span>
                                            <span className="text-xs font-extrabold text-emerald-700">{formatCurrency(item.price)}</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover/item:text-emerald-600 transition-colors" />
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={submitHandler}
                                className="w-full mt-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <span>View all results for &quot;{keyword}&quot;</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500 text-xs sm:text-sm">
                            <p className="font-semibold text-gray-800">No plants found for &quot;{keyword}&quot;</p>
                            <p className="text-[11px] text-gray-400 mt-1">Try searching with a Bengali or English plant name (যেমন: মানিপ্ল্যান্ট, Monstera, অর্কিড)</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
