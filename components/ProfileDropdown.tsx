
import React, { useState, useRef, useEffect } from 'react';
import type { UserRole } from '../types';
import { UserCircleIcon, SettingsIcon, LogoutIcon, LightBulbIcon, ChevronDownIcon, DashboardIcon } from './icons';

interface ProfileDropdownProps {
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    onLogout: () => void;
    onNavigate: (page: 'settings' | 'profile' | 'help' | 'dashboard') => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ 
    name, 
    email, 
    role, 
    avatar, 
    onLogout, 
    onNavigate 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        // Close on Escape key
        function handleEsc(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEsc);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen]);

    const roleLabel = role === 'citizen' ? 'Citizen' : role === 'lawyer' ? 'Legal Professional' : 'Administrator';
    const roleBadgeColor = role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                           role === 'lawyer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                           'bg-cla-gold/10 text-cla-gold-darker dark:text-cla-gold';

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all focus:outline-none group"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <img 
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-cla-gold/20 group-hover:ring-cla-gold/50 transition-all" 
                    src={avatar} 
                    alt={name} 
                />
                <div className="hidden sm:flex flex-col items-start text-left">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight max-w-[100px] truncate">
                        {name}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight capitalize">
                        {role}
                    </span>
                </div>
                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#050816] rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 z-50 origin-top-right animate-scale-in overflow-hidden"
                    role="menu"
                >
                    {/* Header Section */}
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">{email}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${roleBadgeColor}`}>
                            {roleLabel}
                        </span>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2 space-y-0.5">
                        {/* Dashboard Link (Useful on public pages) */}
                        <button 
                            onClick={() => { onNavigate('dashboard'); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group"
                            role="menuitem"
                        >
                            <DashboardIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-cla-gold transition-colors" />
                            Dashboard
                        </button>

                        <button 
                            onClick={() => { onNavigate('profile'); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group"
                            role="menuitem"
                        >
                            <UserCircleIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-cla-gold transition-colors" />
                            My Profile
                        </button>
                        
                        <button 
                            onClick={() => { onNavigate('settings'); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group"
                            role="menuitem"
                        >
                            <SettingsIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-cla-gold transition-colors" />
                            Account Settings
                        </button>
                        
                        <button 
                            onClick={() => { onNavigate('help'); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors group"
                            role="menuitem"
                        >
                            <LightBulbIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-cla-gold transition-colors" />
                            Help & Support
                        </button>
                    </div>

                    {/* Footer Section */}
                    <div className="border-t border-gray-100 dark:border-white/5 p-2">
                        <button 
                            onClick={() => { onLogout(); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-medium"
                            role="menuitem"
                        >
                            <LogoutIcon className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
