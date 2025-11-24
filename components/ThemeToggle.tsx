
import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface ThemeToggleProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-cla-surface dark:hover:bg-cla-surface-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cla-bg dark:focus:ring-offset-cla-bg-dark focus:ring-cla-gold transition-colors duration-200"
            aria-label="Toggle theme"
        >
            {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
    );
};