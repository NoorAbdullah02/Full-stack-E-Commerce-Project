import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch }) => {
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/products?keyword=${keyword}`);
        } else {
            navigate('/products');
        }
        if (onSearch) {
            onSearch();
        }
    };

    return (
        <form onSubmit={submitHandler} className="relative w-full max-w-lg group">
            <input
                type="text"
                name="q"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search products (e.g. Phone, Laptop)..."
                className="w-full h-12 pl-12 pr-12 rounded-full glass border border-white/20 bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-md"
            />
            <button
                type="submit"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors duration-200"
            >
                <Search className="w-5 h-5" />
            </button>
            {keyword && (
                <button
                    type="button"
                    onClick={() => setKeyword('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                    <span className="sr-only">Clear</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </form>
    );
};

export default SearchBar;
