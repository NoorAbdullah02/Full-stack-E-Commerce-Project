import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Sprout } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="glass mt-12 border-t border-emerald-100 bg-white/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div>
                        <Link to="/" className="flex items-center space-x-2 mb-4 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                                <Sprout className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gradient">Green Petals</span>
                        </Link>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            Cultivating calm, green living. We deliver healthy indoor plants, exotic flowers, succulents, and botanical essentials right to your doorstep across Bangladesh.
                        </p>
                        <p className="text-xs text-emerald-800 font-semibold mb-3">
                            Proprietor: Munnar Khanam
                        </p>
                        <div className="flex space-x-3">
                            <a
                                href="https://www.facebook.com/share/1E2Y48eA5s/"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Munnar Khanam Facebook"
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-700 hover:bg-[#1877F2] hover:text-white transition-all duration-300 shadow-sm"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="tel:01768686120"
                                title="Call Hotline"
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm"
                            >
                                <Phone className="w-4 h-4" />
                            </a>
                            <a
                                href="mailto:munner.ent@gmail.com"
                                title="Email Us"
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm"
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link></li>
                            <li><Link to="/products" className="hover:text-emerald-600 transition-colors">All Plants & Pots</Link></li>
                            <li><Link to="/about" className="hover:text-emerald-600 transition-colors">About Our Nursery</Link></li>
                            <li><Link to="/contact" className="hover:text-emerald-600 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Customer Care</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="/profile" className="hover:text-emerald-600 transition-colors">My Account</Link></li>
                            <li><Link to="/profile" className="hover:text-emerald-600 transition-colors">Track Plant Order</Link></li>
                            <li><Link to="/faq" className="hover:text-emerald-600 transition-colors">Plant Care FAQ</Link></li>
                            <li><Link to="/faq" className="hover:text-emerald-600 transition-colors">Shipping & Safe Packaging</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Contact Nursery</h3>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                <span>Barishal, Bangladesh</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                <a href="tel:01768686120" className="hover:text-emerald-600 font-medium">01768686120</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                <a href="mailto:munner.ent@gmail.com" className="hover:text-emerald-600">munner.ent@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-emerald-100 pt-8 text-center text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p>&copy; {new Date().getFullYear()} Green Petals. All rights reserved.</p>
                    <p className="text-xs text-gray-400">Founder & Owner: Munnar Khanam | Hotlines: 01768686120</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
