import React, { useState, useEffect, useMemo, useContext } from 'react';
import type { Page, User, Case, DashboardSubPage, EvidenceDocument, VerificationStatus, UserRole, SimulatedEmail, Appointment, ActivityLog, Notification, Message } from '../../types';
import { AppContext } from '../../context/AppContext';
import {
    DashboardIcon, VaultIcon, SettingsIcon, VerificationIcon, SearchIcon,
    BellIcon, RobotIcon, CalendarIcon, LogoutIcon, BriefcaseIcon, MessageIcon, UserGroupIcon, BanknotesIcon
} from '../icons';
import { Breadcrumb, BreadcrumbItem } from '../ui/Breadcrumb';
import { DashboardHeader } from './DashboardHeader';
import { InboxPanel } from './InboxPanel';
import { NotificationsPanel } from './NotificationsPanel';

// Shared Pages
import { DashboardOverview } from './DashboardOverview';

// Role-Specific Pages
import { CitizenCases } from './citizen/CitizenCases';
import { CitizenCaseDetail } from './citizen/CitizenCaseDetail';
import { CitizenAppointments } from './citizen/CitizenAppointments';
import { CitizenFindLawyers } from './citizen/CitizenFindLawyers';
import { CitizenVault } from './citizen/CitizenVault';
import { CitizenNotifications } from './citizen/CitizenNotifications';
import { CitizenSettings } from './citizen/CitizenSettings';
import { CitizenBilling } from './citizen/CitizenBilling';
import { CitizenMessages } from './citizen/CitizenMessages';

import { LawyerCases } from './lawyer/LawyerCases';
import { LawyerCaseDetail } from './lawyer/LawyerCaseDetail';
import { LawyerAppointments } from './lawyer/LawyerAppointments';
import { LawyerClients } from './lawyer/LawyerClients';
import { LawyerBilling } from './lawyer/LawyerBilling';
import { LawyerVault } from './lawyer/LawyerVault';
import { LawyerNotifications } from './lawyer/LawyerNotifications';
import { LawyerSettings } from './lawyer/LawyerSettings';
import { LawyerMessages } from './lawyer/LawyerMessages';

import { AdminVerification } from './admin/AdminVerification';
import { AdminOverview } from './admin/AdminOverview';

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    action?: () => void;
}


export const DashboardPage: React.FC = () => {
    const context = useContext(AppContext);

    if (!context) return null;

    const {
        user, users, messages, notifications, dashboardSubPage: subPage, setDashboardSubPage,
        goToAuth, handleLogout, cases, selectedCaseId, setSelectedCaseId, handleNotificationNavigation,
        isInboxOpen, setInboxOpen, isNotificationsOpen, setNotificationsOpen, openInbox, openNotifications,
        markAllNotificationsAsRead, markMessagesAsRead, markConversationAsRead, setChatOpen,
        handleSetCurrentPage
    } = context;

    const unreadMessagesCount = useMemo(() => {
        const conversations = new Set();
        messages.forEach(m => {
            if (m.receiverId === user?.id && !m.read) {
                conversations.add(m.senderId);
            }
        });
        return conversations.size;
    }, [messages, user]);

    const unreadNotificationsCount = useMemo(() => notifications.filter(n => n.userId === user?.id && !n.read).length, [notifications, user]);

    useEffect(() => {
        if (!user) {
            goToAuth('login');
        }
    }, [user, goToAuth]);

    if (!user) {
        return null; // Or a loading spinner, while redirecting
    }

    const getNavItems = (role: UserRole): NavItem[] => {
        const citizenItems = [
            { id: 'overview', label: 'Dashboard', icon: DashboardIcon },
            { id: 'find-lawyers', label: 'Find Lawyers', icon: SearchIcon },
            { id: 'cases', label: 'My Cases', icon: BriefcaseIcon },
            { id: 'vault', label: 'Evidence Vault', icon: VaultIcon },
            { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
            { id: 'messages', label: 'Messages', icon: MessageIcon },
            { id: 'billing', label: 'Payments', icon: BanknotesIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
        ];

        const lawyerItems = [
            { id: 'overview', label: 'Dashboard', icon: DashboardIcon },
            { id: 'cases', label: 'Cases', icon: BriefcaseIcon },
            { id: 'appointments', label: 'Calendar', icon: CalendarIcon },
            { id: 'clients', label: 'Clients', icon: UserGroupIcon },
            { id: 'vault', label: 'Evidence Vault', icon: VaultIcon },
            { id: 'billing', label: 'Payments', icon: BanknotesIcon },
            { id: 'messages', label: 'Messages', icon: MessageIcon },
            { id: 'settings', label: 'Profile Settings', icon: SettingsIcon },
            { id: 'ai-assistant', label: 'AI Assistant', icon: RobotIcon, action: () => setChatOpen(true) },
        ];

        const adminItems = [
            { id: 'overview', label: 'Overview', icon: DashboardIcon },
            { id: 'verification', label: 'Verification', icon: VerificationIcon },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
        ];

        switch (role) {
            case 'citizen': return citizenItems;
            case 'lawyer': return lawyerItems;
            case 'admin': return adminItems;
        }
    };
    const navItems = getNavItems(user.role);

    const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
        const items: BreadcrumbItem[] = [];
        items.push({ label: 'Dashboard', onClick: () => { setDashboardSubPage('overview'); setSelectedCaseId(null); } });
        const currentNavItem = navItems.find(item => item.id === subPage);

        if (subPage !== 'overview' && currentNavItem) {
            items.push({ label: currentNavItem.label, onClick: () => { setDashboardSubPage(subPage as DashboardSubPage); setSelectedCaseId(null); } });
        }

        if (subPage === 'cases' && selectedCaseId) {
            const selectedCase = cases.find(c => c.id === selectedCaseId);
            if (selectedCase) items.push({ label: selectedCase.title });
        }

        return items;
    }, [subPage, selectedCaseId, cases, navItems, setDashboardSubPage, setSelectedCaseId]);


    const renderSubPage = () => {
        switch (user.role) {
            case 'citizen':
                switch (subPage) {
                    case 'overview': return <DashboardOverview />;
                    case 'find-lawyers': return <CitizenFindLawyers />;
                    case 'cases':
                        if (selectedCaseId) return <CitizenCaseDetail caseId={selectedCaseId} />;
                        return <CitizenCases onSelectCase={(id) => setSelectedCaseId(id)} />;
                    case 'vault': return <CitizenVault />;
                    case 'appointments': return <CitizenAppointments />;
                    case 'notifications': return <CitizenNotifications />;
                    case 'settings': return <CitizenSettings />;
                    case 'billing': return <CitizenBilling />;
                    case 'messages': return <CitizenMessages />;
                    default: return <DashboardOverview />;
                }
            case 'lawyer':
                switch (subPage) {
                    case 'overview': return <DashboardOverview />;
                    case 'cases':
                        if (selectedCaseId) return <LawyerCaseDetail caseId={selectedCaseId} />;
                        return <LawyerCases onSelectCase={(id) => setSelectedCaseId(id)} />;
                    case 'appointments': return <LawyerAppointments />;
                    case 'clients': return <LawyerClients />;
                    case 'billing': return <LawyerBilling />;
                    case 'vault': return <LawyerVault />;
                    case 'notifications': return <LawyerNotifications />;
                    case 'settings': return <LawyerSettings />;
                    case 'messages': return <LawyerMessages />;
                    default: return <DashboardOverview />;
                }
            case 'admin':
                switch (subPage) {
                    case 'overview': return <AdminOverview />;
                    case 'verification': return <AdminVerification />;
                    case 'settings': return <CitizenSettings />; // Admins can use citizen settings for now
                    default: return <AdminOverview />;
                }
        }
        return null; // Fallback
    };


    return (
        <div className="flex h-full bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark overflow-hidden">
            {/* Sidebar with distinct background color - Responsive: hidden on mobile, flex on md+ */}
            <aside className="w-64 flex-shrink-0 bg-cla-sidebar-bg dark:bg-cla-sidebar-bg hidden md:flex flex-col border-r border-cla-border dark:border-cla-border-dark transition-all duration-300">
                <button
                    onClick={() => handleSetCurrentPage('home')}
                    className="p-4 border-b border-cla-border dark:border-cla-border-dark flex items-center gap-3 w-full text-left hover:bg-white/50 dark:hover:bg-white/5 transition-colors group"
                    title="Go to Homepage"
                >
                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 group-hover:ring-2 group-hover:ring-cla-gold/50 transition-all" />
                    <div className="overflow-hidden">
                        <h2 className="font-bold text-sm text-cla-text dark:text-cla-text-dark truncate group-hover:text-cla-gold transition-colors">{user.name}</h2>
                        <p className="text-xs capitalize text-cla-text-muted dark:text-cla-text-muted-dark truncate flex items-center gap-1">
                            {user.role}
                            <span className="hidden group-hover:inline-block px-1.5 py-0.5 rounded bg-cla-gold/10 text-cla-gold text-[9px] font-bold uppercase ml-1">Home</span>
                        </p>
                    </div>
                </button>
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.action) {
                                    item.action();
                                } else {
                                    setDashboardSubPage(item.id as DashboardSubPage);
                                }
                            }}
                            className={`group flex items-center space-x-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors font-medium relative text-sm ${subPage === item.id ? 'text-cla-gold bg-cla-gold/10 dark:bg-cla-gold/15' : 'text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-white/50 dark:hover:bg-white/5 hover:text-cla-text dark:hover:text-cla-text-dark'}`}
                        >
                            {subPage === item.id && <span className="absolute left-0 top-2 bottom-2 w-1 bg-cla-gold rounded-r-full transition-all"></span>}
                            <div className="flex items-center space-x-3 transition-transform duration-200 group-hover:translate-x-1">
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${item.id === 'ai-assistant' ? 'text-cla-gold' : ''}`} />
                                <span>{item.label}</span>
                            </div>
                        </button>
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-cla-border dark:border-cla-border-dark mt-auto">
                    <button
                        onClick={handleLogout}
                        className="group flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors w-full font-medium text-sm text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-white/50 dark:hover:bg-white/5 hover:text-cla-text dark:hover:text-cla-text-dark"
                    >
                        <div className="flex items-center space-x-3 transition-transform duration-200 group-hover:translate-x-1">
                            <LogoutIcon className="w-5 h-5 flex-shrink-0" />
                            <span>Logout</span>
                        </div>
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <DashboardHeader
                    unreadMessagesCount={unreadMessagesCount}
                    unreadNotificationsCount={unreadNotificationsCount}
                    openInbox={openInbox}
                    openNotifications={openNotifications}
                />
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                    <Breadcrumb items={breadcrumbItems} />
                    {renderSubPage()}
                </main>
            </div>
            <InboxPanel
                isOpen={isInboxOpen}
                onClose={() => setInboxOpen(false)}
                messages={messages}
                allUsers={users}
                markAllAsRead={markMessagesAsRead}
                markConversationAsRead={markConversationAsRead}
            />
            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                notifications={notifications.filter(n => n.userId === user.id)}
                handleNotificationNavigation={handleNotificationNavigation}
                markAllAsRead={markAllNotificationsAsRead}
                setDashboardSubPage={setDashboardSubPage}
            />
        </div>
    );
};