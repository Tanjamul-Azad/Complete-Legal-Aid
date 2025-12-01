
import React, { useContext, useMemo } from 'react';
import type { Message, User, DashboardSubPage } from '../../types';
import { AppContext } from '../../context/AppContext';
import { MessageIcon } from '../icons';

const formatTime = (timestamp: number) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export const InboxPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    allUsers: User[];
    markAllAsRead: () => void;
    markConversationAsRead: (senderId: string) => void;
}> = ({ isOpen, onClose, messages, allUsers, markAllAsRead, markConversationAsRead }) => {
    const context = useContext(AppContext);

    const conversations = useMemo(() => {
        if (!context?.user) return [];

        const conversationsMap: Map<string, {
            participant: User;
            latestMessage: Message;
            unreadCount: number;
        }> = new Map();

        const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp);

        for (const message of sortedMessages) {
            const otherParticipantId = message.senderId === context.user.id ? message.receiverId : message.senderId;
            const participant = allUsers.find(u => u.id === otherParticipantId);

            if (!participant || otherParticipantId === context.user.id) continue;

            if (!conversationsMap.has(otherParticipantId)) {
                conversationsMap.set(otherParticipantId, {
                    participant,
                    latestMessage: message,
                    unreadCount: 0,
                });
            }
        }

        for (const message of messages) {
            if (message.receiverId === context.user.id && !message.read) {
                const conversation = conversationsMap.get(message.senderId);
                if (conversation) {
                    conversation.unreadCount += 1;
                }
            }
        }

        return Array.from(conversationsMap.values());
    }, [messages, context?.user, allUsers]);

    if (!isOpen || !context) return null;

    const { setDashboardSubPage, setSelectedCaseId } = context;

    const handleConversationClick = (conversation: (typeof conversations)[0]) => {
        markConversationAsRead(conversation.participant.id);

        if (conversation.latestMessage.caseId) {
            setSelectedCaseId(conversation.latestMessage.caseId);
            setDashboardSubPage('cases');
        } else {
            setDashboardSubPage('cases'); // Fallback to main cases view
        }
        onClose();
    };

    const handleViewAll = () => {
        setDashboardSubPage('cases');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-transparent z-40" onClick={onClose}>
            <div
                className="absolute top-20 right-48 w-96 max-w-[calc(100vw-2rem)] bg-cla-surface dark:bg-[#111111] rounded-xl shadow-modal-light dark:shadow-modal-dark border border-cla-border dark:border-[rgba(255,255,255,0.1)] flex flex-col animate-scale-in"
                onClick={e => e.stopPropagation()}
                style={{ transformOrigin: 'top right' }}
            >
                <header className="p-4 flex justify-between items-center border-b border-cla-border dark:border-[rgba(255,255,255,0.1)] sticky top-0 bg-cla-surface/80 dark:bg-[#111111]/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-cla-text dark:text-white">Inbox</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
                            title="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-cla-text-muted dark:text-cla-text-muted-dark">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <button onClick={markAllAsRead} className="text-xs font-semibold text-cla-gold hover:underline">Mark all as read</button>
                </header>

                <div className="flex-1 overflow-y-auto" style={{ maxHeight: '380px' }}>
                    {conversations.length > 0 ? (
                        <div className="divide-y divide-cla-border dark:divide-[rgba(255,255,255,0.07)]">
                            {conversations.map((convo, index) => {
                                const isUnread = convo.unreadCount > 0;
                                return (
                                    <button
                                        key={convo.participant.id}
                                        onClick={() => handleConversationClick(convo)}
                                        className={`w-full text-left p-4 transition-colors duration-150 ${isUnread ? 'bg-cla-gold/5 dark:bg-[rgba(245,166,35,0.18)]' : ''} hover:bg-cla-gold/10 dark:hover:bg-[rgba(255,255,255,0.06)]`}
                                        style={{ animation: `fadeInUp 0.3s ease-out ${index * 40}ms forwards`, opacity: 0 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={convo.participant.avatar} alt={convo.participant.name} className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-cla-border dark:border-white/10" />
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex justify-between items-baseline">
                                                    <p className={`font-semibold truncate ${isUnread ? 'text-cla-text dark:text-white' : 'text-cla-text dark:text-cla-text-dark'}`}>{convo.participant.name}</p>
                                                    <p className="text-xs text-cla-text-muted dark:text-[#A0A0A0] flex-shrink-0 ml-2">{formatTime(convo.latestMessage.timestamp)}</p>
                                                </div>
                                                <p className={`text-sm truncate ${isUnread ? 'text-cla-text-muted dark:text-[#C9C9C9]' : 'text-cla-text-muted dark:text-cla-text-muted-dark'}`}>{convo.latestMessage.text}</p>
                                            </div>
                                            {isUnread && <div className="w-2.5 h-2.5 bg-cla-gold rounded-full self-center flex-shrink-0 animate-pulse-dot"></div>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4">
                            <MessageIcon className="w-12 h-12 mx-auto text-cla-text-muted dark:text-cla-text-muted-dark opacity-50" />
                            <h4 className="mt-4 font-semibold text-cla-text dark:text-white">Your inbox is empty</h4>
                            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-1">New messages will appear here.</p>
                        </div>
                    )}
                </div>

                <footer className="p-2 text-center text-sm border-t border-cla-border dark:border-[rgba(255,255,255,0.1)] sticky bottom-0 bg-cla-surface/80 dark:bg-[#111111]/80 backdrop-blur-sm z-10">
                    <button onClick={handleViewAll} className="w-full font-semibold text-cla-gold hover:underline p-2 rounded-lg">
                        View All Messages →
                    </button>
                </footer>
            </div>
        </div>
    );
};
