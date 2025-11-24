import React, { useState, useEffect } from 'react';
import type { Page, UserRole } from '../../types';
import {
    StarIcon,
    AppointmentIcon as HomepageAppointmentIcon, HelplineIcon, ConsultationIcon,
    AiExpertIcon, LawExplanationIcon, TrackingIcon, CaseStudyIcon, SafeDocIcon,
    UserGroupIcon, GavelIcon, ChatBubbleIcon,
    NewspaperIcon, LightBulbIcon, BookOpenIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon, ArrowLongRightIcon, MessageIcon, ChartBarIcon
} from '../icons';


const ServiceCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="cla-card card-gold-hover group p-8 h-full flex flex-col text-left hover:shadow-gold-soft-sm hover:-translate-y-1 bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5">
        <div className="w-14 h-14 rounded-full bg-cla-gold/10 dark:bg-cla-gold/5 flex items-center justify-center mb-6 text-cla-gold group-hover:bg-cla-gold group-hover:text-white transition-colors duration-300">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-7 h-7" }) : icon}
        </div>
        <h3 className="text-xl font-bold text-cla-text dark:text-white mb-3">{title}</h3>
        <p className="text-sm text-cla-text-muted dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; value: number; label: string; suffix?: string }> = ({ icon, value, label, suffix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.ceil(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="cla-card card-gold-hover p-8 text-center hover:shadow-gold-soft transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-cla-gold/20">
            <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-orange-50 dark:bg-cla-gold/10 text-cla-gold ring-1 ring-cla-gold/20">
                    {icon}
                </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{count}{suffix}</p>
            <p className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    );
};

const InsightCard: React.FC<{
    category: string;
    title: string;
    description: string;
    date: string;
    readTime: string;
    icon: React.ElementType;
    image: string;
}> = ({ category, title, description, date, readTime, icon: Icon, image }) => (
    <div className="cla-card card-gold-hover group p-6 flex flex-col h-full relative overflow-hidden hover:shadow-gold-soft-sm hover:-translate-y-1 bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-cla-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full bg-gray-50 dark:bg-white/5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-cla-gold" />
                {category}
            </span>
        </div>
        <h3 className="text-lg font-bold text-cla-text dark:text-white mb-2 group-hover:text-cla-gold transition-colors line-clamp-2">{title}</h3>
        <p className="text-sm text-cla-text-muted dark:text-gray-400 mb-4 line-clamp-3 flex-1 leading-relaxed">{description}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 dark:border-white/5 pt-4 mt-auto">
            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" /> {readTime}</span>
                <span>•</span>
                <span>{date}</span>
            </div>
            <span className="text-cla-gold font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">Read <ArrowLongRightIcon className="w-4 h-4" /></span>
        </div>
    </div>
);

const TestimonialSlider = () => {
    const testimonials = [
        { id: 1, name: "Rahim Ahmed", role: "Dhaka", type: "Property Dispute", quote: "CLA saved me hours of hassle. Finding a verified lawyer for my property dispute was incredibly fast.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
        { id: 2, name: "Nusrat Jahan", role: "Chattogram", type: "Child Custody", quote: "I was nervous about a child custody matter. Within a day I was connected to a specialist who explained my options.", avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d" },
        { id: 3, name: "Imran Karim", role: "Founder, Dhaka", type: "Business Contract", quote: "For my startup’s first investment round, CLA helped me find a corporate lawyer who handled everything smoothly.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    ];
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    useEffect(() => {
        const timer = setInterval(next, 8000);
        return () => clearInterval(timer);
    }, [testimonials.length]);

    const current = testimonials[currentIndex];

    return (
        <div className="relative bg-white/90 dark:bg-[#111]/60 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/50 dark:border-white/10 shadow-xl max-w-4xl mx-auto">

            <div className="flex items-center justify-between w-full mb-8">
                <button onClick={prev} className="h-10 w-10 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-white" />
                </button>

                <div className="flex-1 text-center px-6">
                    <div className="flex justify-center gap-1 text-cla-gold mb-6">
                        {[...Array(5)].map((_, i) => (
                            <span key={i}>
                                <StarIcon className="w-6 h-6" isFilled={true} />
                            </span>
                        ))}
                    </div>
                    <p className="text-xl md:text-2xl font-serif italic text-gray-800 dark:text-white mb-8 leading-relaxed">"{current.quote}"</p>
                </div>

                <button onClick={next} className="h-10 w-10 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                    <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-white" />
                </button>
            </div>

            <div className="flex flex-col items-center">
                <div className="flex items-center gap-4 mb-6">
                    <img src={current.avatar} alt="" className="w-14 h-14 rounded-full border-2 border-cla-gold p-0.5" />
                    <div className="text-left">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{current.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">{current.role} • <span className="text-cla-gold font-medium">{current.type}</span></p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {testimonials.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentIndex(idx)} className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-cla-gold w-8' : 'bg-gray-300 dark:bg-white/20 w-2'}`} />
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 w-full flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-300">Used CLA before? Share your experience.</p>
                    <button className="px-5 py-2 rounded-full bg-cla-gold text-white font-semibold text-sm hover:bg-cla-gold-darker shadow-md hover:shadow-lg transition-all">Add your review</button>
                </div>
            </div>
        </div>
    );
};


export const HomePage: React.FC<{ setCurrentPage: (page: Page) => void; openEmergencyModal: () => void; goToAuth: (mode: 'login' | 'signup', options?: { signupRole?: UserRole }) => void; }> = ({ setCurrentPage, openEmergencyModal, goToAuth }) => {
    const coreServices = [
        { icon: <HomepageAppointmentIcon />, title: "Lawyer Appointment", description: "Instant booking with verified experts." },
        { icon: <HelplineIcon />, title: "Emergency Helpline", description: "24/7 immediate legal crisis support." },
        { icon: <ConsultationIcon />, title: "Consultation", description: "Direct chat solutions without waiting." },
        { icon: <AiExpertIcon />, title: "Legal AI Expert", description: "Smart guidance for your legal questions." },
        { icon: <LawExplanationIcon />, title: "Law Simplifier", description: "Complex laws explained in plain language." },
        { icon: <TrackingIcon />, title: "Case Tracking", description: "Real-time updates on your case status." },
        { icon: <CaseStudyIcon />, title: "Case Studies", description: "Learn from similar past legal cases." },
        { icon: <SafeDocIcon />, title: "SafeDoc Vault", description: "Encrypted storage for legal documents." }
    ];

    return (
        <div className="animate-fade-in">
            {/* 1. Hero Section */}
            <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Background with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img src="https://i.postimg.cc/sDT01TpF/wp15014527-law-office-wallpapers.png" alt="Legal Background" className="w-full h-full object-cover animate-slow-zoom" />
                    {/* Vignette Overlay - No "whitish" haze */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black/90"></div>
                    <div className="absolute inset-0 bg-black/30"></div> {/* Overall tint */}
                    {/* Bottom fade only */}
                    <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-cla-bg dark:from-[#050505] to-transparent"></div>
                </div>

                <div className="relative container mx-auto px-4 sm:px-6 max-w-[1200px] text-center z-10 mt-10">
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-8xl font-bold text-white tracking-tight mb-6 leading-[1.1] animate-fade-in-up drop-shadow-2xl">
                        Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-cla-gold via-yellow-400 to-cla-gold">Legal Aid</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-100/90 max-w-3xl mx-auto mb-12 leading-relaxed font-light animate-fade-in-up drop-shadow-md" style={{ animationDelay: '150ms' }}>
                        Justice for Everyone, Anytime. Connect with trusted lawyers, manage cases securely, and get AI-powered legal guidance in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <button onClick={openEmergencyModal} className="min-w-[220px] px-8 py-4 bg-cla-gold text-cla-text font-bold text-lg rounded-full shadow-lg shadow-cla-gold/20 hover:bg-cla-gold-darker transition-all duration-300">
                            Get Emergency Help
                        </button>
                        <button onClick={() => goToAuth('login', { signupRole: 'lawyer' })} className="min-w-[220px] px-8 py-4 bg-white/10 backdrop-blur-md border border-white/40 text-white font-bold text-lg rounded-full hover:bg-white hover:text-black hover:border-white transition-all duration-300">
                            Join as Lawyer
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Core Services */}
            <div className="py-32 bg-cla-bg dark:bg-[#050505]">
                <div className="container mx-auto px-6 max-w-[1200px]">
                    <div className="text-left mb-16">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-cla-text dark:text-white mb-6">Explore Our Core Services</h2>
                        <p className="text-xl text-cla-text-muted dark:text-gray-400 max-w-2xl leading-relaxed">Comprehensive digital legal solutions designed for modern needs, empowering you at every step.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {coreServices.map(service => <ServiceCard key={service.title} {...service} />)}
                    </div>
                </div>
            </div>

            {/* 3. How CLA Works */}
            <div className="py-32 bg-white dark:bg-[#0A0A0A] border-y border-gray-100 dark:border-white/5">
                <div className="container mx-auto px-6 max-w-[1200px]">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-serif font-bold text-cla-text dark:text-white mb-4">How CLA Works for You</h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400">A seamless process from problem to solution.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-cla-gold/30 to-transparent -z-10"></div>

                        <div className="step-shine cla-card bg-cla-bg dark:bg-[#111] p-8 rounded-3xl text-center border border-gray-100 dark:border-white/10 shadow-lg group">
                            <div className="w-20 h-20 mx-auto bg-white dark:bg-black border border-cla-gold/20 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                <MessageIcon className="w-8 h-8 text-cla-gold" />
                            </div>
                            <div className="inline-block px-3 py-1 rounded-full bg-cla-gold/10 text-cla-gold text-xs font-bold uppercase tracking-wider mb-4">Step 1</div>
                            <h3 className="text-xl font-bold mb-3 text-cla-text dark:text-white">Tell us your issue</h3>
                            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">Describe your problem or ask our AI for instant preliminary guidance.</p>
                        </div>

                        <div className="step-shine cla-card bg-cla-bg dark:bg-[#111] p-8 rounded-3xl text-center border border-gray-100 dark:border-white/10 shadow-lg group">
                            <div className="w-20 h-20 mx-auto bg-white dark:bg-black border border-cla-gold/20 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                <UserGroupIcon className="w-8 h-8 text-cla-gold" />
                            </div>
                            <div className="inline-block px-3 py-1 rounded-full bg-cla-gold/10 text-cla-gold text-xs font-bold uppercase tracking-wider mb-4">Step 2</div>
                            <h3 className="text-xl font-bold mb-3 text-cla-text dark:text-white">Match with Experts</h3>
                            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">We connect you with verified lawyers specialized in your specific case type.</p>
                        </div>

                        <div className="step-shine cla-card bg-cla-bg dark:bg-[#111] p-8 rounded-3xl text-center border border-gray-100 dark:border-white/10 shadow-lg group">
                            <div className="w-20 h-20 mx-auto bg-white dark:bg-black border border-cla-gold/20 rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                <ChartBarIcon className="w-8 h-8 text-cla-gold" />
                            </div>
                            <div className="inline-block px-3 py-1 rounded-full bg-cla-gold/10 text-cla-gold text-xs font-bold uppercase tracking-wider mb-4">Step 3</div>
                            <h3 className="text-xl font-bold mb-3 text-cla-text dark:text-white">Track & Resolve</h3>
                            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">Manage documents, appointments, and case progress directly from your dashboard.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Legal Insights */}
            <div className="py-32 bg-cla-bg dark:bg-[#050505]">
                <div className="container mx-auto px-6 max-w-[1200px]">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <h2 className="text-4xl font-serif font-bold text-cla-text dark:text-white mb-4">Legal Insights & Updates</h2>
                            <p className="text-xl text-cla-text-muted dark:text-gray-400">Stay informed on the latest in Bangladesh law.</p>
                        </div>
                        <button onClick={() => setCurrentPage('insights')} className="hidden md:flex items-center gap-2 font-bold text-cla-gold hover:gap-3 transition-all text-lg">
                            View all insights <ArrowLongRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <InsightCard
                            category="News"
                            icon={NewspaperIcon}
                            title="Supreme Court Updates Bail Procedures for 2024"
                            description="New directives regarding bail applications aiming to streamline the process and reduce case backlog. Here’s what you need to know."
                            date="Oct 12"
                            readTime="4 min"
                            image="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop"
                        />
                        <InsightCard
                            category="Guide"
                            icon={LightBulbIcon}
                            title="How to File a GD Online: Step-by-Step"
                            description="Learn how to file a General Diary (GD) online using the official BD Police app without visiting the station."
                            date="Oct 08"
                            readTime="6 min"
                            image="https://images.unsplash.com/photo-1555601568-c916f54b1041?q=80&w=800&auto=format&fit=crop"
                        />
                        <InsightCard
                            category="Case Study"
                            icon={BookOpenIcon}
                            title="Resolving a Land Dispute in 30 Days"
                            description="How a CLA user resolved a complex property encroachment issue using our verified lawyer network."
                            date="Sep 28"
                            readTime="5 min"
                            image="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop"
                        />
                    </div>
                    <button onClick={() => setCurrentPage('insights')} className="md:hidden mt-12 w-full py-4 font-bold text-cla-gold border border-cla-gold rounded-xl">
                        View all insights
                    </button>
                </div>
            </div>

            {/* 5. Stats & Testimonials */}
            <div className="py-32 relative overflow-hidden bg-gradient-to-br from-justiceFrom via-cla-gold to-justiceTo dark:from-[#F59E0B] dark:via-[#D97706] dark:to-[#B45309]">
                {/* Hex Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] mix-blend-overlay"></div>

                <div className="container mx-auto px-6 max-w-[1200px] relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 drop-shadow-md">Connecting People with Justice</h2>
                        <p className="text-white/90 text-xl max-w-2xl mx-auto font-light">Trusted by thousands across Bangladesh. Real numbers, real impact.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                        <StatCard icon={<UserGroupIcon />} value={50} label="Active Users" suffix="k+" />
                        <StatCard icon={<GavelIcon />} value={5} label="Verified Lawyers" suffix="k" />
                        <StatCard icon={<ChatBubbleIcon />} value={200} label="Feedbacks" suffix="+" />
                        <StatCard icon={<StarIcon isFilled={true} />} value={5.0} label="Rating" suffix="/5" />
                    </div>

                    <TestimonialSlider />
                </div>
            </div>
        </div>
    );
};