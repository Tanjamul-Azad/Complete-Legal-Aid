import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Message, User } from '../../types';
import {
    SendIcon, PaperClipIcon, MicIcon, PhoneIcon,
    CloseIcon, SearchIcon, CheckCircleIcon, VerifiedIcon
} from '../icons';

interface SecureChatWidgetProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    messages: Message[];
    allUsers: User[];
    onSendMessage: (text: string, receiverId: string) => void;
    markConversationAsRead: (senderId: string) => void;
    initialSelectedUser?: User | null;
}

const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
};

export const SecureChatWidget: React.FC<SecureChatWidgetProps> = ({
    isOpen, onClose, currentUser, messages, allUsers, onSendMessage, markConversationAsRead, initialSelectedUser
}) => {
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Update active conversation when initialSelectedUser changes or widget opens
    useEffect(() => {
        if (isOpen && initialSelectedUser) {
            setActiveConversationId(initialSelectedUser.id);
        }
    }, [isOpen, initialSelectedUser]);

    // Group messages by conversation
    const conversations = useMemo(() => {
        const map = new Map<string, { user: User, lastMessage: Message, unread: number }>();

        // Sort messages to get latest first
        const sorted = [...messages].sort((a, b) => b.timestamp - a.timestamp);

        sorted.forEach(msg => {
            const otherId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
            if (otherId === currentUser.id) return; // Should not happen based on logic, but safety check

            // Try to find user in allUsers, or check if it matches initialSelectedUser
            let otherUser = allUsers.find(u => u.id === otherId);
            if (!otherUser && initialSelectedUser && initialSelectedUser.id === otherId) {
                otherUser = initialSelectedUser;
            }

            if (!otherUser) return;

            if (!map.has(otherId)) {
                map.set(otherId, {
                    user: otherUser,
                    lastMessage: msg,
                    unread: 0
                });
            }

            if (msg.receiverId === currentUser.id && !msg.read) {
                const entry = map.get(otherId)!;
                entry.unread++;
            }
        });

        return Array.from(map.values());
    }, [messages, currentUser, allUsers, initialSelectedUser]);

    // Set active conversation if only one exists or none selected
    useEffect(() => {
        if (isOpen && !activeConversationId && conversations.length > 0) {
            setActiveConversationId(conversations[0].user.id);
        }
    }, [isOpen, conversations, activeConversationId]);

    // Mark as read when opening conversation
    useEffect(() => {
        if (isOpen && activeConversationId) {
            markConversationAsRead(activeConversationId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, activeConversationId]);

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeConversationId, isOpen]);

    const activeUser = allUsers.find(u => u.id === activeConversationId) ||
        (initialSelectedUser && initialSelectedUser.id === activeConversationId ? initialSelectedUser : undefined);

    const activeMessages = useMemo(() => {
        if (!activeConversationId) return [];
        return messages.filter(m =>
            (m.senderId === currentUser.id && m.receiverId === activeConversationId) ||
            (m.senderId === activeConversationId && m.receiverId === currentUser.id)
        ).sort((a, b) => a.timestamp - b.timestamp);
    }, [messages, currentUser, activeConversationId]);

    const handleSend = () => {
        if (!inputText.trim() || !activeConversationId) return;
        onSendMessage(activeConversationId, inputText);
        setInputText('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 pointer-events-none">
            {/* Backdrop for mobile */}
            <div className="absolute inset-0 bg-black/20 sm:bg-transparent pointer-events-auto sm:pointer-events-none" onClick={onClose} />

            {/* Widget Container */}
            <div className="pointer-events-auto w-full sm:w-[800px] h-[85vh] sm:h-[600px] bg-white dark:bg-[#111111] rounded-t-2xl sm:rounded-2xl shadow-2xl flex overflow-hidden border border-gray-200 dark:border-white/10 animate-slide-up sm:animate-scale-in origin-bottom-right">

                {/* Sidebar (Conversation List) */}
                <div className={`${activeConversationId ? 'hidden sm:flex' : 'flex'} w-full sm:w-1/3 flex-col border-r border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#161616]`}>
                    <div className="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 dark:text-white">Messages</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full">
                            <CloseIcon className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">No conversations yet</div>
                        ) : (
                            conversations.map(({ user, lastMessage, unread }) => (
                                <div
                                    key={user.id}
                                    onClick={() => setActiveConversationId(user.id)}
                                    className={`p-3 cursor-pointer hover:bg-white dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 ${activeConversationId === user.id ? 'bg-white dark:bg-white/5 border-l-4 border-l-cla-gold' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">{user.name}</h4>
                                                <span className="text-[10px] text-gray-500">{formatTime(lastMessage.timestamp)}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">{lastMessage.text}</p>
                                        </div>
                                        {unread > 0 && (
                                            <div className="w-5 h-5 rounded-full bg-cla-gold text-white text-[10px] flex items-center justify-center font-bold">
                                                {unread}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`${!activeConversationId ? 'hidden sm:flex' : 'flex'} flex-1 flex-col bg-white dark:bg-[#111111] w-full sm:w-2/3`}>
                    {activeUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setActiveConversationId(null)} className="sm:hidden p-1 -ml-2 text-gray-500">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <div className="relative">
                                        <img src={activeUser.avatar} alt={activeUser.name} className="w-10 h-10 rounded-full object-cover" />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#111111] rounded-full"></span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{activeUser.name}</h3>
                                        <p className="text-xs text-green-500">Online</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                    <CloseIcon className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-black/20">
                                {activeMessages.map((msg, index) => {
                                    const isMe = msg.senderId === currentUser.id;
                                    const showDate = index === 0 || formatDate(msg.timestamp) !== formatDate(activeMessages[index - 1].timestamp);

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDate && (
                                                <div className="flex justify-center my-4">
                                                    <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-medium">
                                                        {formatDate(msg.timestamp)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] ${isMe ? 'order-1' : 'order-2'}`}>
                                                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${isMe
                                                        ? 'bg-cla-gold text-white rounded-tr-none'
                                                        : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-white/5'
                                                        }`}>
                                                        {msg.text}
                                                    </div>
                                                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span>{formatTime(msg.timestamp)}</span>
                                                        {isMe && (
                                                            msg.read ? <div className="text-blue-500"><CheckCircleIcon className="w-3 h-3" /></div> : <div className="text-gray-300"><CheckCircleIcon className="w-3 h-3" /></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white dark:bg-[#111111] border-t border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-xl border border-gray-200 dark:border-white/10 focus-within:border-cla-gold/50 focus-within:ring-2 focus-within:ring-cla-gold/20 transition-all">
                                    <button className="p-2 text-gray-400 hover:text-cla-gold transition-colors">
                                        <PaperClipIcon className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!inputText.trim()}
                                        className="p-2 bg-cla-gold text-white rounded-lg hover:bg-cla-gold-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-cla-gold/20"
                                    >
                                        <SendIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <VerifiedIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a conversation</h3>
                            <p className="text-sm max-w-xs">Choose a person from the list to start chatting or view your message history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
