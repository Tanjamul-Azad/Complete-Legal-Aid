import React, { useState, useContext } from 'react';
import type { User, VerificationStatus } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import { UserProfileDetailModal } from '../../admin/UserProfileDetailModal';

export const AdminVerification: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { users, updateUserVerification } = context;

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const pendingUsers = users.filter(u => u.verificationStatus === 'Pending');

    return (
        <div className="bg-cla-bg dark:bg-cla-surface-dark p-6 rounded-lg border border-cla-border dark:border-cla-border-dark">
            <h2 className="text-2xl font-bold text-cla-text dark:text-cla-text-dark mb-6">User Verification Requests ({pendingUsers.length})</h2>
            {pendingUsers.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-cla-text-muted dark:text-cla-text-muted-dark">
                        <thead className="text-xs text-cla-text dark:text-cla-text-dark uppercase bg-cla-surface dark:bg-cla-bg-dark">
                            <tr>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Documents</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingUsers.map(u => (
                                <tr key={u.id} className="bg-cla-bg dark:bg-cla-surface-dark border-b border-cla-border dark:border-cla-border-dark">
                                    <th scope="row" className="px-6 py-4 font-medium text-cla-text dark:text-white whitespace-nowrap">
                                        <button onClick={() => setSelectedUser(u)} className="flex items-center space-x-3 text-left hover:bg-cla-surface dark:hover:bg-cla-bg-dark p-2 rounded-lg -m-2 transition-colors duration-200">
                                            <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover"/>
                                            <div>
                                                <p className="hover:underline">{u.name}</p>
                                                <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark">{u.email}</p>
                                            </div>
                                        </button>
                                    </th>
                                    <td className="px-6 py-4 capitalize">{u.role}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">{u.verificationStatus}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.verificationDocs && u.verificationDocs.length > 0 ? (
                                            <a href={u.verificationDocs[0].url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{u.verificationDocs[0].name}</a>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <button onClick={() => updateUserVerification(u.id, 'Verified')} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700">Approve</button>
                                        <button onClick={() => updateUserVerification(u.id, 'Rejected')} className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700">Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No pending verification requests.</p>
            )}
             {selectedUser && (
                <UserProfileDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}
        </div>
    )
}