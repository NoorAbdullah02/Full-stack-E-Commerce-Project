import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../redux/slices/toastSlice';

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
            message: 'Message sent successfully! We will get back to you soon.',
            type: 'success'
        }));
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 fade-in-up">
                    <h1 className="text-4xl font-bold mb-4">Get in <span className="text-gradient">Touch</span></h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Have questions about our products or your order? We're here to help.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8 fade-in-up delay-100">
                        <div className="glass p-8 rounded-3xl flex items-start gap-4 hover:scale-105 transition-transform duration-300">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Phone Support</h3>
                                <p className="text-gray-600 mb-1">+880 1234 567890</p>
                                <p className="text-sm text-gray-500">Mon-Fri, 9am-6pm</p>
                            </div>
                        </div>

                        <div className="glass p-8 rounded-3xl flex items-start gap-4 hover:scale-105 transition-transform duration-300">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Email Us</h3>
                                <p className="text-gray-600 mb-1">support@ecommerce.com</p>
                                <p className="text-sm text-gray-500">24/7 Response</p>
                            </div>
                        </div>

                        <div className="glass p-8 rounded-3xl flex items-start gap-4 hover:scale-105 transition-transform duration-300">
                            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 flex-shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Visit Us</h3>
                                <p className="text-gray-600 mb-1">123 Commerce St, Dhaka</p>
                                <p className="text-sm text-gray-500">Bangladesh</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-8 rounded-3xl fade-in-up delay-200">
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-glass w-full"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="input-glass w-full"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="input-glass w-full resize-none"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" /> Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
