import React, { useContext, useState } from 'react';
import { AppContext } from '../../../context/AppContext';
import { UserGroupIcon, SearchIcon, TrashIcon } from '../../icons';
import { User } from '../../../types';
import { VerifiedName } from '../../ui/VerifiedName';
import { UserProfileDetailModal } from '../../admin/UserProfileDetailModal';

export const AdminUsers: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { users, deleteUser } = context;

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'citizen' | 'lawyer'>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await deleteUser(userId);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-cla-text dark:text-white flex items-center gap-2">
                        <UserGroupIcon className="w-8 h-8 text-cla-gold" />
                        User Management
                    </h1>
                    <p className="text-cla-text-muted dark:text-cla-text-muted-dark text-sm mt-1">Manage all registered citizens and lawyers.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg border border-cla-border dark:border-cla-border-dark bg-white dark:bg-cla-surface-dark text-sm focus:ring-2 focus:ring-cla-gold focus:outline-none"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="px-4 py-2 rounded-lg border border-cla-border dark:border-cla-border-dark bg-white dark:bg-cla-surface-dark text-sm focus:ring-2 focus:ring-cla-gold focus:outline-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="citizen">Citizens</option>
                        <option value="lawyer">Lawyers</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-cla-surface-dark rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 text-xs uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cla-border dark:divide-cla-border-dark">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <VerifiedName
                                                name={u.name}
                                                isVerified={u.verificationStatus === 'Verified'}
                                                className="font-medium text-cla-text dark:text-white"
                                                gapClassName="gap-1"
                                            />
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 capitalize">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'lawyer' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.verificationStatus === 'Verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                            u.verificationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                            }`}>
                                            {u.verificationStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {/* Mock date since it's not in User type yet, or use a random one */}
                                        2023-10-27
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedUser(u)}
                                            className="text-cla-gold hover:underline font-medium text-xs"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            title="Delete User"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <UserProfileDetailModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};
