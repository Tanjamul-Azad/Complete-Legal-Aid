
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import { UserGroupIcon, PhoneIcon, MailIcon, BriefcaseIcon, SearchIcon } from '../../icons';

export const LawyerClients: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { user, cases, users: allUsers, setDashboardSubPage, setSelectedCaseId } = context;

    const clients = useMemo(() => {
        if (!user) return [];
        // Get all cases for this lawyer
        const myCases = cases.filter(c => c.lawyerId === user.id);
        // Extract unique client IDs
        const clientIds = [...new Set(myCases.map(c => c.clientId))];
        
        return clientIds.map(clientId => {
            const clientUser = allUsers.find(u => u.id === clientId);
            const clientCases = myCases.filter(c => c.clientId === clientId);
            return {
                user: clientUser,
                cases: clientCases
            };
        }).filter(item => item.user); // Filter out undefined users
    }, [user, cases, allUsers]);

    if (!user) return null;

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-cla-text dark:text-white">My Clients</h1>
                    <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-1">
                        {clients.length} active clients across {cases.filter(c => c.lawyerId === user.id).length} cases.
                    </p>
                </div>
                <div className="relative w-full md:w-64">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search clients..." 
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark rounded-lg text-sm focus:ring-2 focus:ring-cla-gold focus:border-transparent shadow-sm"
                    />
                </div>
            </div>

            {clients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {clients.map(({ user: client, cases: activeCases }) => (
                        <div key={client!.id} className="bg-white dark:bg-cla-surface-dark rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm p-6 hover:shadow-md transition-all hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-5">
                                <img src={client!.avatar} alt={client!.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100 dark:ring-white/10" />
                                <div>
                                    <h3 className="font-bold text-lg text-cla-text dark:text-white">{client!.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                            Active
                                        </span>
                                        <span className="text-xs text-gray-500">Joined {new Date().getFullYear()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3 mb-6 text-sm bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-2 text-cla-text-muted dark:text-cla-text-muted-dark truncate">
                                    <MailIcon className="w-4 h-4 text-gray-400" /> {client!.email}
                                </div>
                                <div className="flex items-center gap-2 text-cla-text-muted dark:text-cla-text-muted-dark">
                                    <PhoneIcon className="w-4 h-4 text-gray-400" /> {client!.phone || 'N/A'}
                                </div>
                            </div>

                            <div className="border-t border-cla-border dark:border-cla-border-dark pt-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Active Cases ({activeCases.length})</p>
                                <div className="space-y-2">
                                    {activeCases.map(c => (
                                        <button 
                                            key={c.id} 
                                            onClick={() => { setSelectedCaseId(c.id); setDashboardSubPage('cases'); }}
                                            className="w-full text-left text-sm p-2.5 rounded-lg bg-white dark:bg-black/20 border border-cla-border dark:border-white/5 hover:border-cla-gold dark:hover:border-cla-gold/50 transition-colors flex items-center justify-between group shadow-sm"
                                        >
                                            <span className="truncate font-medium text-cla-text dark:text-gray-300">{c.title}</span>
                                            <BriefcaseIcon className="w-4 h-4 text-gray-400 group-hover:text-cla-gold" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-cla-surface dark:bg-cla-surface-dark rounded-lg border-2 border-dashed border-cla-border dark:border-cla-border-dark">
                    <UserGroupIcon className="w-16 h-16 mx-auto text-cla-text-muted dark:text-cla-text-muted-dark opacity-50" />
                    <h3 className="mt-4 text-xl font-semibold text-cla-text dark:text-cla-text-dark">No Clients Yet</h3>
                    <p className="mt-1 text-cla-text-muted dark:text-cla-text-muted-dark">Clients will appear here once you are assigned to a case.</p>
                </div>
            )}
        </div>
    );
};
