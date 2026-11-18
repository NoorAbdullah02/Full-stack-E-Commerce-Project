import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutLocal } from '../redux/slices/authSlice';
import { ShoppingCart, User, LogOut, Menu, X, Heart, Sprout, Home as HomeIcon, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';

const Navbar = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const { cartItems } = useSelector((state) => state.cart);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    const wishlistCount = wishlistItems?.length || 0;
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

    // Prevent background scroll when mobile sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleLogout = () => {
        dispatch(logoutLocal());
        navigate('/login');
    };

    const cartItemCount = cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
                scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-emerald-100' : 'bg-white/90 backdrop-blur-sm'
            }`}>
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2.5 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300">
                                <Sprout className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl sm:text-2xl font-black text-gradient tracking-tight">Green Petals</span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center space-x-6 text-sm">
                            <Link to="/" className="text-gray-700 hover:text-emerald-600 font-semibold transition-colors duration-200">
                                Home
                            </Link>
                            <Link to="/products" className="text-gray-700 hover:text-emerald-600 font-semibold transition-colors duration-200">
                                Plants & Catalog
                            </Link>
                            <Link to="/about" className="text-gray-700 hover:text-emerald-600 font-semibold transition-colors duration-200">
                                Nursery & Story
                            </Link>
                            <Link to="/contact" className="text-gray-700 hover:text-emerald-600 font-semibold transition-colors duration-200">
                                Contact
                            </Link>
                            {(userInfo?.role === 'ADMIN' || userInfo?.role === 'SUPER_ADMIN') && (
                                <Link to="/admin" className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                    Admin Panel
                                </Link>
                            )}
                        </nav>

                        {/* Search Bar - Desktop */}
                        <div className="hidden lg:block flex-1 max-w-xs mx-6">
                            <SearchBar />
                        </div>

                        {/* Actions (Desktop) */}
                        <div className="hidden md:flex items-center space-x-3">
                            <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-rose-600 transition-colors" title="Wishlist">
                                <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-100' : ''}`} />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                            
                            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-emerald-700 transition-colors" title="Cart">
                                <ShoppingCart className="w-5 h-5" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>

                            {userInfo ? (
                                <div className="flex items-center space-x-2 pl-2">
                                    <Link to="/profile" className="flex items-center space-x-2 glass px-3 py-1.5 rounded-xl hover:bg-emerald-50 transition-all border border-emerald-100">
                                        <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                            {userInfo.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-semibold text-gray-800">{userInfo.name.split(' ')[0]}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 pl-2">
                                    <Link to="/login" className="text-xs font-bold text-gray-700 hover:text-emerald-700 px-3 py-2">
                                        Login
                                    </Link>
                                    <Link to="/register" className="btn-primary text-xs font-bold py-2 px-4 rounded-xl">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Right Bar: Cart + Prominent Menu Toggle Button */}
                        <div className="flex items-center gap-2 md:hidden">
                            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-emerald-600">
                                <ShoppingCart className="w-6 h-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>

                            {/* Unmistakable Mobile Menu Button with Text Label */}
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label="Toggle Mobile Sidebar Menu"
                                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all shadow-sm ${
                                    isOpen
                                        ? 'bg-emerald-700 text-white'
                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                }`}
                            >
                                {isOpen ? (
                                    <>
                                        <X className="w-4 h-4" />
                                        <span>Close</span>
                                    </>
                                ) : (
                                    <>
                                        <Menu className="w-4 h-4" />
                                        <span>Menu</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Dedicated Full-Screen Mobile Drawer (Placed OUTSIDE header stacking context) */}
            {isOpen && (
                <div className="fixed inset-0 z-[150] md:hidden animate-fade-in">
                    {/* Dark Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sliding Drawer Panel from Right */}
                    <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left p-6">
                        
                        {/* Drawer Header */}
                        <div>
                            <div className="flex items-center justify-between pb-5 border-b border-emerald-100 mb-5">
                                <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-2">
                                    <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow">
                                        <Sprout className="w-5 h-5" />
                                    </div>
                                    <span className="text-xl font-black text-gradient">Green Petals</span>
                                </Link>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                    aria-label="Close Sidebar"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Search in Drawer */}
                            <div className="mb-5">
                                <SearchBar onSearch={() => setIsOpen(false)} />
                            </div>

                            {/* Navigation Links with Icons */}
                            <nav className="space-y-1.5">
                                <Link
                                    to="/"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 p-3 text-base font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                                >
                                    <HomeIcon className="w-5 h-5 text-emerald-600" />
                                    <span>Home</span>
                                </Link>

                                <Link
                                    to="/products"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 p-3 text-base font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                                >
                                    <Sprout className="w-5 h-5 text-emerald-600" />
                                    <span>Plants & All Products</span>
                                </Link>

                                <Link
                                    to="/wishlist"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between p-3 text-base font-semibold text-gray-800 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Heart className="w-5 h-5 text-rose-500" />
                                        <span>Saved Wishlist</span>
                                    </div>
                                    {wishlistCount > 0 && (
                                        <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    to="/about"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 p-3 text-base font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                                >
                                    <Sparkles className="w-5 h-5 text-emerald-600" />
                                    <span>About Our Nursery</span>
                                </Link>

                                <Link
                                    to="/contact"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 p-3 text-base font-semibold text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors"
                                >
                                    <Phone className="w-5 h-5 text-emerald-600" />
                                    <span>Contact & Support</span>
                                </Link>

                                {(userInfo?.role === 'ADMIN' || userInfo?.role === 'SUPER_ADMIN') && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 p-3 text-base font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 mt-2"
                                    >
                                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                        <span>Admin Dashboard</span>
                                    </Link>
                                )}
                            </nav>
                        </div>

                        {/* Drawer Bottom: User Account / Social / Hotline */}
                        <div className="pt-6 border-t border-emerald-100 space-y-4">
                            {userInfo ? (
                                <div className="space-y-2">
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-100"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">
                                                {userInfo.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{userInfo.name}</p>
                                                <p className="text-xs text-gray-500">{userInfo.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-emerald-700 font-semibold">Orders ↗</span>
                                    </Link>
                                    
                                    <button
                                        onClick={() => { handleLogout(); setIsOpen(false); }}
                                        className="w-full py-2.5 px-4 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2.5">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="py-3 px-4 text-center font-bold text-sm text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="btn-primary py-3 px-4 text-center font-bold text-sm rounded-xl"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}

                            {/* Store Quick Info */}
                            <div className="bg-gray-50 rounded-2xl p-3 text-xs text-gray-600 space-y-1">
                                <p><strong>Proprietor:</strong> Munnar Khanam</p>
                                <p><strong>Hotline:</strong> <a href="tel:01768686120" className="text-emerald-700 font-bold">01768686120</a></p>
                                <p><strong>Facebook:</strong> <a href="https://www.facebook.com/munnar.khanam" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">fb.com/munnar.khanam</a></p>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
