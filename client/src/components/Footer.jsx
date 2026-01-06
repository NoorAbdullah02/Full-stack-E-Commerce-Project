import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="glass mt-12 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div>
                        <Link to="/" className="flex items-center space-x-2 mb-4 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gradient">Nexora</span>
                        </Link>
                        <p className="text-gray-600 text-sm mb-4">
                            Premium products, exceptional service. We bring the best of the world to your doorstep in Bangladesh.
                        </p>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white transition-all duration-300">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
                            <li><Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link></li>
                            <li><Link to="/about" className="hover:text-indigo-600 transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Customer Service</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="/profile" className="hover:text-indigo-600 transition-colors">My Account</Link></li>
                            <li><Link to="/profile" className="hover:text-indigo-600 transition-colors">Order Tracking</Link></li>
                            <li><Link to="/faq" className="hover:text-indigo-600 transition-colors">FAQ</Link></li>
                            <li><Link to="/faq" className="hover:text-indigo-600 transition-colors">Shipping & Returns</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Contact Us</h3>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                <span>123 Commerce St, Dhaka, Bangladesh</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                <span>+880 1234 567890</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                <span>support@Nexora.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Nexora. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
