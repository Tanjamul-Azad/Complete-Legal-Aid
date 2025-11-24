import React, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import type { User, Case, EvidenceDocument } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import { VaultIcon, UploadIcon, TrashIcon, FileIcon, ImageIcon, PdfIcon, WordIcon, FolderLockIcon, LockClosedIcon } from '../../icons';
import { ConfirmationModal } from '../../ui/ConfirmationModal';
import { FilePreviewPanel } from '../FilePreviewPanel';

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-teal-500 dark:text-teal-400 flex-shrink-0" />;
    if (fileType === 'application/pdf') return <PdfIcon className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" />;
    if (fileType.includes('wordprocessing')) return <WordIcon className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />;
    return <FileIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />;
};

export const LawyerVault: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { user, cases, evidenceDocuments, handleDeleteDocument } = context;
    
    const lawyerCaseIds = useMemo(() => user ? new Set(cases.filter(c => c.lawyerId === user.id).map(c => c.id)) : new Set(), [cases, user]);
    const lawyerDocuments = useMemo(() => evidenceDocuments.filter(doc => lawyerCaseIds.has(doc.caseId)).sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()), [evidenceDocuments, lawyerCaseIds]);
    
    const [docToDelete, setDocToDelete] = useState<EvidenceDocument | null>(null);
    const [previewingDoc, setPreviewingDoc] = useState<EvidenceDocument | null>(null);

    const confirmDelete = () => {
        if (docToDelete) {
            handleDeleteDocument(docToDelete.id);
            if (previewingDoc?.id === docToDelete.id) {
                setPreviewingDoc(null);
            }
            setDocToDelete(null);
        }
    };
    
    if (!user) return null;

    return (
        <div className="animate-fade-in relative">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-cla-text dark:text-white">Evidence Vault</h1>
                    <p className="text-md text-[#A5A5A5] mt-1">Review documents across all your assigned cases.</p>
                </div>
            </div>

            <div className="bg-cla-surface dark:bg-[#111111] rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-[rgba(255,255,255,0.05)] shadow-xl shadow-gray-500/5 dark:shadow-black/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#FFFFFF] dark:bg-[#111111] text-xs uppercase text-[#555555] dark:text-[#BBBBBB] border-b border-[#E5E5E5] dark:border-[rgba(255,255,255,0.07)]">
                            <tr>
                                <th className="px-6 py-4 font-medium">File Name</th>
                                <th className="px-6 py-4 font-medium">Associated Case</th>
                                <th className="px-6 py-4 font-medium">Date Uploaded</th>
                                <th className="px-6 py-4 font-medium">Size</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lawyerDocuments.map((doc, index) => {
                                const associatedCase = cases.find(c => c.id === doc.caseId);
                                const isSelected = previewingDoc?.id === doc.id;
                                return (
                                <tr 
                                    key={doc.id} 
                                    className={`group border-b border-[#E5E5E5] dark:border-[rgba(255,255,255,0.05)] last:border-b-0 transition-colors duration-200 ${isSelected ? 'bg-cla-gold/5 dark:bg-cla-gold/10' : 'hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'}`}
                                    style={{ animation: 'fadeInUp 0.3s ease-out forwards', animationDelay: `${index * 50}ms`, opacity: 0}}
                                >
                                    <td className="px-6 py-4 font-medium flex items-center gap-3 text-cla-text dark:text-white">
                                        {getFileIcon(doc.type)}
                                        <button onClick={() => setPreviewingDoc(doc)} className="hover:underline text-left">{doc.name}</button>
                                    </td>
                                    <td className="px-6 py-4 text-[#757575] dark:text-[#A9A9A9]"><button onClick={() => context.setSelectedCaseId(doc.caseId)}>{associatedCase?.title || 'N/A'}</button></td>
                                    <td className="px-6 py-4 text-[#757575] dark:text-[#A9A9A9]">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-[#757575] dark:text-[#A9A9A9]">{(doc.size / 1024 / 1024).toFixed(2)} MB</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setDocToDelete(doc)} title="Delete file" className="p-1.5 text-cla-text-muted dark:text-gray-500 rounded-md hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-colors">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {lawyerDocuments.length === 0 && (
                    <div className="text-center py-20 animate-fade-in-up">
                        <FolderLockIcon className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-700" />
                        <h3 className="mt-4 text-xl font-semibold text-cla-text dark:text-white">Vault is empty</h3>
                        <p className="mt-1 text-cla-text-muted dark:text-cla-text-muted-dark">No documents have been uploaded to your cases yet.</p>
                    </div>
                )}
            </div>
            
            <ConfirmationModal
                isOpen={!!docToDelete}
                onClose={() => setDocToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete this document?"
                message="This action cannot be undone. The document will be permanently removed from the vault."
                confirmText="Delete"
                variant="destructive"
            />
            
            {previewingDoc && (
                <FilePreviewPanel document={previewingDoc} onClose={() => setPreviewingDoc(null)} onDelete={() => setDocToDelete(previewingDoc)} />
            )}
        </div>
    );
};
