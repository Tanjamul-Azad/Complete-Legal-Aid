
import React from 'react';
import { WarningIcon } from './icons';

interface EmergencyButtonProps {
    onClick: () => void;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-10 left-0 z-[50] group flex items-center bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-lg shadow-red-900/30 rounded-r-full transition-all duration-300 w-14 hover:w-44 h-14 overflow-hidden border-y border-r border-white/10"
            aria-label="Emergency Help"
        >
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <WarningIcon className="w-6 h-6 animate-pulse" />
            </div>
            <span className="whitespace-nowrap font-bold text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-4">
                EMERGENCY
            </span>
        </button>
    );
};
