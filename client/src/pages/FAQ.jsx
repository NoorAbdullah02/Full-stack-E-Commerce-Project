import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
    const faqs = [
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, mobile banking (Bkash, Nagad), and Cash on Delivery."
        },
        {
            question: "How long does shipping take?",
            answer: "Standard shipping takes 3-5 business days within Dhaka and 5-7 days for other districts."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for unused items in original packaging. Return shipping is free."
        },
        {
            question: "Do you offer international shipping?",
            answer: "Currently we only ship within Bangladesh, but we are working on expanding globally."
        },
        {
            question: "How can I track my order?",
            answer: "You can track your order status in real-time from your shipping confirmation email or by logging into your account."
        }
    ];

    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-12 text-center fade-in-up">
                    Frequently Asked <span className="text-gradient">Questions</span>
                </h1>

                <div className="space-y-4 fade-in-up delay-100">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="glass rounded-2xl overflow-hidden transition-all duration-300"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/30 transition-colors"
                            >
                                <span className="font-semibold text-gray-900">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="w-5 h-5 text-indigo-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>

                            <div
                                className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-40 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
                                    }`}
                            >
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQ;
