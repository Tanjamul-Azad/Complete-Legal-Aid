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

const UploadingRow: React.FC<{ fileName: string }> = ({ fileName }) => (
    <tr className="border-b border-cla-border-dark/5 last:border-b-0">
        <td colSpan={5} className="p-0">
            <div className="p-4 flex flex-col gap-2">
                <div className="font-medium flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                    <span className="text-cla-text-muted dark:text-cla-text-muted-dark">{fileName}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full w-full animate-shimmer" style={{
                        backgroundImage: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                        backgroundSize: '1000px 100%',
                    }}></div>
                </div>
                <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark">Processing file...</p>
            </div>
        </td>
    </tr>
);


export const CitizenVault: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { user, cases, evidenceDocuments, handleDocumentUpload, handleDeleteDocument } = context;
    
    const userCaseIds = useMemo(() => user ? new Set(cases.filter(c => c.clientId === user.id).map(c => c.id)) : new Set(), [cases, user]);
    const userDocuments = useMemo(() => evidenceDocuments.filter(doc => userCaseIds.has(doc.caseId)).sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()), [evidenceDocuments, userCaseIds]);
    const userCases = useMemo(() => cases.filter(c => c.clientId === user?.id), [cases, user]);

    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
    const [docToDelete, setDocToDelete] = useState<EvidenceDocument | null>(null);
    const [previewingDoc, setPreviewingDoc] = useState<EvidenceDocument | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const caseId = userCases[0]?.id; 
            if (caseId) {
                simulateUpload(file, caseId);
            } else {
                context.setToast({ message: "You must have at least one case to upload documents.", type: 'error' });
            }
        }
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const caseId = userCases[0]?.id;
            if (caseId) {
                simulateUpload(file, caseId);
            } else {
                context.setToast({ message: "You must have at least one case to upload documents.", type: 'error' });
            }
        }
    };

    const simulateUpload = (file: File, caseId: string) => {
        setUploadingFiles(prev => [...prev, file]);
        setTimeout(() => {
            handleDocumentUpload(file, caseId);
            setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
        }, 2000); // Simulate 2 seconds upload time
    };
    
    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        if (isEntering) {
            setIsDragging(true);
        } else {
            setTimeout(() => setIsDragging(false), 100);
        }
    };

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
        <div 
            className="animate-fade-in relative"
            onDragEnter={(e) => handleDragEvents(e, true)}
        >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-cla-text dark:text-white">Evidence Vault</h1>
                    <p className="text-md text-[#A5A5A5] mt-1 flex items-center gap-1.5">
                        <LockClosedIcon className="w-4 h-4" /> End-to-end encrypted • Secure evidence storage
                    </p>
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-br from-cla-gold to-cla-gold-dark text-cla-text font-semibold rounded-lg shadow-lg shadow-cla-gold/30 hover:shadow-xl hover:shadow-cla-gold/40 hover:brightness-110 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cla-bg-dark focus:ring-cla-gold-light whitespace-nowrap"
                >
                    <UploadIcon className="w-5 h-5" />
                    Upload Document
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
            </div>

            <div className="bg-cla-surface dark:bg-[#111111] rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-[rgba(255,255,255,0.05)] shadow-xl shadow-gray-500/5 dark:shadow-black/40">
                <div className="flex justify-end items-center px-6 py-3 border-b border-[#E5E5E5] dark:border-[rgba(255,255,255,0.07)]">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-500">
                        <LockClosedIcon className="w-4 h-4" /> Stored using AES-256 encryption
                    </p>
                </div>
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
                            {uploadingFiles.map((file, index) => <UploadingRow key={`${file.name}-${index}`} fileName={file.name} />)}

                            {userDocuments.map((doc, index) => {
                                const associatedCase = cases.find(c => c.id === doc.caseId);
                                const isSelected = previewingDoc?.id === doc.id;
                                return (
                                <tr 
                                    key={doc.id} 
                                    className={`group border-b border-[#E5E5E5] dark:border-[rgba(255,255,255,0.05)] last:border-b-0 transition-colors duration-200 ${isSelected ? 'bg-cla-gold/5 dark:bg-cla-gold/10' : 'hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'}`}
                                    style={{ animation: 'fadeInUp 0.3s ease-out forwards', animationDelay: `${index * 50}ms`, opacity: 0}}
                                >
                                    <td className="px-6 py-4 font-medium flex items-center gap-3 text-cla-text dark:text-white">
                                        <div className="transform transition-transform duration-200 group-hover:rotate-[-2deg] group-hover:scale-110">{getFileIcon(doc.type)}</div>
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
                {userDocuments.length === 0 && uploadingFiles.length === 0 && (
                    <div className="text-center py-20 animate-fade-in-up">
                        <FolderLockIcon className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-700" />
                        <h3 className="mt-4 text-xl font-semibold text-cla-text dark:text-white">No documents yet</h3>
                        <p className="mt-1 text-cla-text-muted dark:text-cla-text-muted-dark">Upload your first legal document to get started.</p>
                        <button onClick={() => fileInputRef.current?.click()} className="mt-6 flex items-center justify-center gap-2 mx-auto px-5 py-3 bg-gradient-to-br from-cla-gold to-cla-gold-dark text-cla-text font-semibold rounded-lg shadow-lg shadow-cla-gold/30 hover:shadow-xl hover:shadow-cla-gold/40 hover:brightness-110 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cla-bg-dark focus:ring-cla-gold-light">
                            <UploadIcon className="w-5 h-5" />
                            Upload Document
                        </button>
                    </div>
                )}
            </div>

            {isDragging && (
                <div 
                    className="fixed inset-0 bg-cla-gold/10 z-50 flex items-center justify-center p-8 pointer-events-none"
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <div className="w-full h-full border-4 border-dashed border-cla-gold rounded-3xl flex flex-col items-center justify-center pointer-events-auto">
                        <UploadIcon className="w-24 h-24 text-cla-gold" />
                        <p className="mt-4 text-2xl font-bold text-cla-gold-darker dark:text-cla-gold">Drop files to upload</p>
                    </div>
                </div>
            )}
            
            <ConfirmationModal
                isOpen={!!docToDelete}
                onClose={() => setDocToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete this document?"
                message="This action cannot be undone. The document will be permanently removed from your vault."
                confirmText="Delete"
                variant="destructive"
            />
            
            {previewingDoc && (
                <FilePreviewPanel document={previewingDoc} onClose={() => setPreviewingDoc(null)} onDelete={() => setDocToDelete(previewingDoc)} />
            )}
        </div>
    );
};
