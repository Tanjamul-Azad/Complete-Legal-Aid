import React from 'react';
import type { User } from '../../types';
import { CloseIcon, UploadIcon } from '../icons';

export const UserProfileDetailModal: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-cla-bg dark:bg-cla-surface-dark rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                <header className="p-4 border-b border-cla-border dark:border-cla-border-dark flex justify-between items-center sticky top-0 bg-cla-bg dark:bg-cla-surface-dark z-10">
                    <h2 className="text-xl font-bold text-cla-text dark:text-cla-text-dark">User Profile Details</h2>
                    <button onClick={onClose} className="text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark">
                        <CloseIcon />
                    </button>
                </header>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="flex-shrink-0 text-center md:w-1/3">
                            <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full mx-auto object-cover mb-4 ring-4 ring-cla-gold/50" />
                            <h3 className="text-2xl font-bold text-cla-text dark:text-cla-text-dark">{user.name}</h3>
                            <p className="capitalize text-cla-text-muted dark:text-cla-text-muted-dark">{user.role}</p>
                            <span className="mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">{user.verificationStatus}</span>
                        </div>
                        <div className="flex-grow w-full md:w-2/3 border-t md:border-t-0 md:border-l border-cla-border dark:border-cla-border-dark pt-4 md:pt-0 md:pl-6">
                            <h4 className="font-bold text-lg text-cla-text dark:text-cla-text-dark mb-3">Contact Information</h4>
                            <div className="space-y-2 text-sm">
                                <p><strong className="font-medium text-cla-text-muted dark:text-cla-text-muted-dark w-24 inline-block">Email:</strong> {user.email}</p>
                                <p><strong className="font-medium text-cla-text-muted dark:text-cla-text-muted-dark w-24 inline-block">Phone:</strong> {user.phone || 'N/A'}</p>
                            </div>
                            
                            {user.role === 'lawyer' && (
                                <>
                                    <h4 className="font-bold text-lg text-cla-text dark:text-cla-text-dark mt-6 mb-3">Professional Details</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><strong className="font-medium text-cla-text-muted dark:text-cla-text-muted-dark w-32 inline-block">Bar Council ID:</strong> {user.lawyerId || 'N/A'}</p>
                                        <p><strong className="font-medium text-cla-text-muted dark:text-cla-text-muted-dark w-32 inline-block">Specializations:</strong> {user.specializations?.join(', ') || 'N/A'}</p>
                                        <p><strong className="font-medium text-cla-text-muted dark:text-cla-text-muted-dark w-32 inline-block">Experience:</strong> {user.experience ? `${user.experience} years` : 'N/A'}</p>
                                        <p><strong className="font-medium text-cla-text-muted dark:text-cla-text-muted-dark w-32 inline-block">Bio:</strong> {user.bio || 'N/A'}</p>
                                    </div>
                                </>
                            )}

                             <h4 className="font-bold text-lg text-cla-text dark:text-cla-text-dark mt-6 mb-3">Verification Documents</h4>
                             {user.verificationDocs && user.verificationDocs.length > 0 ? (
                                <a href={user.verificationDocs[0].url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm flex items-center gap-2">
                                    <UploadIcon className="w-4 h-4" />
                                    {user.verificationDocs[0].name}
                                </a>
                            ) : <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">No documents uploaded.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
