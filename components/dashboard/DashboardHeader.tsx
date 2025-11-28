import React, { useContext } from 'react';
import type { User, DashboardSubPage } from '../../types';
import { AppContext } from '../../context/AppContext';
import { SearchIcon, MessageIcon, BellIcon, WarningIcon, MenuIcon } from '../icons';
import { ThemeToggle } from '../ThemeToggle';
import { ProfileDropdown } from '../ProfileDropdown';

export const DashboardHeader: React.FC<{
    unreadMessagesCount: number;
    unreadNotificationsCount: number;
    openInbox: () => void;
    openNotifications: () => void;
    onMenuClick: () => void;
}> = ({ unreadMessagesCount, unreadNotificationsCount, openInbox, openNotifications, onMenuClick }) => {
    const context = useContext(AppContext);

    if (!context) return null;

    const { user, setDashboardSubPage, handleLogout, isDarkMode, toggleTheme, setEmergencyHelpOpen, handleSetCurrentPage } = context;

    if (!user) return null;

    const handleProfileNavigation = (target: 'settings' | 'profile' | 'help') => {
        if (target === 'profile' || target === 'settings') {
            setDashboardSubPage('settings');
        } else if (target === 'help') {
            setDashboardSubPage('settings');
        }
    };

    return (
        <header className="sticky top-0 z-30 bg-cla-header-bg backdrop-blur-md border-b border-cla-border dark:border-cla-border-dark shadow-sm transition-colors duration-300">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

                {/* LEFT SIDE: Search Bar (Logo removed) */}
                <div className="flex items-center flex-1 max-w-xl">
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-2 -ml-2 mr-2 text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-cla-bg dark:hover:bg-cla-bg-dark rounded-md focus:outline-none focus:ring-2 focus:ring-cla-gold"
                        aria-label="Open sidebar"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-4 w-4 text-cla-text-muted dark:text-cla-text-muted-dark" />
                        </div>
                        <input
                            type="search"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-1.5 text-sm border border-cla-border dark:border-cla-border-dark rounded-full bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark focus:outline-none focus:ring-2 focus:ring-cla-gold transition-colors"
                        />
                    </div>
                </div>

                {/* RIGHT SIDE: Header Actions (Cleaned up) */}
                <div className="flex items-center gap-1 pl-2">
                    {/* Grouped Icons */}
                    <div className="flex items-center gap-1 border-r border-cla-border dark:border-cla-border-dark pr-2 mr-2">
                        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

                        <button onClick={openNotifications} className="relative p-2 rounded-full text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-cla-bg dark:hover:bg-cla-bg-dark transition-colors" aria-label="Open notifications">
                            <BellIcon className="w-5 h-5" />
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-cla-header-bg" />
                            )}
                        </button>

                        <button onClick={openInbox} className="relative p-2 rounded-full text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-cla-bg dark:hover:bg-cla-bg-dark transition-colors" aria-label="Open messages">
                            <MessageIcon className="w-5 h-5" />
                            {unreadMessagesCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-cla-header-bg" />
                            )}
                        </button>
                    </div>

                    {/* Minimal Profile Dropdown (Avatar only) */}
                    <ProfileDropdown
                        name={user.name}
                        email={user.email}
                        role={user.role}
                        avatar={user.avatar}
                        onLogout={handleLogout}
                        onNavigate={handleProfileNavigation}
                        minimal={true}
                    />
                </div>
            </div>
        </header>
    );
};