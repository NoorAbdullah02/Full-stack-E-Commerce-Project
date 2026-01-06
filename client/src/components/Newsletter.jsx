import { useState } from 'react';
import { Send, Mail } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../redux/slices/toastSlice';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            dispatch(addToast({
                message: 'Thanks for subscribing! Check your email for a coupon.',
                type: 'success'
            }));
            setEmail('');
        }
    };

    return (
        <div className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Mail className="w-64 h-64 text-indigo-600" />
                    </div>

                    <div className="relative z-10 md:w-1/2">
                        <h2 className="text-3xl font-bold mb-4">Subscribe to our Newsletter</h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            Get the latest updates, new arrivals, and exclusive offers sent directly to your inbox.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="input-glass flex-1 bg-white/50"
                                required
                            />
                            <button type="submit" className="btn-primary px-8 py-3 rounded-xl flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" />
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Newsletter;
