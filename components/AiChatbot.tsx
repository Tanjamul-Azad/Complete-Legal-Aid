import React, { useState, useRef, useEffect } from 'react';
import { streamChatResponse } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { SendIcon, CloseIcon, TrashIcon, RetryIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon, SparklesIcon, MicIcon } from './icons';
import { ConfirmationModal } from './ui/ConfirmationModal';

interface AiChatbotProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onHireLawyerClick: () => void;
}

const CHAT_HISTORY_KEY = 'cla-aichat-history';

const getInitialMessages = (): ChatMessage[] => {
    try {
        const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
        if (savedHistory) {
            const parsed = JSON.parse(savedHistory);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Could not load chat history:", error);
    }
    return [{ sender: 'ai', text: '👋 Hello! I’m your legal assistant.\nHow can I help you today?' }];
};

const TypingEffect: React.FC<{ text: string }> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');
    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const intervalId = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(intervalId);
            }
        }, 15);
        return () => clearInterval(intervalId);
    }, [text]);

    return <>{displayedText}<span className="inline-block w-0.5 h-4 bg-cla-gold align-middle ml-1 animate-blinking-cursor"></span></>;
};

const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5 p-2">
        <span className="w-2 h-2 bg-cla-gold rounded-full animate-bounce-dot [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-cla-gold rounded-full animate-bounce-dot [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-cla-gold rounded-full animate-bounce-dot"></span>
    </div>
);


export const AiChatbot: React.FC<AiChatbotProps> = ({ isOpen, setIsOpen, onHireLawyerClick }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        try {
            if (messages.length > 1 || (messages.length === 1 && messages[0].text !== getInitialMessages()[0].text)) {
                localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
            } else {
                 localStorage.removeItem(CHAT_HISTORY_KEY);
            }
        } catch (error) {
            console.error("Could not save chat history:", error);
        }
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, isMaximized]);

    const sendMessage = async (prompt: string) => {
        if (prompt.trim() === '' || isLoading) return;

        setIsLoading(true);
        let updatedMessages = messages.filter(m => !m.error);

        const lastMessage = updatedMessages[updatedMessages.length - 1];
        const lastMessageIsPrompt = lastMessage?.sender === 'user' && lastMessage?.text === prompt;
        if (!lastMessageIsPrompt) {
            updatedMessages.push({ sender: 'user', text: prompt });
        }
        
        if (input === prompt) {
            setInput('');
        }

        updatedMessages.push({ sender: 'ai', text: '' });
        setMessages(updatedMessages);

        let fullResponse = '';
        try {
            for await (const chunk of streamChatResponse(prompt)) {
                fullResponse += chunk;
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg?.sender === 'ai') {
                        return [...prev.slice(0, -1), { ...lastMsg, text: fullResponse }];
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Error streaming response from Gemini:", error);
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.sender === 'ai') {
                    return [...prev.slice(0, -1), { ...lastMsg, text: "I'm sorry, an error occurred. Please try again.", error: true, originalPrompt: prompt }];
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSend = () => sendMessage(input);
    const handleRetry = (promptToRetry?: string) => promptToRetry && sendMessage(promptToRetry);
    const handleStarterPromptClick = (prompt: string) => {
        setInput(prompt);
        sendMessage(prompt);
    };

    const confirmClearChat = () => {
        localStorage.removeItem(CHAT_HISTORY_KEY);
        setMessages([{ sender: 'ai', text: '👋 Hello! I’m your legal assistant.\nHow can I help you today?' }]);
        setClearConfirmOpen(false);
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    if (!isOpen) return null;
    
    const starterPrompts = [
        "How do I file a GD in Bangladesh?",
        "Explain 'Section 54' in simple terms.",
        "What should I do in a land dispute?",
    ];

    return (
        <>
        {isMaximized && <div className="fullscreen-backdrop" onClick={() => setIsMaximized(false)}></div>}
        <div 
            className={`fixed bottom-5 right-5 bg-cla-surface dark:bg-cla-surface-dark shadow-2xl rounded-2xl flex flex-col z-50 transition-all duration-300 ease-in-out border border-cla-border dark:border-cla-border-dark/50
                ${isMaximized ? 'w-[calc(100%-40px)] max-w-4xl h-[calc(100vh-40px)]' : 'w-full max-w-[360px] h-[75vh] min-h-[400px] max-h-[700px] animate-scale-in'}
            `}
        >
            <header className="p-4 bg-cla-surface dark:bg-gradient-to-b dark:from-cla-surface-dark dark:to-cla-bg-dark flex justify-between items-center rounded-t-2xl border-b border-cla-border dark:border-cla-gold/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-cla-gold rounded-full animate-pulse-dot"></span>
                    <h3 className="font-bold text-lg text-cla-text dark:text-cla-text-dark">AI Legal Assistant</h3>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setClearConfirmOpen(true)} title="Clear chat history" className="p-2 text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark transition-transform hover:scale-110 active:scale-95">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                     <button onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? 'Minimize' : 'Maximize'} className="p-2 text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark transition-transform hover:scale-110 active:scale-95">
                        {isMaximized ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} title="Close chat" className="p-2 text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark transition-transform hover:scale-110 active:scale-95">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>
            <div className={`relative flex-1 p-4 ${isMaximized ? 'md:p-8' : ''} overflow-y-auto custom-scrollbar fade-bottom`}>
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-gradient-to-r from-cla-gold to-cla-gold-darker text-white rounded-br-none shadow-lg shadow-cla-gold/20' : 'bg-gray-100 dark:bg-cla-border-dark border border-black/5 dark:border-white/10 text-cla-text dark:text-cla-text-dark rounded-bl-none'} ${msg.error ? 'bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700' : ''}`}>
                                <div className={`text-sm whitespace-pre-wrap break-words ${msg.error ? 'text-red-700 dark:text-red-300' : ''}`}>
                                    {msg.sender === 'ai' && !msg.error ? (
                                        isLoading && index === messages.length - 1 ? <TypingIndicator /> : <TypingEffect text={msg.text} />
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                                {msg.error && (
                                    <button onClick={() => handleRetry(msg.originalPrompt)} className="mt-2 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                        <RetryIcon className="w-4 h-4" />
                                        Retry
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                     {messages.length === 1 && (
                        <div className="pt-4 animate-fade-in" style={{animationDelay: '300ms'}}>
                            <p className="text-sm font-medium text-cla-text-muted dark:text-cla-text-muted-dark mb-2">Try asking things like:</p>
                            <div className="space-y-2">
                                {starterPrompts.map(prompt => (
                                    <button key={prompt} onClick={() => handleStarterPromptClick(prompt)} className="w-full text-left p-3 text-sm rounded-lg bg-gray-100 dark:bg-cla-border-dark hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-cla-text dark:text-cla-text-dark">
                                        "{prompt}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 border-t border-cla-border dark:border-white/10">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a legal question..."
                        className="w-full pl-4 pr-20 py-3 border border-cla-border dark:border-cla-border-dark rounded-full bg-gray-50 dark:bg-cla-border-dark text-cla-text dark:text-cla-text-dark focus:outline-none focus:ring-2 focus:ring-cla-gold focus:border-cla-gold shadow-sm"
                        disabled={isLoading}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button className="p-2 text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-gold transition-colors"><MicIcon className="w-5 h-5"/></button>
                        <button 
                            onClick={handleSend} 
                            disabled={isLoading || !input.trim()} 
                            className="group p-2.5 rounded-full bg-gradient-to-br from-cla-gold to-cla-gold-darker text-white shadow-lg shadow-cla-gold/20
                                       hover:shadow-xl hover:shadow-cla-gold/40 hover:brightness-110
                                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cla-surface-dark focus:ring-cla-gold
                                       disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:shadow-none
                                       transition-all duration-300 transform active:scale-90 disabled:transform-none"
                        >
                            <SendIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
                        </button>
                    </div>
                </div>
                <div className="mt-3 text-center px-4">
                     <div className="w-full h-px bg-cla-border dark:bg-white/5 mb-3"></div>
                    <button onClick={onHireLawyerClick} className="group text-xs text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-gold dark:hover:text-cla-gold transition-colors inline-flex items-center gap-1.5">
                        <SparklesIcon className="w-4 h-4 text-cla-gold/50 group-hover:text-cla-gold transition-colors" />
                        Need a human lawyer? <span className="font-semibold relative after:content-[''] after:absolute after:bg-cla-gold after:bottom-0 after:left-0 after:h-px after:w-full after:origin-bottom-right after:scale-x-0 group-hover:after:scale-x-100 group-hover:after:origin-bottom-left after:transition-transform after:duration-300 after:ease-out">Hire certified experts here →</span>
                    </button>
                </div>
            </div>
             <ConfirmationModal
                isOpen={isClearConfirmOpen}
                onClose={() => setClearConfirmOpen(false)}
                onConfirm={confirmClearChat}
                title="Clear Conversation"
                message="Are you sure you want to clear the chat history? This action cannot be undone."
                confirmText="Clear"
                variant="destructive"
            />
        </div>
        </>
    );
};
