
import React, { useState, useMemo } from 'react';
import type { Page } from '../../types';
import { BackButton } from '../BackButton';
import { SearchIcon, NewspaperIcon, LightBulbIcon, BookOpenIcon, ShieldCheckIcon, ClockIcon, ArrowLongRightIcon } from '../icons';

const InsightCard: React.FC<{
    category: string;
    title: string;
    description: string;
    date: string;
    readTime: string;
    icon: React.ElementType;
    image: string;
}> = ({ category, title, description, date, readTime, icon: Icon, image }) => (
    <div className="group bg-white dark:bg-[#111111] rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col h-full">
        <div className="relative h-48 overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-cla-text dark:text-white shadow-sm flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-cla-gold" />
                {category}
            </div>
        </div>
        <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-cla-text dark:text-white mb-3 group-hover:text-cla-gold transition-colors line-clamp-2">{title}</h3>
            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mb-4 line-clamp-3 flex-1">{description}</p>
            
            <div className="border-t border-gray-100 dark:border-white/5 pt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" /> {readTime}</span>
                    <span>•</span>
                    <span>{date}</span>
                </div>
                <button className="flex items-center gap-1 font-semibold text-cla-gold hover:gap-2 transition-all">
                    Read <ArrowLongRightIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

export const LegalInsightsPage: React.FC<{ setCurrentPage: (page: Page) => void; }> = ({ setCurrentPage }) => {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const insights = [
        {
            id: 1,
            category: 'News',
            icon: NewspaperIcon,
            title: 'Supreme Court Updates Bail Procedures for 2024',
            description: 'The Supreme Court of Bangladesh has released new directives regarding bail applications, aiming to streamline the process and reduce case backlog. Here’s what you need to know.',
            date: 'Oct 12, 2024',
            readTime: '4 min read',
            image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop'
        },
        {
            id: 2,
            category: 'Guide',
            icon: LightBulbIcon,
            title: 'How to File a GD Online: A Step-by-Step Guide',
            description: 'Lost your NID or documents? You no longer need to visit the police station physically. Learn how to file a General Diary (GD) online using the official BD Police app.',
            date: 'Oct 08, 2024',
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1555601568-c916f54b1041?q=80&w=800&auto=format&fit=crop'
        },
        {
            id: 3,
            category: 'Case Study',
            icon: BookOpenIcon,
            title: 'Resolving a Land Dispute in 30 Days',
            description: 'A detailed look at how one CLA user resolved a complex property encroachment issue using our platform’s verified lawyer network and document vault.',
            date: 'Sep 28, 2024',
            readTime: '5 min read',
            image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop'
        },
        {
            id: 4,
            category: 'Rights',
            icon: ShieldCheckIcon,
            title: 'Know Your Rights: Workplace Harassment Laws',
            description: 'Understanding the legal protections available to employees in Bangladesh against workplace harassment and how to seek legal recourse safely.',
            date: 'Sep 15, 2024',
            readTime: '7 min read',
            image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=800&auto=format&fit=crop'
        },
        {
            id: 5,
            category: 'News',
            icon: NewspaperIcon,
            title: 'New Cyber Security Act: Key Takeaways',
            description: 'An analysis of the recently passed Cyber Security Act and its implications for digital freedom and online safety in Bangladesh.',
            date: 'Aug 30, 2024',
            readTime: '5 min read',
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop'
        },
        {
            id: 6,
            category: 'Guide',
            icon: LightBulbIcon,
            title: 'Divorce Proceedings in Bangladesh: What to Expect',
            description: 'A compassionate and clear guide on the legal steps involved in filing for divorce under Muslim and Hindu family laws in Bangladesh.',
            date: 'Aug 12, 2024',
            readTime: '8 min read',
            image: 'https://images.unsplash.com/photo-1621621667797-e06afc217fb0?q=80&w=800&auto=format&fit=crop'
        }
    ];

    const categories = ['All', 'News', 'Guide', 'Case Study', 'Rights'];

    const filteredInsights = useMemo(() => {
        return insights.filter(item => {
            const matchesFilter = filter === 'All' || item.category === filter;
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [filter, searchQuery]);

    return (
        <div className="container mx-auto px-4 py-12 animate-fade-in">
            <div className="mb-8">
                <BackButton setCurrentPage={setCurrentPage} targetPage="home" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-4">
                    <div>
                        <h1 className="text-4xl font-bold text-cla-text dark:text-white mb-2">Legal Insights & Updates</h1>
                        <p className="text-cla-text-muted dark:text-gray-400 max-w-xl">Stay informed on law changes, practical guides, and justice news in Bangladesh.</p>
                    </div>
                     <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search legal topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 p-2.5 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-cla-text dark:text-white focus:ring-cla-gold focus:border-cla-gold placeholder:text-gray-400 shadow-sm transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-8">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                                filter === cat 
                                    ? 'bg-cla-gold text-white shadow-lg shadow-cla-gold/20 transform scale-105' 
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {filteredInsights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredInsights.map(item => (
                        <InsightCard key={item.id} {...item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No insights found matching your criteria.</p>
                    <button onClick={() => {setFilter('All'); setSearchQuery('')}} className="mt-4 text-cla-gold hover:underline">Reset Filters</button>
                </div>
            )}
            
            <div className="mt-16 text-center border-t border-gray-200 dark:border-white/10 pt-12">
                <h3 className="text-2xl font-bold text-cla-text dark:text-white mb-4">Need Personalized Legal Help?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Connect with verified lawyers or use our AI assistant for specific queries.</p>
                <button onClick={() => setCurrentPage('find-lawyers')} className="px-8 py-3 bg-cla-gold text-cla-text font-bold rounded-lg hover:bg-cla-gold-darker transition-transform hover:scale-105 shadow-lg">
                    Find a Lawyer
                </button>
            </div>
        </div>
    );
};