import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutLocal } from '../redux/slices/authSlice';
import { ShoppingCart, User, LogOut, Menu, X, Heart, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';

const Navbar = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const { cartItems } = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        dispatch(logoutLocal());
        navigate('/login');
    };

    const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-white/80 backdrop-blur-md'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-xl group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-110">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-gradient hidden sm:block">Nexora</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 relative group">
                            Home
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 relative group">
                            Products
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        {userInfo && (
                            <>
                                <Link to="/wishlist" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200 relative group">
                                    Wishlist
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                                {userInfo.role === 'ADMIN' && (
                                    <Link to="/admin" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors duration-200 relative group">
                                        Admin
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:block flex-1 max-w-md mx-8">
                        <SearchBar />
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/cart" className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200 group">
                            <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse-slow shadow-lg">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        {userInfo ? (
                            <div className="flex items-center space-x-3">
                                <Link to="/profile" className="flex items-center space-x-2 glass px-3 py-2 rounded-xl hover:shadow-lg transition-all duration-300 group">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md group-hover:scale-110 transition-transform duration-200">
                                        {userInfo.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden lg:block">{userInfo.name}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-700 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded-lg"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary text-sm">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden py-4 space-y-2 animate-slide-down">
                        <Link
                            to="/"
                            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/products"
                            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                        >
                            Products
                        </Link>
                        <Link
                            to="/cart"
                            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                        >
                            Cart ({cartItemCount})
                        </Link>
                        {userInfo ? (
                            <>
                                <Link
                                    to="/wishlist"
                                    className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors duration-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Wishlist
                                </Link>
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors duration-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Profile
                                </Link>
                                {userInfo.role === 'ADMIN' && (
                                    <Link
                                        to="/admin"
                                        className="block px-4 py-2 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}
                                <button
                                    onClick={() => { handleLogout(); setIsOpen(false); }}
                                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors duration-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
