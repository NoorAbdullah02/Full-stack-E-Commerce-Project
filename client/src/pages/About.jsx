import { Award, Users, Globe, Heart, Sprout, ShieldCheck, Sun, Droplets } from 'lucide-react';
import PlantGuaranteeCard from '../components/PlantGuaranteeCard';

const About = () => {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16 fade-in-up">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                        <Sprout className="w-4 h-4 text-emerald-600" />
                        About Green Petals
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                        Nurturing <span className="text-gradient">Green Spaces</span> with Love
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Welcome to <strong className="text-emerald-700">Green Petals</strong>, directed and founded by <strong className="text-emerald-700">Munnar Khanam</strong>. We bring the tranquility and refreshing purity of live botanical plants directly to homes, balconies, and workspaces across Bangladesh.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 fade-in-up delay-100">
                    {[
                        { icon: Sprout, label: "Healthy Plant Varieties", value: "200+" },
                        { icon: Users, label: "Delighted Plant Parents", value: "10,000+" },
                        { icon: Globe, label: "Districts Delivered", value: "64" },
                        { icon: Heart, label: "Customer Love Rating", value: "4.9 / 5" }
                    ].map((stat, index) => (
                        <div key={index} className="card-glass text-center hover:scale-105 transition-transform duration-300 border-emerald-50">
                            <div className="w-14 h-14 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-3 shadow-sm">
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-3xl font-extrabold mb-1 text-gray-900">{stat.value}</h3>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Mission Section */}
                <div className="glass rounded-3xl p-8 md:p-12 mb-16 fade-in-up delay-200 border border-emerald-100">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Botanical Story</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                Green Petals started from a passion for botanical biodiversity and clean air. Modern life often keeps us indoors, separated from nature. Our mission is to reconnect you with living greenery that purifies your air, elevates your mental clarity, and breathes life into every corner.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Every seedling, succulent, and exotic bloom is personally supervised by <strong>Munnar Khanam</strong>, ensuring robust roots, organic potting soil, and safe packaging so that each plant arrives thriving.
                            </p>
                            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-xl">
                                <p className="text-sm font-semibold text-emerald-900">Direct Consultation & Inquiries:</p>
                                <p className="text-sm text-emerald-800">Phone: 01768686120 | Email: munner.ent@gmail.com</p>
                            </div>
                        </div>
                        <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl border border-emerald-100">
                            <img
                                src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80"
                                alt="Green Petals Botanical Nursery"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent flex items-end p-6">
                                <p className="text-white font-bold text-lg">Cultivating life, peace, and serenity 🌱</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="card-glass p-8 border-emerald-50">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
                            <Sun className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Organic & Pesticide-Free</h3>
                        <p className="text-gray-600 text-sm">We use vermicompost and cold-pressed neem formulations to keep our plants vibrant naturally.</p>
                    </div>

                    <div className="card-glass p-8 border-emerald-50">
                        <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mb-4">
                            <Droplets className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Moisture-Lock Packaging</h3>
                        <p className="text-gray-600 text-sm">Specially designed plant mailers retain root hydration during transit across all 64 districts.</p>
                    </div>

                    <div className="card-glass p-8 border-emerald-50">
                        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Guaranteed Viability</h3>
                        <p className="text-gray-600 text-sm">If any plant arrives damaged or unhealthy, we replace it promptly with no hassles.</p>
                    </div>
                </div>

                {/* Plant Guarantee & Policy Card */}
                <div className="mt-8">
                    <PlantGuaranteeCard />
                </div>
            </div>
        </div>
    );
};

export default About;
