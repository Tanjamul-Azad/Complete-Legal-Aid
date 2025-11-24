
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import { MessageIcon, ClockIcon, SearchIcon, BriefcaseIcon } from '../../icons';

export const CitizenMessages: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { user, messages, users: allUsers, setDashboardSubPage, setSelectedCaseId, markConversationAsRead, cases } = context;

    const conversations = useMemo(() => {
        if (!user) return [];
        const conversationsMap: Map<string, any> = new Map();
        const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp);

        for (const message of sortedMessages) {
            const otherParticipantId = message.senderId === user.id ? message.receiverId : message.senderId;
            const participant = allUsers.find(u => u.id === otherParticipantId);
            if (!participant || otherParticipantId === user.id) continue;

            // Find related case if any
            const relatedCase = message.caseId ? cases.find(c => c.id === message.caseId) : null;

            if (!conversationsMap.has(otherParticipantId)) {
                conversationsMap.set(otherParticipantId, {
                    participant,
                    latestMessage: message,
                    unreadCount: 0,
                    relatedCase
                });
            }
        }
        
        // Calc unreads
        for (const message of messages) {
            if (message.receiverId === user.id && !message.read) {
                const conversation = conversationsMap.get(message.senderId);
                if (conversation) conversation.unreadCount += 1;
            }
        }
        return Array.from(conversationsMap.values());
    }, [messages, user, allUsers, cases]);

    const handleChatClick = (convo: any) => {
        markConversationAsRead(convo.participant.id);
        if (convo.latestMessage.caseId) {
            setSelectedCaseId(convo.latestMessage.caseId);
            setDashboardSubPage('cases');
        } else {
            // Fallback to cases if not specific
            setDashboardSubPage('cases');
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-cla-text dark:text-white">Messages</h1>
                    <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-1">
                        Secure communications with your legal representatives.
                    </p>
                </div>
                <div className="relative hidden sm:block">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search messages..." 
                        className="pl-9 pr-4 py-2 bg-white dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark rounded-full text-sm focus:ring-2 focus:ring-cla-gold focus:border-transparent w-64 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-cla-surface-dark rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm overflow-hidden">
                {conversations.length > 0 ? (
                    <div className="divide-y divide-cla-border dark:divide-cla-border-dark">
                        {conversations.map((convo) => (
                            <div 
                                key={convo.participant.id} 
                                onClick={() => handleChatClick(convo)}
                                className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-5 group"
                            >
                                <div className="relative flex-shrink-0">
                                    <img src={convo.participant.avatar} alt={convo.participant.name} className="w-14 h-14 rounded-full object-cover border border-gray-200 dark:border-white/10" />
                                    {convo.unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-[#111]">
                                            {convo.unreadCount}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1.5">
                                        <div className="flex items-center gap-3">
                                            <h3 className={`text-lg truncate ${convo.unreadCount > 0 ? 'font-bold text-cla-text dark:text-white' : 'font-medium text-cla-text dark:text-gray-200'}`}>
                                                {convo.participant.name}
                                            </h3>
                                            {convo.relatedCase && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 uppercase tracking-wide">
                                                    <BriefcaseIcon className="w-3 h-3" />
                                                    {convo.relatedCase.id}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <ClockIcon className="w-3 h-3" />
                                            {new Date(convo.latestMessage.timestamp).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate pr-4 ${convo.unreadCount > 0 ? 'text-cla-text dark:text-white font-medium' : 'text-gray-500'}`}>
                                        {convo.latestMessage.senderId === user?.id ? <span className="text-gray-400">You: </span> : ''}{convo.latestMessage.text}
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-cla-gold">
                                    <MessageIcon className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <MessageIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-semibold text-cla-text dark:text-white">No messages yet</h3>
                        <p className="text-sm text-gray-500 mt-1">Conversations will appear here once you start a case.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
