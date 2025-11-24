
import React from 'react';
import { BackIcon, HomeIcon } from './icons';
import type { Page } from '../types';

interface BackButtonProps {
    setCurrentPage: (page: Page) => void;
    targetPage: Page;
    homeTarget?: Page;
}

export const BackButton: React.FC<BackButtonProps> = ({ setCurrentPage, targetPage, homeTarget = 'home' }) => {
    return (
        <div className="flex items-center space-x-4 mb-6">
            <button
                onClick={() => setCurrentPage(targetPage)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-cla-gold dark:hover:text-cla-gold transition-colors"
            >
                <BackIcon className="w-5 h-5" />
                <span>Back</span>
            </button>
             <button
                onClick={() => setCurrentPage(homeTarget)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-cla-gold dark:hover:text-cla-gold transition-colors"
            >
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
            </button>
        </div>
    );
};