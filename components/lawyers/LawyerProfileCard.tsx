import React from 'react';
import type { User } from '../../types';
import { StarIcon, VerifiedIcon } from '../icons';

export const LawyerProfileCard: React.FC<{ user: User, onSelect: () => void, animationDelay: string }> = ({ user, onSelect, animationDelay }) => (
    <div 
        className="group bg-white dark:bg-[#111111] rounded-2xl p-6 overflow-hidden transform transition-all duration-300 border border-[#E5E5E5] dark:border-white/5 shadow-lg shadow-gray-500/5 dark:shadow-black/20 hover:-translate-y-1 hover:shadow-xl hover:border-cla-gold/50 dark:hover:border-cla-gold/30 active:scale-[0.98] animate-fade-in-up"
        style={{ animationDelay }}
    >
        <div className="flex items-center space-x-4">
            <img 
                className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100 dark:ring-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105" 
                src={user.avatar} 
                alt={user.name} 
            />
            <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#222] dark:text-white flex items-center gap-1.5">
                    {user.name}
                    {user.verificationStatus === 'Verified' && <VerifiedIcon className="w-4 h-4 text-cla-blue-trust flex-shrink-0" />}
                </h3>
                <div className="flex items-center mt-1 space-x-1.5">
                    <StarIcon className="w-5 h-5 text-cla-gold" />
                    <span className="text-cla-text dark:text-white font-bold">{user.rating}</span>
                    <span className="text-cla-text-muted dark:text-[#CFCFCF] text-sm">({user.reviews?.length || 0} reviews)</span>
                </div>
            </div>
        </div>
        <div className="mt-4">
            <div className="flex flex-wrap gap-2">
                {user.specializations?.slice(0, 3).map(spec => (
                    <span 
                        key={spec} 
                        className="px-2.5 py-1 bg-cla-gold/10 dark:bg-cla-gold/20 text-cla-gold-darker dark:text-cla-gold text-xs font-medium rounded-full"
                    >
                        {spec}
                    </span>
                ))}
            </div>
        </div>
        <div className="mt-6 flex justify-between items-center">
            <div className="text-cla-text dark:text-white">
                <span className="font-bold text-lg">{user.fees} BDT</span>
                <span className="text-sm text-cla-text-muted dark:text-[#CFCFCF]"> / consultation</span>
            </div>
            <button 
                onClick={onSelect} 
                className="px-4 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker transition-all text-sm transform active:scale-95 dark:bg-gradient-to-br dark:from-cla-gold dark:to-cla-gold-darker dark:hover:shadow-lg dark:hover:shadow-cla-gold/30 dark:hover:brightness-110"
            >
                View Profile
            </button>
        </div>
    </div>
);