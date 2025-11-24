
import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { BriefcaseIcon, SearchIcon, BuildingOfficeIcon, ScaleIcon, DocumentTextIcon } from '../../icons';

const statusChipClasses: Record<string, string> = {
    'In Review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    'Hearing': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
    'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800',
    'Submitted': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
};

export const LawyerCases: React.FC<{ onSelectCase: (caseId: string) => void; }> = ({ onSelectCase }) => {
    const { user, cases, users: allUsers } = useContext(AppContext);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const lawyerCases = useMemo(() => {
        if (!user) return [];
        let filtered = cases.filter(c => c.lawyerId === user.id);
        
        if (filter !== 'All') {
            filtered = filtered.filter(c => c.status === filter);
        }
        
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            filtered = filtered.filter(c => 
                c.title.toLowerCase().includes(lowerQ) || 
                allUsers.find(u => u.id === c.clientId)?.name.toLowerCase().includes(lowerQ)
            );
        }

        return filtered.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    }, [cases, user, filter, searchQuery, allUsers]);

    return (
        <div className="animate-fade-in space-y-6">
             {/* Header & Toolbar */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                    <h1 className="text-2xl font-bold text-cla-text dark:text-white">Assigned Cases</h1>
                    <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-1">Manage and track all legal cases assigned to you.</p>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <input 
                            type="text" 
                            placeholder="Search cases or clients..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark rounded-lg text-sm focus:ring-2 focus:ring-cla-gold focus:border-transparent w-full sm:w-64 shadow-sm"
                        />
                    </div>
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark rounded-lg text-sm focus:ring-2 focus:ring-cla-gold focus:border-transparent shadow-sm"
                    >
                        <option value="All">All Statuses</option>
                        <option value="In Review">In Review</option>
                        <option value="Hearing">Hearing</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                 </div>
             </div>

             {/* Data Card */}
             <div className="bg-white dark:bg-cla-surface-dark rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 text-xs uppercase text-gray-500 dark:text-gray-400 border-b border-cla-border dark:border-cla-border-dark">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Case Title</th>
                                <th className="px-6 py-4 font-semibold">Client</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Submitted</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cla-border dark:divide-cla-border-dark">
                            {lawyerCases.map(c => {
                                const client = allUsers.find(u => u.id === c.clientId);
                                return (
                                <tr 
                                    key={c.id} 
                                    onClick={() => onSelectCase(c.id)}
                                    className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                                                <BriefcaseIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-cla-text dark:text-white group-hover:text-cla-gold transition-colors">{c.title}</p>
                                                <p className="text-xs text-gray-500">ID: {c.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-cla-gold/20 flex items-center justify-center text-cla-gold-darker dark:text-cla-gold font-bold text-xs border border-cla-gold/30">
                                                {client?.name.charAt(0)}
                                            </div>
                                            <span className="text-cla-text dark:text-gray-300 font-medium">{client?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusChipClasses[c.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {new Date(c.submittedDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-sm font-semibold text-cla-gold hover:text-cla-gold-darker transition-colors hover:underline">
                                            View Details →
                                        </button>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                
                {lawyerCases.length === 0 && (
                     <div className="text-center py-16">
                        <BriefcaseIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <h3 className="text-lg font-semibold text-cla-text dark:text-white">No cases found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or search query.</p>
                    </div>
                )}

                {lawyerCases.length > 0 && (
                    <div className="px-6 py-4 border-t border-cla-border dark:border-cla-border-dark bg-gray-50 dark:bg-white/5 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>Showing {lawyerCases.length} cases</span>
                        <div className="flex gap-2">
                            <button disabled className="px-3 py-1 bg-white dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark rounded opacity-50 cursor-not-allowed">Prev</button>
                            <button disabled className="px-3 py-1 bg-white dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark rounded opacity-50 cursor-not-allowed">Next</button>
                        </div>
                    </div>
                )}
             </div>
        </div>
    );
};
