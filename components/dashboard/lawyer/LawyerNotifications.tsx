import React, { useContext, useMemo, useState } from 'react';
import type { User, Notification, NotificationType } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import { BellIcon, BriefcaseIcon, VerificationIcon, CalendarIcon, SettingsIcon, WarningIcon, MessageIcon } from '../../icons';

const getNotificationIcon = (type: NotificationType) => {
    const props = { className: "w-6 h-6 flex-shrink-0" };
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

const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    const now = new Date();

    notifications.forEach(notif => {
        const notifDate = new Date(notif.timestamp);
        const diffDays = Math.floor((now.getTime() - notifDate.getTime()) / (1000 * 3600 * 24));
        
        let key: string;
        if (diffDays === 0) key = 'Today';
        else if (diffDays === 1) key = 'Yesterday';
        else if (diffDays < 7) key = 'This Week';
        else key = 'Older';

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(notif);
    });

    return groups;
};

const NotificationFilterPill: React.FC<{
    label: string;
    type: string;
    currentFilter: string;
    count: number;
    setFilter: (type: string) => void;
}> = ({ label, type, currentFilter, count, setFilter }) => (
    <button 
        onClick={() => setFilter(type)}
        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2
            ${currentFilter === type 
                ? 'bg-cla-gold text-white shadow-md shadow-cla-gold/30' 
                : 'bg-cla-surface dark:bg-cla-surface-dark hover:bg-cla-border dark:hover:bg-cla-border-dark text-cla-text-muted dark:text-cla-text-dark'
            }`}
    >
        {label}
        {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${currentFilter === type ? 'bg-white/20' : 'bg-cla-border dark:bg-cla-border-dark'}`}>{count}</span>}
    </button>
);


export const LawyerNotifications: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { user, notifications, markAllNotificationsAsRead, handleNotificationNavigation } = context;

    const [filter, setFilter] = useState<'all' | 'unread' | 'case_update' | 'new_message' | 'appointment' | 'system'>('all');
    
    const userNotifications = useMemo(() => user ? notifications.filter(n => n.userId === user.id) : [], [notifications, user]);

    const filteredNotifications = useMemo(() => {
        if (filter === 'all') return userNotifications;
        if (filter === 'unread') return userNotifications.filter(n => !n.read);
        return userNotifications.filter(n => n.type === filter);
    }, [userNotifications, filter]);

    const groupedNotifications = groupNotificationsByDate(filteredNotifications);
    
    if (!user) return null;

    const filterCounts = {
        all: userNotifications.length,
        unread: userNotifications.filter(n => !n.read).length,
        case_update: userNotifications.filter(n => n.type === 'case_update').length,
        new_message: userNotifications.filter(n => n.type === 'new_message').length,
        appointment: userNotifications.filter(n => n.type === 'appointment').length,
        system: userNotifications.filter(n => n.type === 'system').length
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-cla-text dark:text-cla-text-dark">Notifications</h1>
                    <p className="text-md text-cla-text-muted dark:text-cla-text-muted-dark mt-1">Review and manage all your practice alerts.</p>
                </div>
                <button onClick={markAllNotificationsAsRead} className="px-4 py-2 text-sm font-medium rounded-md bg-cla-surface dark:bg-cla-surface-dark hover:bg-cla-border dark:hover:bg-cla-border-dark transition-colors whitespace-nowrap">
                    Mark all as read
                </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <NotificationFilterPill label="All" type="all" currentFilter={filter} count={filterCounts.all} setFilter={setFilter as any} />
                <NotificationFilterPill label="Unread" type="unread" currentFilter={filter} count={filterCounts.unread} setFilter={setFilter as any} />
                <div className="w-px h-6 bg-cla-border dark:bg-cla-border-dark mx-2"></div>
                <NotificationFilterPill label="Cases" type="case_update" currentFilter={filter} count={filterCounts.case_update} setFilter={setFilter as any} />
                <NotificationFilterPill label="Messages" type="new_message" currentFilter={filter} count={filterCounts.new_message} setFilter={setFilter as any} />
                <NotificationFilterPill label="Appointments" type="appointment" currentFilter={filter} count={filterCounts.appointment} setFilter={setFilter as any} />
                <NotificationFilterPill label="System" type="system" currentFilter={filter} count={filterCounts.system} setFilter={setFilter as any} />
            </div>

            <div className="space-y-8">
                {Object.entries(groupedNotifications).map(([group, notifs]) => 
                    notifs.length > 0 && (
                        <section key={group}>
                            <h2 className="text-lg font-semibold text-cla-text-muted dark:text-cla-text-muted-dark mb-4">{group}</h2>
                            <div className="bg-cla-surface dark:bg-cla-surface-dark rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm">
                                {notifs.map((notification, index) => (
                                    <div 
                                        key={notification.id} 
                                        onClick={() => notification.link && handleNotificationNavigation(notification)}
                                        className={`flex items-start gap-4 p-4 transition-colors duration-200 ${notification.link ? 'cursor-pointer hover:bg-cla-gold/5 dark:hover:bg-cla-gold/10' : ''} ${index < notifs.length - 1 ? 'border-b border-cla-border dark:border-cla-border-dark' : ''}`}
                                    >
                                        <div className={`mt-1 flex-shrink-0`}>
                                            <span className={`${notification.read ? 'text-cla-text-muted dark:text-cla-text-muted-dark' : 'text-cla-gold'}`}>{getNotificationIcon(notification.type)}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-semibold ${notification.read ? 'text-cla-text-muted dark:text-cla-text-muted-dark' : 'text-cla-text dark:text-cla-text-dark'}`}>{notification.title}</p>
                                            {notification.body && <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-1">{notification.body}</p>}
                                            <p className="text-xs text-cla-text-muted/70 dark:text-cla-text-muted-dark/70 mt-2">{new Date(notification.timestamp).toLocaleString()}</p>
                                        </div>
                                        {!notification.read && <div className="w-2.5 h-2.5 bg-cla-gold rounded-full mt-1.5 flex-shrink-0 animate-pulse-dot"></div>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )
                )}

                {filteredNotifications.length === 0 && (
                     <div className="text-center py-20 bg-cla-surface dark:bg-cla-surface-dark rounded-lg border-2 border-dashed border-cla-border dark:border-cla-border-dark">
                        <BellIcon className="w-16 h-16 mx-auto text-cla-text-muted dark:text-cla-text-muted-dark" />
                        <h3 className="mt-4 text-xl font-semibold text-cla-text dark:text-cla-text-dark">
                            {filter === 'unread' ? "You're all caught up!" : "No notifications found"}
                        </h3>
                        <p className="mt-1 text-cla-text-muted dark:text-cla-text-muted-dark">
                            {filter === 'unread' ? "You have no new notifications." : `There are no notifications matching your filter.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
