import { ShieldCheck, Package, Truck, Phone, MessageCircle, ExternalLink, Leaf } from 'lucide-react';

const PlantGuaranteeCard = ({ className = '' }) => {
    return (
        <div className={`glass rounded-3xl p-5 sm:p-6 border border-emerald-200/80 bg-gradient-to-br from-white/95 via-emerald-50/30 to-teal-50/40 shadow-sm ${className}`}>
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                        <Leaf className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight">
                            Green Petals Plant Guarantee & Care
                        </h3>
                        <p className="text-[11px] text-emerald-800 font-medium">গ্রিন পেটালস ১০০% জীবন্ত চারার নিশ্চয়তা</p>
                    </div>
                </div>
                <a
                    href="https://www.facebook.com/share/1E2Y48eA5s/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all shadow-sm flex-shrink-0"
                    title="Visit Green Petals on Facebook"
                >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>FB Page</span>
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                {/* 1. Viable Root Guarantee */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-emerald-100/70">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-0.5">
                            100% Viable Root Guarantee:
                        </h4>
                        <p className="text-gray-600 text-[11px] sm:text-xs leading-relaxed">
                            Nurtured with organic compost; free replacement if damaged in transit.
                        </p>
                    </div>
                </div>

                {/* 2. Moisture-Lock Box */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-emerald-100/70">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Package className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-0.5">
                            Moisture-Lock Protective Box:
                        </h4>
                        <p className="text-gray-600 text-[11px] sm:text-xs leading-relaxed">
                            Ventilated mailers keep roots hydrated across all 64 districts.
                        </p>
                    </div>
                </div>

                {/* 3. Express Plant Courier */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-emerald-100/70">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Truck className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-0.5">
                            Express Plant Courier:
                        </h4>
                        <p className="text-gray-600 text-[11px] sm:text-xs leading-relaxed">
                            Barishal Metro ৳100 (24–48h) | All Other Districts ৳150 (2–4 days). Weight tiered: +৳20/extra kg.
                        </p>
                    </div>
                </div>

                {/* 4. Personal Care Advice */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-emerald-100/70">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Phone className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-0.5">
                            Personal Care Advice:
                        </h4>
                        <p className="text-gray-600 text-[11px] sm:text-xs leading-relaxed">
                            Call proprietor Munnar Khanam: <a href="tel:01768686120" className="text-emerald-700 font-bold hover:underline">01768686120</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick FB Action Banner */}
            <div className="mt-3.5 pt-3 border-t border-emerald-100/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-gray-600 text-[11px] flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Direct consultation available on Facebook & WhatsApp
                </span>
                <a
                    href="https://www.facebook.com/share/1E2Y48eA5s/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1877F2] font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                    Connect on Facebook <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
};

export default PlantGuaranteeCard;
