import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Sprout, Clock } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../redux/slices/toastSlice';
import PlantGuaranteeCard from '../components/PlantGuaranteeCard';

const Contact = () => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(addToast({
            message: 'Thank you for reaching Green Petals! Our plant specialist will contact you soon.',
            type: 'success'
        }));
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 fade-in-up">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        We’d Love to Connect
                    </div>
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">Get in <span className="text-gradient">Touch</span></h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Need plant care advice, bulk orders, or updates on your delivery? Reach store proprietor <strong>Munnar Khanam</strong> and the Green Petals team directly.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6 fade-in-up delay-100">
                        <div className="glass p-8 rounded-3xl flex items-start gap-4 hover:scale-[1.02] transition-transform duration-300 border border-emerald-100">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1 text-gray-900">Direct Hotline / WhatsApp</h3>
                                <p className="text-emerald-700 font-semibold text-lg mb-1">
                                    <a href="tel:01768686120">01768686120</a>
                                </p>
                                <p className="text-sm text-gray-500">Proprietor: Munnar Khanam (9 AM – 9 PM)</p>
                            </div>
                        </div>

                        <div className="glass p-8 rounded-3xl flex items-start gap-4 hover:scale-[1.02] transition-transform duration-300 border border-emerald-100">
                            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1 text-gray-900">Email Us</h3>
                                <p className="text-gray-800 font-medium mb-1">
                                    <a href="mailto:munner.ent@gmail.com" className="hover:text-emerald-600">munner.ent@gmail.com</a>
                                </p>
                                <p className="text-sm text-gray-500">Fast inquiry response & order confirmations</p>
                            </div>
                        </div>

                        <div className="glass p-8 rounded-3xl flex items-start gap-4 hover:scale-[1.02] transition-transform duration-300 border border-emerald-100">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1 text-gray-900">Nursery Location</h3>
                                <p className="text-gray-700 mb-1">Barishal, Bangladesh</p>
                                <p className="text-sm text-gray-500">Delivering healthy live plants across all 64 districts</p>
                            </div>
                        </div>

                        <a
                            href="https://www.facebook.com/share/1E2Y48eA5s/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass p-6 rounded-3xl flex items-center justify-between border border-blue-100 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#1877F2] text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                                    <span className="font-bold text-xl">f</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base">Connect on Facebook</h4>
                                    <p className="text-xs text-blue-700">Green Petals Official Page</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-blue-700 bg-white px-3 py-1.5 rounded-full border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                View Page ↗
                            </span>
                        </a>
                    </div>

                    <div className="glass p-8 rounded-3xl fade-in-up delay-200 border border-emerald-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Tanvir Ahmed"
                                    className="input-glass w-full"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    className="input-glass w-full"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message or Plant Question</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Ask about indoor plant care, custom orders, or delivery..."
                                    className="input-glass w-full resize-none"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" /> Send Message
                            </button>
                        </form>
                    </div>
                </div>

                {/* Plant Guarantee & Care Policy */}
                <div className="mt-10">
                    <PlantGuaranteeCard />
                </div>
            </div>
        </div>
    );
};

export default Contact;
