
import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../../../context/AppContext';
import { SendIcon, PaperClipIcon, ChevronLeftIcon, ClockIcon, BuildingOfficeIcon, ScaleIcon, DocumentTextIcon, CalendarIcon, UserCircleIcon, CloseIcon } from '../../icons';

const CaseParticularsEditModal: React.FC<{ isOpen: boolean; onClose: () => void; data: any }> = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would submit to an API
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#050816] border border-cla-border dark:border-cla-border-dark shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-cla-border dark:border-cla-border-dark">
                    <h3 className="text-sm font-semibold text-cla-text dark:text-white">
                        Edit Case Particulars
                    </h3>
                    <button onClick={onClose} className="text-cla-text-muted hover:text-cla-text dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1.5 font-medium text-cla-text-muted dark:text-cla-text-muted-dark">Court Name</label>
                            <input className="w-full rounded-lg border border-cla-border dark:border-cla-border-dark bg-gray-50 dark:bg-[#111] px-3 py-2.5 text-cla-text dark:text-white focus:ring-2 focus:ring-cla-gold focus:border-transparent outline-none transition-all" defaultValue={data.court} />
                        </div>
                        <div>
                            <label className="block mb-1.5 font-medium text-cla-text-muted dark:text-cla-text-muted-dark">Case Number</label>
                            <input className="w-full rounded-lg border border-cla-border dark:border-cla-border-dark bg-gray-50 dark:bg-[#111] px-3 py-2.5 text-cla-text dark:text-white focus:ring-2 focus:ring-cla-gold focus:border-transparent outline-none transition-all" defaultValue={data.caseNo} />
                        </div>
                        <div>
                            <label className="block mb-1.5 font-medium text-cla-text-muted dark:text-cla-text-muted-dark">Presiding Judge</label>
                            <input className="w-full rounded-lg border border-cla-border dark:border-cla-border-dark bg-gray-50 dark:bg-[#111] px-3 py-2.5 text-cla-text dark:text-white focus:ring-2 focus:ring-cla-gold focus:border-transparent outline-none transition-all" defaultValue={data.judge} />
                        </div>
                        <div>
                            <label className="block mb-1.5 font-medium text-cla-text-muted dark:text-cla-text-muted-dark">Next Hearing</label>
                            <input className="w-full rounded-lg border border-cla-border dark:border-cla-border-dark bg-gray-50 dark:bg-[#111] px-3 py-2.5 text-cla-text dark:text-white focus:ring-2 focus:ring-cla-gold focus:border-transparent outline-none transition-all" defaultValue={data.nextHearing} />
                        </div>
                        <div>
                            <label className="block mb-1.5 font-medium text-cla-text-muted dark:text-cla-text-muted-dark">Relevant Acts</label>
                            <input className="w-full rounded-lg border border-cla-border dark:border-cla-border-dark bg-gray-50 dark:bg-[#111] px-3 py-2.5 text-cla-text dark:text-white focus:ring-2 focus:ring-cla-gold focus:border-transparent outline-none transition-all" defaultValue={data.acts} />
                        </div>
                        <div>
                            <label className="block mb-1.5 font-medium text-cla-text-muted dark:text-cla-text-muted-dark">Filing Date</label>
                            <input className="w-full rounded-lg border border-cla-border dark:border-cla-border-dark bg-gray-50 dark:bg-[#111] px-3 py-2.5 text-cla-text dark:text-white focus:ring-2 focus:ring-cla-gold focus:border-transparent outline-none transition-all" defaultValue={data.filingDate} />
                        </div>
                    </div>

                    <p className="mt-2 text-[11px] text-cla-text-muted dark:text-cla-text-muted-dark italic">
                        These updates will be synced to the client's view once saved.
                    </p>

                    <div className="pt-4 flex justify-end gap-3 border-t border-cla-border dark:border-cla-border-dark mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-xs font-semibold text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-full text-xs font-semibold bg-cla-gold text-cla-text hover:bg-cla-gold-darker shadow-md hover:shadow-lg transition-all">
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const LawyerCaseDetail: React.FC<{ caseId: string }> = ({ caseId }) => {
    const { user, users: allUsers, cases, messages, evidenceDocuments, handleSendMessage, setDashboardSubPage } = useContext(AppContext);
    const [newMessage, setNewMessage] = useState('');
    const [privateNote, setPrivateNote] = useState('');
    const [isEditParticularsOpen, setIsEditParticularsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const selectedCase = cases.find(c => c.id === caseId);
    if (!selectedCase || !user) return <div>Loading...</div>;

    const client = allUsers.find(u => u.id === selectedCase.clientId);
    const caseDocs = evidenceDocuments.filter(doc => doc.caseId === caseId);
    const caseMessages = messages.filter(msg => msg.caseId === caseId).sort((a, b) => a.timestamp - b.timestamp);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [caseMessages.length]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && client) {
            handleSendMessage(client.id, newMessage, selectedCase.id);
            setNewMessage('');
        }
    };

    // Simulate "Real Life" Case Metadata (In a real app, these would be in the Case object)
    // NOTE: This structure matches what is used in CitizenCaseDetail.tsx
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
        <div className="animate-fade-in h-[calc(100vh-140px)] flex flex-col">
            {/* Breadcrumb Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <button onClick={() => setDashboardSubPage('cases')} className="hover:text-cla-gold flex items-center gap-1 transition-colors">
                        <ChevronLeftIcon className="w-4 h-4" /> Back to Cases
                    </button>
                    <span>/</span>
                    <span className="text-cla-text dark:text-white font-medium truncate max-w-md">{selectedCase.title}</span>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        selectedCase.status === 'In Review' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                        selectedCase.status === 'Scheduled' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                        {selectedCase.status}
                    </span>
                </div>
            </div>

            {/* Main Split Layout: 2/3 Case Info, 1/3 Chat */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                
                {/* Left Column: Case Information (66%) */}
                <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
                    
                    {/* 1. Client Context Card */}
                    <div className="bg-white dark:bg-cla-surface-dark p-5 rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img src={client?.avatar || 'https://via.placeholder.com/150'} alt={client?.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100 dark:ring-white/10" />
                            <div>
                                <h3 className="text-lg font-bold text-cla-text dark:text-white">{client?.name || 'Unknown Client'}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <span className="flex items-center gap-1"><UserCircleIcon className="w-3 h-3"/> Client ID: #{client?.id.slice(0,6)}</span>
                                    <span>•</span>
                                    <span>{client?.phone || 'No Phone'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <button className="px-4 py-2 bg-cla-bg dark:bg-cla-bg-dark border border-cla-border dark:border-cla-border-dark text-sm font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                View Profile
                            </button>
                        </div>
                    </div>

                    {/* 2. Case Particulars (Metadata) */}
                    <div className="bg-white dark:bg-cla-surface-dark p-6 rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <ScaleIcon className="w-5 h-5 text-cla-gold" />
                                <h3 className="text-md font-bold text-cla-text dark:text-white">
                                    Case Particulars
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsEditParticularsOpen(true)}
                                className="inline-flex items-center gap-1 rounded-full border border-cla-border dark:border-cla-border-dark px-3 py-1 text-[11px] font-medium text-cla-text-muted dark:text-cla-text-muted-dark hover:border-cla-gold hover:text-cla-gold transition-colors"
                            >
                                ✏️ Edit
                            </button>
                        </div>
                        
                        <p className="mb-4 text-[11px] text-cla-text-muted dark:text-cla-text-muted-dark">
                            Changes here will be visible to the client in their case details.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
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

                    {/* 3. Private Attorney Notes */}
                    <div className="bg-amber-50 dark:bg-yellow-900/10 p-6 rounded-xl border border-amber-100 dark:border-yellow-700/20 shadow-sm">
                        <h3 className="text-md font-bold text-amber-900 dark:text-amber-500 mb-2 flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5" />
                            Private Attorney Notes
                        </h3>
                        <textarea 
                            className="w-full bg-white/50 dark:bg-black/20 border border-amber-200 dark:border-yellow-700/30 rounded-lg p-3 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-amber-400 focus:outline-none min-h-[100px]"
                            placeholder="Enter internal notes, strategy points, or reminders..."
                            value={privateNote}
                            onChange={(e) => setPrivateNote(e.target.value)}
                        />
                    </div>

                    {/* 4. Description & Documents */}
                    <div className="bg-white dark:bg-cla-surface-dark p-6 rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm">
                        <h3 className="text-md font-bold text-cla-text dark:text-white mb-3">Case Description</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">
                            {selectedCase.description}
                        </p>
                        
                        <div className="border-t border-cla-border dark:border-cla-border-dark pt-4">
                            <h4 className="font-bold text-sm text-cla-text dark:text-white mb-3 flex items-center gap-2">
                                Evidence & Documents <span className="bg-gray-100 dark:bg-white/10 text-xs px-2 py-0.5 rounded-full">{caseDocs.length}</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {caseDocs.map(doc => (
                                    <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5 hover:border-cla-gold/50 transition-colors group">
                                        <div className="p-2 bg-white dark:bg-white/10 rounded-md text-cla-gold">
                                            <DocumentTextIcon className="w-5 h-5" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="truncate text-sm font-medium text-cla-text dark:text-gray-200">{doc.name}</p>
                                            <p className="text-xs text-gray-500">{(doc.size/1024/1024).toFixed(2)} MB</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Messaging Sidebar (33%) */}
                <div className="lg:col-span-1 bg-white dark:bg-cla-surface-dark rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm flex flex-col overflow-hidden h-full">
                    {/* Chat Header */}
                    <div className="p-3 border-b border-cla-border dark:border-cla-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold text-cla-text dark:text-white">Client Chat</span>
                        </div>
                        <button className="text-xs text-cla-gold font-medium hover:underline">View Profile</button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-white dark:bg-[#0B0B0B]">
                        {caseMessages.map((msg) => {
                            const isMe = msg.senderId === user.id;
                            // Use actual avatars or placeholders
                            const avatarSrc = isMe ? user.avatar : (client?.avatar || 'https://via.placeholder.com/40');
                            
                            return (
                                <div key={msg.id} className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {/* Client Avatar (Left) */}
                                    {!isMe && (
                                        <img src={avatarSrc} alt="Client" className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-white/10 flex-shrink-0" />
                                    )}

                                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                                        isMe 
                                        ? 'bg-cla-gold text-white rounded-tr-none' 
                                        : 'bg-gray-100 dark:bg-[#1E1E1E] text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-white/5'
                                    }`}>
                                        <p>{msg.text}</p>
                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/80 text-right' : 'text-gray-400 text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>

                                    {/* Lawyer Avatar (Right) */}
                                    {isMe && (
                                        <img src={avatarSrc} alt="Me" className="w-8 h-8 rounded-full object-cover border border-cla-gold/30 flex-shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Composer */}
                    <div className="p-3 border-t border-cla-border dark:border-cla-border-dark bg-gray-50/50 dark:bg-white/[0.02]">
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <button type="button" className="p-2 text-gray-400 hover:text-cla-gold transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                                <PaperClipIcon className="w-5 h-5" />
                            </button>
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type message..." 
                                className="flex-1 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-cla-gold dark:text-white shadow-sm"
                            />
                            <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-cla-gold text-white rounded-full hover:bg-cla-gold-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                                <SendIcon className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <CaseParticularsEditModal isOpen={isEditParticularsOpen} onClose={() => setIsEditParticularsOpen(false)} data={caseMetadata} />
        </div>
    );
};
