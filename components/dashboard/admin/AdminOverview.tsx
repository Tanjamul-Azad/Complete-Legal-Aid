
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import { UserGroupIcon, BriefcaseIcon, VerificationIcon, BanknotesIcon, GavelIcon } from '../../icons';

const StatCard: React.FC<{ icon: React.ReactNode, value: number | string, label: string, color: string }> = ({ icon, value, label, color }) => (
    <div className="bg-white dark:bg-cla-surface-dark p-6 rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm flex items-center gap-4">
        <div className={`p-4 rounded-full ${color} text-white`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-cla-text dark:text-white">{value}</p>
            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">{label}</p>
        </div>
    </div>
);

export const AdminOverview: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { users, cases } = context;

    const stats = useMemo(() => {
        return {
            totalUsers: users.length,
            citizens: users.filter(u => u.role === 'citizen').length,
            lawyers: users.filter(u => u.role === 'lawyer').length,
            pendingVerifications: users.filter(u => u.verificationStatus === 'Pending').length,
            activeCases: cases.filter(c => c.status !== 'Resolved').length,
            revenue: '৳ 1.2M' // Simulated
        };
    }, [users, cases]);

    const recentUsers = [...users].reverse().slice(0, 5);

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-cla-text dark:text-white">System Overview</h1>
                <p className="text-cla-text-muted dark:text-cla-text-muted-dark mt-1">Platform statistics and administrative monitoring.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={<UserGroupIcon className="w-6 h-6" />} 
                    value={stats.totalUsers} 
                    label="Total Users" 
                    color="bg-blue-500" 
                />
                <StatCard 
                    icon={<BriefcaseIcon className="w-6 h-6" />} 
                    value={stats.activeCases} 
                    label="Active Cases" 
                    color="bg-purple-500" 
                />
                <StatCard 
                    icon={<VerificationIcon className="w-6 h-6" />} 
                    value={stats.pendingVerifications} 
                    label="Pending Verifications" 
                    color="bg-orange-500" 
                />
                <StatCard 
                    icon={<BanknotesIcon className="w-6 h-6" />} 
                    value={stats.revenue} 
                    label="Platform Revenue (Est)" 
                    color="bg-green-600" 
                />
            </div>

            {/* Secondary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Registrations */}
                <div className="bg-white dark:bg-cla-surface-dark rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-cla-border dark:border-cla-border-dark flex justify-between items-center">
                        <h3 className="text-lg font-bold text-cla-text dark:text-white">Recent Registrations</h3>
                        <button className="text-xs font-bold text-cla-gold hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-white/5 text-xs uppercase text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cla-border dark:divide-cla-border-dark">
                                {recentUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                                            <div>
                                                <p className="font-medium text-cla-text dark:text-white">{u.name}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 capitalize">{u.role}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                u.verificationStatus === 'Verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                u.verificationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                            }`}>
                                                {u.verificationStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Health (Mock) */}
                <div className="bg-white dark:bg-cla-surface-dark rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm p-6">
                    <h3 className="text-lg font-bold text-cla-text dark:text-white mb-6">Platform Health</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-cla-text dark:text-white">Server Uptime</span>
                                <span className="text-sm font-medium text-green-500">99.9%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-cla-text dark:text-white">Lawyer Verification Queue</span>
                                <span className="text-sm font-medium text-orange-500">{stats.pendingVerifications} Pending</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-cla-text dark:text-white">Active Chat Sessions</span>
                                <span className="text-sm font-medium text-blue-500">42 Live</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-cla-border dark:border-cla-border-dark flex gap-4">
                        <button className="flex-1 py-2 bg-gray-100 dark:bg-white/5 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">System Logs</button>
                        <button className="flex-1 py-2 bg-gray-100 dark:bg-white/5 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">Audit Trail</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
