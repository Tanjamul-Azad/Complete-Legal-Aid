
import React, { useContext, useMemo } from 'react';
import type { EvidenceDocument } from '../../types';
import { AppContext } from '../../context/AppContext';
import { CloseIcon, TrashIcon, FileIcon, ImageIcon, PdfIcon, WordIcon, CaseIcon, CalendarIcon } from '../icons';

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-10 h-10 text-teal-500" />;
    if (fileType === 'application/pdf') return <PdfIcon className="w-10 h-10 text-red-500" />;
    if (fileType.includes('wordprocessing')) return <WordIcon className="w-10 h-10 text-blue-500" />;
    return <FileIcon className="w-10 h-10 text-gray-500" />;
};

interface FilePreviewPanelProps {
    document: EvidenceDocument;
    onClose: () => void;
    onDelete: () => void;
}

export const FilePreviewPanel: React.FC<FilePreviewPanelProps> = ({ document, onClose, onDelete }) => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { cases } = context;
    const associatedCase = useMemo(() => cases.find(c => c.id === document.caseId), [cases, document]);
    const isImage = document.type.startsWith('image/');

    const handleDownload = () => {
        // In a real app, this would trigger a download from a secure URL.
        // For simulation with blob URLs, this creates a link and clicks it.
        const a = window.document.createElement('a');
        a.href = document.url;
        a.download = document.name;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={onClose}></div>
            <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-cla-bg dark:bg-cla-bg-dark shadow-2xl z-50 flex flex-col animate-slide-in-right">
                <header className="p-4 flex justify-between items-center border-b border-cla-border dark:border-cla-border-dark flex-shrink-0">
                    <h3 className="font-bold text-lg text-cla-text dark:text-cla-text-dark">File Preview</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-cla-surface dark:hover:bg-cla-surface-dark">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center gap-4 mb-6">
                        {getFileIcon(document.type)}
                        <div>
                            <h4 className="text-xl font-semibold text-cla-text dark:text-white break-all">{document.name}</h4>
                            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    
                    <div className="bg-cla-surface dark:bg-cla-surface-dark rounded-xl border border-cla-border dark:border-cla-border-dark mb-6">
                        <div className="p-4 flex items-center gap-3 border-b border-cla-border dark:border-cla-border-dark">
                            <CaseIcon className="w-5 h-5 text-cla-text-muted dark:text-cla-text-muted-dark" />
                            <span className="text-sm text-cla-text dark:text-white">Associated Case: <span className="font-semibold">{associatedCase?.title || 'N/A'}</span></span>
                        </div>
                        <div className="p-4 flex items-center gap-3">
                            <CalendarIcon className="w-5 h-5 text-cla-text-muted dark:text-cla-text-muted-dark" />
                            <span className="text-sm text-cla-text dark:text-white">Date Uploaded: <span className="font-semibold">{new Date(document.uploadedAt).toLocaleString()}</span></span>
                        </div>
                    </div>

                    <h5 className="font-semibold text-cla-text dark:text-white mb-2">Preview</h5>
                    <div className="bg-cla-surface dark:bg-cla-surface-dark rounded-xl border border-cla-border dark:border-cla-border-dark p-4 min-h-[200px] flex items-center justify-center">
                        {isImage ? (
                            <img src={document.url} alt="File preview" className="max-w-full max-h-96 rounded-md object-contain" />
                        ) : (
                            <div className="text-center text-cla-text-muted dark:text-cla-text-muted-dark">
                                <p>No preview available for this file type.</p>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-4 flex justify-end gap-3 border-t border-cla-border dark:border-cla-border-dark flex-shrink-0">
                    <button onClick={onDelete} className="px-4 py-2 text-sm font-semibold rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        Delete
                    </button>
                    <button onClick={handleDownload} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-br from-cla-gold to-cla-gold-dark text-cla-text hover:from-cla-gold-light hover:to-cla-gold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95">
                        Download
                    </button>
                </footer>
            </div>
        </>
    );
};
