
import React, { useContext, useState, useRef, useEffect } from 'react';
import type { User, Case, EvidenceDocument, Message } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import { SendIcon, StarIcon, UploadIcon, DocumentCloudIcon, BriefcaseIcon, VerifiedIcon, ChatBubbleLeftRightIcon, PaperClipIcon, LinkIcon, ScaleIcon, CalendarIcon, UserCircleIcon, DocumentTextIcon, SparklesIcon } from '../../icons';

const formatDateDivider = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1.5 p-2 bg-gray-100 dark:bg-cla-surface-dark rounded-full self-start">
        <span className="w-1.5 h-1.5 bg-cla-text-muted rounded-full animate-bounce-dot [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-cla-text-muted rounded-full animate-bounce-dot [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-cla-text-muted rounded-full animate-bounce-dot"></span>
    </div>
);

export const CitizenCaseDetail: React.FC<{
    caseId: string;
}> = ({ caseId }) => {
    const context = useContext(AppContext);

    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    if (!context) return <div>Loading...</div>;
    const { user, users: allUsers, cases, messages, setReviewTarget, handleSendMessage, evidenceDocuments, handleDocumentUpload, setDashboardSubPage, typingLawyers } = context;

    if (!user) return <div>Loading...</div>;

    const selectedCase = cases.find(c => c.id === caseId);
    if (!selectedCase) return <div>Case not found.</div>;

    const lawyer = allUsers.find(u => u.id === selectedCase.lawyerId);
    const caseDocuments = evidenceDocuments.filter(doc => doc.caseId === caseId);
    const caseMessages = messages.filter(msg => msg.caseId === caseId).sort((a, b) => a.timestamp - b.timestamp);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        setTimeout(scrollToBottom, 100);
    }, [caseMessages.length, typingLawyers[caseId]]);
    
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            const maxHeight = 120;
            textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        }
    }, [newMessage]);


    const handleFileSelectAndSend = (file: File) => {
        if (file && selectedCase) {
            const newDoc = handleDocumentUpload(file, selectedCase.id);
            if (lawyer) {
                handleSendMessage(lawyer.id, `Attached file: ${newDoc.name}`, selectedCase.id, {
                    name: newDoc.name,
                    url: newDoc.url,
                    size: newDoc.size,
                });
            }
        }
    };
    
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && lawyer && selectedCase) {
            handleSendMessage(lawyer.id, newMessage, selectedCase.id);
            setNewMessage('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(e as any);
        }
    };

    const getStatusPillClasses = (status: Case['status']) => {
        switch (status) {
            case 'Submitted': return 'bg-cla-gold/20 text-cla-gold dark:bg-cla-gold/25 dark:text-cla-gold-light';
            case 'In Review': return 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400';
            case 'Scheduled': return 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400';
            case 'Resolved': return 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    let lastDate: string | null = null;
    let lastSenderId: string | null = null;

    // Mock Data for Case Particulars (in real app, these would come from selectedCase props)
    const caseMetadata = {
        court: "Dhaka District Judge Court",
        caseNo: `TS-${selectedCase.id.toUpperCase()}/2023`,
        judge: "Hon. Justice Rahim Uddin",
        filingDate: new Date(selectedCase.submittedDate).toLocaleDateString(),
        nextHearing: "Nov 12, 2024 (10:30 AM)",
        acts: "Section 144, Penal Code 1860",
        category: "Civil Litigation"
    };
    
    return (
        <div className="animate-fade-in">
            <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="animate-slide-in-left">
                    <h1 className="text-3xl font-bold text-cla-text dark:text-cla-text-dark">{selectedCase.title}</h1>
                    <p className="text-cla-text-muted dark:text-cla-text-muted-dark mt-1">Case ID: {selectedCase.id}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1.5 text-sm font-bold rounded-full animate-slide-in-right ${getStatusPillClasses(selectedCase.status)}`}>
                        {selectedCase.status}
                    </div>
                     {selectedCase.status === 'Resolved' && !selectedCase.reviewed && lawyer && (
                        <button 
                            onClick={() => setReviewTarget({ lawyerId: lawyer.id, source: { type: 'case', id: selectedCase.id } })}
                            className="bg-cla-gold text-cla-text font-bold py-2 px-4 rounded-md hover:bg-cla-gold-darker transition-colors flex items-center justify-center gap-2 animate-fade-in"
                            style={{ animationDelay: '100ms'}}
                        >
                            <StarIcon className="w-5 h-5" />
                            Rate Experience
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* 1. Case Particulars */}
                    <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl shadow-lg shadow-gray-500/5 dark:shadow-black/20 border border-cla-border dark:border-white/5 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-4">
                            <ScaleIcon className="w-5 h-5 text-cla-gold" />
                            <h3 className="text-md font-bold text-cla-text dark:text-white">Case Particulars</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Court Name</p>
                                <p className="text-sm font-medium text-cla-text dark:text-white mt-1">{caseMetadata.court}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Case Number</p>
                                <p className="text-sm font-medium text-cla-text dark:text-white mt-1 font-mono bg-gray-100 dark:bg-white/5 inline-block px-2 py-0.5 rounded">{caseMetadata.caseNo}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Presiding Judge</p>
                                <p className="text-sm font-medium text-cla-text dark:text-white mt-1">{caseMetadata.judge}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Next Hearing</p>
                                <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                                    <CalendarIcon className="w-4 h-4"/> {caseMetadata.nextHearing}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Relevant Acts</p>
                                <p className="text-sm font-medium text-cla-text dark:text-white mt-1">{caseMetadata.acts}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Filing Date</p>
                                <p className="text-sm font-medium text-cla-text dark:text-white mt-1">{caseMetadata.filingDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Case Description */}
                    <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl shadow-lg shadow-gray-500/5 dark:shadow-black/20 border border-cla-border dark:border-white/5 animate-fade-in-up" style={{ animationDelay: '100ms'}}>
                        <h3 className="text-lg font-bold text-[#444] dark:text-gray-200 mb-3">Case Description</h3>
                        <p className="text-cla-text-muted dark:text-cla-text-muted-dark leading-relaxed whitespace-pre-wrap">{selectedCase.description}</p>
                    </div>

                    {/* 3. Legal Analysis Report (Visible only if generated) */}
                    <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl shadow-lg shadow-gray-500/5 dark:shadow-black/20 border border-cla-border dark:border-white/5 animate-fade-in-up" style={{ animationDelay: '150ms'}}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-purple-500" />
                                <h3 className="text-lg font-bold text-[#444] dark:text-gray-200">Legal Analysis Report</h3>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full font-medium">Ready</span>
                        </div>
                        <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mb-4">
                            Your lawyer has generated a preliminary legal analysis for this case.
                        </p>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-white/10 rounded-lg text-purple-500">
                                    <DocumentTextIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-cla-text dark:text-white text-sm">Preliminary Legal Assessment.pdf</p>
                                    <p className="text-xs text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg text-sm font-semibold text-cla-text dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                Download
                            </button>
                        </div>
                    </div>

                    {/* 4. Evidence & Documents */}
                    <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl shadow-lg shadow-gray-500/5 dark:shadow-black/20 border border-cla-border dark:border-white/5 animate-fade-in-up" style={{ animationDelay: '200ms'}}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[#444] dark:text-gray-200">
                                Evidence & Documents (<span key={caseDocuments.length} className="inline-block animate-scale-in">{caseDocuments.length}</span>)
                            </h3>
                             <button onClick={() => setDashboardSubPage('vault')} className="text-sm font-semibold text-cla-gold hover:underline">Manage All</button>
                        </div>
                        {caseDocuments.length > 0 ? (
                             <ul className="space-y-3 mt-4">
                                {caseDocuments.slice(0, 3).map(doc => (
                                    <li key={doc.id} className="flex items-center justify-between p-3 bg-cla-bg dark:bg-cla-surface-dark rounded-md">
                                        <div className="flex items-center gap-3">
                                            <DocumentCloudIcon className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium text-cla-text dark:text-white hover:text-cla-gold transition-colors">{doc.name}</a>
                                                <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark">Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-cla-text-muted dark:text-cla-text-muted-dark">
                                <DocumentCloudIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-white/10" />
                                <p className="mt-4 font-medium">No documents yet.</p>
                                <p className="text-sm">Upload files via the communication panel.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (1/3): Lawyer & Chat */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Lawyer Info Card */}
                    <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-lg shadow-gray-500/5 dark:shadow-black/20 border border-cla-border dark:border-white/5 overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms'}}>
                        <div className="p-5 border-b border-cla-border dark:border-white/10">
                            <h3 className="font-bold text-cla-text dark:text-white">Assigned Lawyer</h3>
                        </div>
                        <div className="p-5">
                            {lawyer ? (
                                <div className="flex flex-col items-center text-center">
                                    <img src={lawyer.avatar} alt={lawyer.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-cla-gold/10 mb-3" />
                                    <h4 className="text-lg font-bold text-cla-text dark:text-white flex items-center gap-1">
                                        {lawyer.name}
                                        <VerifiedIcon className="w-4 h-4 text-blue-500" />
                                    </h4>
                                    <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mb-4">{lawyer.specializations?.[0] || 'Legal Consultant'}</p>
                                    
                                    <div className="w-full flex gap-2">
                                        <button className="flex-1 py-2 bg-cla-gold text-cla-text text-sm font-bold rounded-lg hover:bg-cla-gold-darker transition-colors">
                                            Profile
                                        </button>
                                        <button className="flex-1 py-2 border border-cla-border dark:border-white/10 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            Call
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-gray-500">No lawyer assigned yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Communication */}
                    <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-lg shadow-gray-500/5 dark:shadow-black/20 border border-cla-border dark:border-white/5 h-[500px] flex flex-col animate-fade-in-up" style={{ animationDelay: '400ms'}}>
                         {/* Header */}
                        <div className="p-4 border-b border-cla-border dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-gray-50/50 dark:bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-cla-gold" />
                                <span className="font-bold text-sm text-cla-text dark:text-white">Secure Chat</span>
                            </div>
                            {lawyer && <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online</span>}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                           {!lawyer ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-cla-text-muted dark:text-cla-text-muted-dark">
                                    <BriefcaseIcon strokeWidth={1} className="w-16 h-16 text-gray-300 dark:text-white/10" />
                                    <h4 className="font-bold mt-4">Chat unavailable</h4>
                                    <p className="text-sm mt-1">A lawyer must be assigned to start communication.</p>
                                    <button onClick={() => setDashboardSubPage('find-lawyers')} className="mt-4 px-4 py-2 text-sm font-semibold bg-cla-gold text-cla-text rounded-lg hover:bg-cla-gold-darker transition-colors">Find a Lawyer</button>
                                </div>
                           ) : caseMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center text-cla-text-muted dark:text-cla-text-muted-dark animate-fade-in">
                                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 dark:text-white/10" />
                                    <h4 className="font-bold text-sm mt-4">Start a Conversation</h4>
                                    <p className="text-xs mt-1 max-w-xs">Send a message to your assigned lawyer.</p>
                                </div>
                           ) : (
                                <div className="space-y-4">
                                {caseMessages.map((msg, index) => {
                                    const isUser = msg.senderId === user.id;
                                    const currentMessageDate = formatDateDivider(msg.timestamp);
                                    const showDateDivider = currentMessageDate !== lastDate;
                                    lastDate = currentMessageDate;

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDateDivider && (
                                                <div className="text-center text-[10px] uppercase tracking-wider font-bold text-gray-400 my-4">{currentMessageDate}</div>
                                            )}
                                            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${isUser ? 'bg-cla-gold text-white rounded-br-none' : 'bg-gray-100 dark:bg-[#1E1E1E] text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-white/5'}`}>
                                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                                    {msg.attachment && (
                                                        <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg hover:bg-black/20 dark:hover:bg-white/20 transition-colors">
                                                            <PaperClipIcon className="w-4 h-4 flex-shrink-0"/>
                                                            <span className="text-xs font-medium truncate">{msg.attachment.name}</span>
                                                        </a>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-1 px-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                                {typingLawyers[caseId] && <TypingIndicator />}
                                </div>
                           )}
                           <div ref={messagesEndRef} />
                        </div>

                         {/* Input */}
                        <div className="p-3 border-t border-cla-border dark:border-white/10 flex-shrink-0 bg-gray-50/50 dark:bg-white/[0.02]">
                            <form onSubmit={handleSend} className="relative flex items-end gap-2">
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!lawyer} className="p-2.5 text-gray-400 hover:text-cla-gold transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50">
                                    <PaperClipIcon className="w-5 h-5" />
                                </button>
                                <textarea
                                    ref={textareaRef}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={lawyer ? "Type message..." : ""}
                                    className="flex-1 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-cla-gold dark:text-white shadow-sm resize-none max-h-32 custom-scrollbar"
                                    rows={1}
                                    disabled={!lawyer}
                                />
                                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileSelectAndSend(e.target.files[0])} className="hidden" />
                                <button type="submit" disabled={!newMessage.trim() || !lawyer} className="p-2.5 bg-cla-gold text-white rounded-full hover:bg-cla-gold-darker disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all shadow-md">
                                    <SendIcon className="w-4 h-4"/>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
