
import React, { useState, useContext } from 'react';
import { ScaleIcon, MailIcon, CloseIcon, UserCircleIcon, SettingsIcon, LogoutIcon, DashboardIcon } from './icons';
import { AppContext } from '../context/AppContext';
import { ThemeToggle } from './ThemeToggle';
import { ProfileDropdown } from './ProfileDropdown';

const NavItem: React.FC<{ page: 'home' | 'about' | 'contact'; children: React.ReactNode; mobile?: boolean; closeMenu?: () => void }> = ({ page, children, mobile = false, closeMenu }) => {
    const context = useContext(AppContext);
    
    if (!context) return null;

    const { handleSetCurrentPage, currentPage } = context;
    
    const handleClick = () => {
        handleSetCurrentPage(page);
        if (closeMenu) closeMenu();
    };

    const isActive = currentPage === page;
    const baseClasses = "relative font-medium transition-colors duration-200";
    const mobileClasses = "block px-3 py-2 rounded-md text-base text-cla-text dark:text-cla-text-dark hover:bg-cla-surface dark:hover:bg-cla-surface-dark";
    const desktopClasses = "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2";

    return (
        <button onClick={handleClick} className={`${baseClasses} ${mobile ? mobileClasses : desktopClasses} group`}>
            {children}
            {!mobile && (
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-cla-gold transform origin-left transition-transform duration-300 ease-out ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
            )}
        </button>
    );
};


export const Header: React.FC = () => {
    const context = useContext(AppContext);
    
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!context) return null;

    const { user, isDarkMode, handleSetCurrentPage, handleLogout, toggleTheme, goToAuth, simulatedEmails, setGmailInboxOpen, setDashboardSubPage, currentPage } = context;

    const unreadEmailCount = simulatedEmails.filter(e => !e.read).length;
    const closeMobileMenu = () => setMobileMenuOpen(false);

    const handleProfileNavigation = (target: 'settings' | 'profile' | 'help' | 'dashboard') => {
        handleSetCurrentPage('dashboard');
        if (target === 'dashboard') {
            // Just switching to dashboard view restores the persisted subpage
            closeMobileMenu();
            return;
        }
        if (target === 'profile' || target === 'settings') {
            setDashboardSubPage('settings');
        } else if (target === 'help') {
            // Map help to overview or a specific help page if available
            setDashboardSubPage('overview'); 
        }
        closeMobileMenu();
    };

    return (
        <header className="sticky top-0 bg-cla-header-bg dark:bg-[#050816]/95 backdrop-blur-md z-50 border-b border-cla-border dark:border-white/5 shadow-sm transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-[1200px]">
                <div className="flex items-center justify-between h-16 md:h-[72px]">
                    {/* Left: Logo & Dashboard Shortcut */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleSetCurrentPage('home')} className="flex-shrink-0 flex items-center gap-3 group">
                           <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-cla-gold flex items-center justify-center text-white shadow-lg shadow-cla-gold/20 transition-transform group-hover:scale-105">
                               <ScaleIcon className="h-5 w-5" />
                           </div>
                           <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight font-serif">Complete Legal Aid</span>
                        </button>

                        {/* Back to Dashboard Button (Visible only when logged in and NOT on dashboard) */}
                        {user && currentPage !== 'dashboard' && (
                            <button
                                onClick={() => handleSetCurrentPage('dashboard')}
                                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-cla-gold bg-cla-gold/10 rounded-full hover:bg-cla-gold/20 transition-all border border-cla-gold/20 animate-fade-in ml-4"
                            >
                                <DashboardIcon className="w-4 h-4" />
                                <span>Back to Dashboard</span>
                            </button>
                        )}
                    </div>

                    {/* Center: Desktop Navigation */}
                    <nav className="hidden md:flex md:space-x-8 text-sm">
                        <NavItem page="home">Home</NavItem>
                        <NavItem page="about">About</NavItem>
                        <NavItem page="contact">Contact</NavItem>
                    </nav>
                    
                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 md:space-x-3">
                       <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                        
                        {user ? (
                            <div className="hidden md:flex items-center space-x-3 ml-2 pl-3 border-l border-gray-200 dark:border-gray-800">
                                <button onClick={() => setGmailInboxOpen(true)} className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" aria-label="Open inbox">
                                    <MailIcon className="w-5 h-5" />
                                    {unreadEmailCount > 0 && (
                                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-black" />
                                    )}
                                </button>
                                
                                {/* Profile Dropdown */}
                                <ProfileDropdown 
                                    name={user.name}
                                    email={user.email}
                                    role={user.role}
                                    avatar={user.avatar}
                                    onLogout={handleLogout}
                                    onNavigate={handleProfileNavigation}
                                />
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-3 ml-2">
                                <button onClick={() => goToAuth('login')} className="px-4 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    Login
                                </button>
                                <button onClick={() => goToAuth('admin-login')} className="px-4 py-1.5 text-sm font-bold text-white bg-black dark:bg-white dark:text-black rounded-full shadow-md hover:opacity-90 transition-all transform hover:-translate-y-0.5">
                                    Admin
                                </button>
                            </div>
                        )}
                         
                        {/* Mobile menu button */}
                        <div className="md:hidden ml-2">
                            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
                                <span className="sr-only">Open main menu</span>
                                {isMobileMenuOpen ? <CloseIcon className="block h-6 w-6" /> : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                         </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden animate-fade-in bg-white dark:bg-[#111] border-t border-gray-100 dark:border-white/10" id="mobile-menu">
                    <div className="px-4 pt-4 pb-3 space-y-1">
                        <NavItem page="home" mobile closeMenu={closeMobileMenu}>Home</NavItem>
                        <NavItem page="about" mobile closeMenu={closeMobileMenu}>About</NavItem>
                        <NavItem page="contact" mobile closeMenu={closeMobileMenu}>Contact</NavItem>
                        {user && currentPage !== 'dashboard' && (
                             <button onClick={() => handleProfileNavigation('dashboard')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-cla-gold hover:bg-cla-gold/10 transition-colors">
                                Back to Dashboard
                            </button>
                        )}
                    </div>
                    <div className="pt-4 pb-6 border-t border-gray-100 dark:border-white/10 px-4">
                        {user ? (
                            <div className="space-y-3">
                                <div className="flex items-center mb-4 bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                    <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt={user.name} />
                                    <div className="ml-3">
                                        <div className="text-base font-bold text-gray-800 dark:text-white">{user.name}</div>
                                        <div className="text-xs font-medium text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                <button onClick={() => handleProfileNavigation('dashboard')} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-cla-text dark:text-cla-text-dark hover:bg-cla-surface dark:hover:bg-cla-surface-dark rounded-lg">
                                    <DashboardIcon className="w-5 h-5 text-gray-400" /> Dashboard
                                </button>
                                <button onClick={() => handleProfileNavigation('profile')} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-cla-text dark:text-cla-text-dark hover:bg-cla-surface dark:hover:bg-cla-surface-dark rounded-lg">
                                    <UserCircleIcon className="w-5 h-5 text-gray-400" /> My Profile
                                </button>
                                <button onClick={() => handleProfileNavigation('settings')} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-cla-text dark:text-cla-text-dark hover:bg-cla-surface dark:hover:bg-cla-surface-dark rounded-lg">
                                    <SettingsIcon className="w-5 h-5 text-gray-400" /> Account Settings
                                </button>
                                <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg">
                                    <LogoutIcon className="w-5 h-5" /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => { goToAuth('login'); closeMobileMenu(); }} className="w-full text-center px-4 py-2.5 rounded-full font-semibold border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-50">
                                    Login
                                </button>
                                <button onClick={() => { goToAuth('admin-login'); closeMobileMenu(); }} className="w-full text-center px-4 py-2.5 rounded-full font-bold text-white bg-black dark:bg-white dark:text-black hover:opacity-90">
                                    Admin
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};
