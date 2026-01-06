import { Award, Users, Globe, Heart } from 'lucide-react';

const About = () => {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-20 fade-in-up">
                    <h1 className="text-5xl font-bold mb-6">Our <span className="text-gradient">Story</span></h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        We are building the future of e-commerce in Bangladesh. Combining cutting-edge technology with premium design to deliver an unforgettable shopping experience.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-8 mb-20 fade-in-up delay-100">
                    {[
                        { icon: Users, label: "Happy Customers", value: "50k+" },
                        { icon: Award, label: "Quality Products", value: "2000+" },
                        { icon: Globe, label: "Districts Covered", value: "64" },
                        { icon: Heart, label: "Customer Reviews", value: "15k+" }
                    ].map((stat, index) => (
                        <div key={index} className="glass p-8 rounded-3xl text-center hover:scale-105 transition-transform duration-300">
                            <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                            <p className="text-gray-600">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Mission Section */}
                <div className="glass rounded-3xl p-12 mb-20 fade-in-up delay-200">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Our mission is to democratize access to premium products across Bangladesh. We believe that everyone deserves a seamless, secure, and delightful online shopping experience.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                We are committed to sustainability, ethical sourcing, and empowering local communities through technology and commerce.
                            </p>
                        </div>
                        <div className="relative h-80 rounded-2xl overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                                alt="Team working"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                                <p className="text-white font-bold text-xl">Building the future together</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
