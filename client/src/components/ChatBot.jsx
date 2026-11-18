import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MessageCircle, X, Send, Sparkles, Bot, User, Sprout } from 'lucide-react';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', content: 'Hello plant lover! 🌿 I am your Green Petals Assistant. Ask me about our live botanical collection, plant care, prices, bKash payment, or delivery across Bangladesh!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const sendMessage = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`, {
                message: userMessage.content,
                history: history
            });

            const botMessage = { role: 'model', content: data.response };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            setMessages((prev) => [...prev, {
                role: 'model',
                content: 'Welcome to Green Petals! 🌿 For immediate assistance, feel free to call store proprietor Munnar Khanam at 01768686120 or message on Facebook: fb.com/munnar.khanam.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-[100]">
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="group relative"
                    aria-label="Open Green Petals AI Assistant"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur-md opacity-60 group-hover:opacity-90 transition-opacity duration-300 animate-pulse-slow"></div>
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-xl shadow-emerald-500/40 flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white">
                        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                </button>
            )}

            {isOpen && (
                <div className="bg-white rounded-3xl shadow-2xl w-[92vw] sm:w-96 max-w-sm flex flex-col h-[520px] sm:h-[580px] overflow-hidden animate-scale-in border border-emerald-100">
                    {/* Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-4 sm:p-5 text-white flex-shrink-0">
                        <div className="relative flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <Sprout className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Green Petals AI</h3>
                                    <p className="text-emerald-100 text-[11px]">Plant Care & Live Store Assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleChat}
                                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                                aria-label="Close Chat"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-emerald-50/20 to-white text-xs sm:text-sm">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
                            >
                                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                    msg.role === 'user'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                    {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                                </div>
                                <div
                                    className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-emerald-100 whitespace-pre-wrap'
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2.5 items-center text-gray-500 animate-pulse">
                                <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Bot className="w-3.5 h-3.5 text-emerald-700" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-emerald-100 shadow-sm text-xs text-emerald-800 flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-200"></div>
                                    <span className="ml-1 text-[11px]">Consulting botanical catalog...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={sendMessage} className="p-3 bg-white border-t border-emerald-100 flex-shrink-0">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about plants, prices, or care..."
                                disabled={loading}
                                className="flex-1 input-glass py-2 px-3.5 text-xs sm:text-sm rounded-xl border-emerald-200 focus:border-emerald-500"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 rounded-xl flex items-center justify-center shadow-md transition-all active:scale-95 flex-shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                            Powered by <strong className="text-emerald-700 font-semibold">Green Petals Botanical AI</strong>
                        </p>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
