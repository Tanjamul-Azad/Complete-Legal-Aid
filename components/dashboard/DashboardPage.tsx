import React, { useState, useEffect, useMemo, useContext } from 'react';
import type { UserRole, DashboardSubPage } from '../../types';
import { AppContext } from '../../context/AppContext';
import {
    DashboardIcon, VaultIcon, SettingsIcon, VerificationIcon, SearchIcon,
    BellIcon, RobotIcon, CalendarIcon, LogoutIcon, BriefcaseIcon, MessageIcon, UserGroupIcon, BanknotesIcon, WarningIcon, ServerIcon, MenuIcon
} from '../icons';
import { Breadcrumb, BreadcrumbItem } from '../ui/Breadcrumb';
import { DashboardHeader } from './DashboardHeader';
import { Logo } from '../Logo';
import { SecureChatWidget } from './SecureChatWidget';
import { NotificationsPanel } from './NotificationsPanel';
import { EmergencyHelpModal } from '../EmergencyHelpModal';

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
import { AdminContentManager } from './admin/AdminContentManager';
import { AdminSupport } from './admin/AdminSupport';
import { AdminAuditLogs } from './admin/AdminAuditLogs';
import { AdminSettings } from './admin/AdminSettings';
import { SystemLogs } from './admin/SystemLogs';
import { AdminUsers } from './admin/AdminUsers';
import { AdminCases } from './admin/AdminCases';

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    action?: () => void;
}

export const DashboardPage: React.FC = () => {
    const context = useContext(AppContext);
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    if (!context) return null;

    const {
        user, users, messages, notifications, dashboardSubPage: subPage, setDashboardSubPage,
        goToAuth, handleLogout, cases, selectedCaseId, setSelectedCaseId, handleNotificationNavigation,
        isInboxOpen, setInboxOpen, isNotificationsOpen, setNotificationsOpen, openInbox, openNotifications,
        markAllNotificationsAsRead, markMessagesAsRead, markConversationAsRead, setChatOpen,
        handleSetCurrentPage, handleSendMessage
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
        return null;
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
            { id: 'content-management', label: 'Content Management', icon: BriefcaseIcon }, // Reusing BriefcaseIcon for now
            { id: 'support', label: 'Support Inbox', icon: MessageIcon },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
            { id: 'admin-users', label: 'User Management', icon: UserGroupIcon },
            { id: 'admin-cases', label: 'Case Management', icon: BriefcaseIcon },
            { id: 'system-logs', label: 'System Logs', icon: ServerIcon },
            { id: 'audit-logs', label: 'Audit Trail', icon: BriefcaseIcon }, // Using BriefcaseIcon as placeholder if needed, or maybe another one
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
                    case 'content-management': return <AdminContentManager />;
                    case 'support': return <AdminSupport />;
                    case 'audit-logs': return <AdminAuditLogs />;
                    case 'system-logs': return <SystemLogs />;
                    case 'admin-users': return <AdminUsers />;
                    case 'admin-cases': return <AdminCases />;
                    case 'settings': return <AdminSettings />;
                    default: return <AdminOverview />;
                }
        }
        return null;
    };


    return (
        <div className="flex h-full bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-cla-border dark:border-cla-border-dark transition-transform duration-300 ease-in-out bg-cla-sidebar-bg dark:bg-cla-sidebar-bg
                md:static md:flex md:translate-x-0
                ${isMobileSidebarOpen ? 'translate-x-0 flex' : '-translate-x-full hidden md:flex'}
            `}>
                <div className="flex items-center justify-center py-6 border-b border-cla-border dark:border-cla-border-dark">
                    <button
                        onClick={() => handleSetCurrentPage('home')}
                        className="flex items-center gap-2 group focus:outline-none"
                    >
                        {/* Using the Logo component but sizing it to match the requested h-9 */}
                        <div className="h-9 w-auto transition group-hover:opacity-80 text-cla-gold">
                            {/* We can use the Logo component here. The Logo component has its own text "CLA". 
                                The user requested: Logo Image + "CLA" text. 
                                My Logo component ALREADY has "CLA" text inside the SVG. 
                                So I should just use the Logo component and maybe hide the extra text if I can, 
                                OR just use the Logo component as is if it looks good.
                                The user's HTML shows: <img src="/assets/logo/cla-logo.svg" class="h-9 w-auto" /> <span class="text-xl...">CLA</span>
                                My Logo component is the full logo. 
                                Let's use the Logo component and adjust sizing. 
                             */}
                            <Logo className="h-9 w-auto" />
                        </div>
                    </button>
                </div>
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
                                // Close sidebar on mobile when item clicked
                                setMobileSidebarOpen(false);
                            }}
                            className={`group flex items-center space-x-3 px-3 py-2.5 rounded-lg w-full text-left transition-all duration-200 font-medium relative text-sm 
                                ${subPage === item.id
                                    ? 'text-cla-gold bg-cla-gold/10 dark:bg-cla-gold/15 shadow-sm'
                                    : 'text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-cla-gold/5 dark:hover:bg-cla-gold/10 hover:text-cla-gold dark:hover:text-cla-gold'
                                }`}
                        >
                            {subPage === item.id && <span className="absolute left-0 top-2 bottom-2 w-1 bg-cla-gold rounded-r-full transition-all shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>}
                            <div className="flex items-center space-x-3 transition-transform duration-200 group-hover:translate-x-1">
                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${subPage === item.id ? 'text-cla-gold' : 'group-hover:text-cla-gold'}`} />
                                <span>{item.label}</span>
                            </div>
                        </button>
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-cla-border dark:border-cla-border-dark mt-auto">
                    {/* Logout button removed as per user request */}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#FAFAFA] dark:bg-cla-bg-dark">
                <DashboardHeader
                    unreadMessagesCount={unreadMessagesCount}
                    unreadNotificationsCount={unreadNotificationsCount}
                    openInbox={openInbox}
                    openNotifications={openNotifications}
                    onMenuClick={() => setMobileSidebarOpen(true)}
                />
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* FIXED: This container limits width to prevent 'scattered' look on big screens */}
                    <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
                        <Breadcrumb items={breadcrumbItems} />
                        {renderSubPage()}
                    </div>
                </main>
            </div>
            <EmergencyHelpModal
                isOpen={context.isEmergencyHelpOpen}
                onClose={() => context.setEmergencyHelpOpen(false)}
                onReport={() => context.setEmergencyReportOpen(true)}
                onFindLawyer={context.handleFindLawyerFromEmergency}
                onLiveChat={context.handleLiveChatFromEmergency}
                onMakeComplaint={context.handleMakeComplaint}
                onSendAlert={context.sendEmergencyAlert}
            />
            <SecureChatWidget
                isOpen={isInboxOpen}
                onClose={() => setInboxOpen(false)}
                currentUser={user}
                messages={messages}
                allUsers={users}
                onSendMessage={handleSendMessage}
                markConversationAsRead={markConversationAsRead}
                initialSelectedUserId={context.chatTargetUserId}
            />
            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                notifications={notifications.filter(n => n.userId === user.id)}
                handleNotificationNavigation={handleNotificationNavigation}
                markAllAsRead={markAllNotificationsAsRead}
                setDashboardSubPage={setDashboardSubPage}
            />

            {/* Floating Emergency Help Button */}
            {/* Floating Emergency Help Button (Bottom-Left) */}
            <button
                onClick={() => context.setEmergencyHelpOpen(true)}
                className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-500/30"
                title="Emergency Help"
            >
                <WarningIcon className="w-8 h-8" />
            </button>

            {/* Floating AI Assistant Button (Bottom-Right) */}
            <button
                onClick={() => context.setChatOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-cla-gold text-cla-text-darker rounded-full shadow-lg hover:bg-yellow-500 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cla-gold/30 animate-bounce-subtle"
                title="AI Legal Assistant"
            >
                <RobotIcon className="w-8 h-8" />
            </button>
        </div>
    );
};