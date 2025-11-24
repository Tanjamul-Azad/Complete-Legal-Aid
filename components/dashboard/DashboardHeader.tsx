import React, { useContext } from 'react';
import type { User, DashboardSubPage } from '../../types';
import { AppContext } from '../../context/AppContext';
import { SearchIcon, MessageIcon, BellIcon, WarningIcon } from '../icons';
import { ThemeToggle } from '../ThemeToggle';
import { ProfileDropdown } from '../ProfileDropdown';

export const DashboardHeader: React.FC<{
    unreadMessagesCount: number;
    unreadNotificationsCount: number;
    openInbox: () => void;
    openNotifications: () => void;
}> = ({ unreadMessagesCount, unreadNotificationsCount, openInbox, openNotifications }) => {
    const context = useContext(AppContext);

    if (!context) return null;

    const { user, setDashboardSubPage, handleLogout, isDarkMode, toggleTheme, setEmergencyHelpOpen } = context;

    if (!user) return null;

    const handleProfileNavigation = (target: 'settings' | 'profile' | 'help') => {
        if (target === 'profile' || target === 'settings') {
            setDashboardSubPage('settings');
        } else if (target === 'help') {
            // Redirect to settings or overview for now as a placeholder for help
            setDashboardSubPage('settings');
        }
    };

    return (
        <header className="sticky top-0 z-30 bg-cla-header-bg backdrop-blur-md border-b border-cla-border dark:border-cla-border-dark shadow-sm">
            {/* Responsive Height: h-16 on mobile/small laptop, h-20 on large desktop */}
            <div className="px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between gap-6">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-cla-text-muted dark:text-cla-text-muted-dark" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search cases, lawyers, documents..."
                        className="w-full pl-10 pr-4 py-2 border border-cla-border dark:border-cla-border-dark rounded-full bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark focus:outline-none focus:ring-2 focus:ring-cla-gold"
                    />
                </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-2">
                    <button onClick={() => setEmergencyHelpOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">
                        <WarningIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Emergency Help</span>
                    </button>

                    <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                    <button onClick={openInbox} className="relative p-2 rounded-full text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-cla-bg dark:hover:bg-cla-bg-dark transition-colors" aria-label="Open messages">
                        <MessageIcon />
                        {unreadMessagesCount > 0 && (
                            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-cla-header-bg" />
                        )}
                    </button>
                    <button onClick={openNotifications} className="relative p-2 rounded-full text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-cla-bg dark:hover:bg-cla-bg-dark transition-colors" aria-label="Open notifications">
                        <BellIcon />
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-cla-header-bg" />
                        )}
                    </button>

                    <div className="w-px h-6 bg-cla-border dark:bg-cla-border-dark mx-2"></div>

                    {/* Consistent Profile Dropdown */}
                    <ProfileDropdown
                        name={user.name}
                        email={user.email}
                        role={user.role}
                        avatar={user.avatar}
                        onLogout={handleLogout}
                        onNavigate={handleProfileNavigation}
                    />
                </div>
            </div>
        </header>
    );
};