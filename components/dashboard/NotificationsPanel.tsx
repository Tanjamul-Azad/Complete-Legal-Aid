
import React from 'react';
import type { Notification, NotificationType, DashboardSubPage } from '../../types';
import { BellIcon, BriefcaseIcon, VerificationIcon, CalendarIcon, SettingsIcon, WarningIcon, MessageIcon } from '../icons';

const getNotificationIcon = (type: NotificationType) => {
    const props = { className: "w-5 h-5" };
    switch (type) {
        case 'case_update': return <BriefcaseIcon {...props} />;
        case 'verification': return <VerificationIcon {...props} />;
        case 'appointment': return <CalendarIcon {...props} />;
        case 'system': return <SettingsIcon {...props} />;
        case 'deadline': return <WarningIcon {...props} />;
        case 'new_message': return <MessageIcon {...props} />;
        default: return <BellIcon {...props} />;
    }
};

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

export const NotificationsPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    handleNotificationNavigation: (notification: Notification) => void;
    markAllAsRead: () => void;
    setDashboardSubPage: (page: DashboardSubPage) => void;
}> = ({ isOpen, onClose, notifications, handleNotificationNavigation, markAllAsRead, setDashboardSubPage }) => {

    if (!isOpen) return null;

    const handleClick = (notification: Notification) => {
        if (notification.link) {
            handleNotificationNavigation(notification);
        }
        onClose();
    };

    const handleViewAll = () => {
        setDashboardSubPage('notifications');
        onClose();
    };

    const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="fixed inset-0 bg-transparent z-40" onClick={onClose}>
            <div 
                className="absolute top-20 right-36 w-96 max-w-[calc(100vw-2rem)] bg-cla-surface dark:bg-[#111111] rounded-xl shadow-modal-light dark:shadow-modal-dark border border-cla-border dark:border-cla-border-dark flex flex-col animate-scale-in"
                onClick={e => e.stopPropagation()}
                style={{ transformOrigin: 'top right' }}
            >
                <header className="p-4 flex justify-between items-center border-b border-cla-border dark:border-[rgba(255,255,255,0.1)] sticky top-0 bg-cla-surface/80 dark:bg-[#111111]/80 backdrop-blur-sm z-10">
                    <h3 className="font-bold text-cla-text dark:text-white">Notifications</h3>
                    <button onClick={markAllAsRead} className="text-xs font-semibold text-cla-gold hover:underline">Mark all as read</button>
                </header>
                
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: '380px' }}>
                     {sortedNotifications.length > 0 ? (
                        <div className="divide-y divide-cla-border dark:divide-[rgba(255,255,255,0.07)]">
                            {sortedNotifications.map((notif, index) => (
                                <button 
                                    key={notif.id}
                                    onClick={() => handleClick(notif)}
                                    disabled={!notif.link}
                                    className={`w-full text-left p-4 transition-colors duration-150 ${!notif.read ? 'bg-cla-gold/5 dark:bg-cla-gold/15' : ''} ${notif.link ? 'hover:bg-cla-gold/10 dark:hover:bg-cla-gold/20' : 'cursor-default'}`}
                                    style={{ animation: `fadeInUp 0.3s ease-out ${index * 40}ms forwards`, opacity: 0}}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 flex-shrink-0 ${notif.read ? 'text-cla-text-muted dark:text-cla-text-muted-dark' : 'text-cla-gold'}`}>
                                            {getNotificationIcon(notif.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm ${!notif.read ? 'font-bold text-cla-text dark:text-white' : 'font-medium text-cla-text dark:text-cla-text-dark'}`}>{notif.title}</p>
                                            {notif.body && <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark mt-0.5 truncate">{notif.body}</p>}
                                        </div>
                                        <div className="flex flex-col items-end flex-shrink-0 ml-2">
                                            <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark whitespace-nowrap">{formatTime(notif.timestamp)}</p>
                                            {!notif.read && <div className="w-2 h-2 bg-cla-gold rounded-full mt-2 animate-pulse-dot"></div>}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4">
                            <BellIcon className="w-12 h-12 mx-auto text-cla-text-muted dark:text-cla-text-muted-dark opacity-50" />
                            <h4 className="mt-4 font-semibold text-cla-text dark:text-white">All caught up</h4>
                            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-1">You have no new notifications.</p>
                        </div>
                    )}
                </div>

                <footer className="p-2 text-center text-sm border-t border-cla-border dark:border-[rgba(255,255,255,0.1)] sticky bottom-0 bg-cla-surface/80 dark:bg-[#111111]/80 backdrop-blur-sm z-10">
                    <button onClick={handleViewAll} className="w-full font-semibold text-cla-gold hover:underline p-2 rounded-lg">
                        View All Notifications →
                    </button>
                </footer>
            </div>
        </div>
    );
};