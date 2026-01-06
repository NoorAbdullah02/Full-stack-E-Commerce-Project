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
                    <Link to="/" className="flex items-center space-x-3 group z-50 relative">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-xl group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-110">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-gradient">Nexora</span>
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
                                <Link to="/register" className="btn-primary text-sm whitespace-nowrap">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button - Visible on Mobile */}
                    <div className="flex items-center gap-4 md:hidden">
                        <Link to="/cart" className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200">
                            <ShoppingCart className="w-6 h-6" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 z-50 relative"
                        >
                            {isOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-white/95 backdrop-blur-xl z-40 md:hidden transition-all duration-300 flex flex-col pt-24 px-6 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                {/* Mobile Search */}
                <div className="mb-6">
                    <SearchBar onSearch={() => setIsOpen(false)} />
                </div>

                <div className="space-y-2">
                    <Link
                        to="/"
                        className="flex items-center p-4 text-lg font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all duration-200"
                        onClick={() => setIsOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        to="/products"
                        className="flex items-center p-4 text-lg font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all duration-200"
                        onClick={() => setIsOpen(false)}
                    >
                        Products
                    </Link>

                    {userInfo ? (
                        <>
                            <Link
                                to="/wishlist"
                                className="flex items-center p-4 text-lg font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all duration-200"
                                onClick={() => setIsOpen(false)}
                            >
                                Wishlist
                            </Link>
                            <Link
                                to="/profile"
                                className="flex items-center p-4 text-lg font-medium text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all duration-200"
                                onClick={() => setIsOpen(false)}
                            >
                                Profile
                            </Link>
                            {userInfo.role === 'ADMIN' && (
                                <Link
                                    to="/admin"
                                    className="flex items-center p-4 text-lg font-medium text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl transition-all duration-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Admin Dashboard
                                </Link>
                            )}
                            <button
                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                className="w-full flex items-center p-4 text-lg font-medium text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="pt-4 grid grid-cols-2 gap-4">
                            <Link
                                to="/login"
                                className="flex items-center justify-center p-4 text-lg font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-200"
                                onClick={() => setIsOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center justify-center p-4 text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg rounded-2xl transition-all duration-200"
                                onClick={() => setIsOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
