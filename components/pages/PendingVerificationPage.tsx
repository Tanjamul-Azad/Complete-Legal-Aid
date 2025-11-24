
import React from 'react';
import type { User } from '../../types';
import { WarningIcon } from '../icons';

export const PendingVerificationPage: React.FC<{ user: User; logout: () => void }> = ({ user, logout }) => (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
        <div className="text-center p-8 bg-cla-surface dark:bg-cla-surface-dark rounded-lg shadow-xl max-w-md mx-auto">
            <WarningIcon className="w-16 h-16 text-cla-gold mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-cla-text dark:text-cla-text-dark mb-2">Verification Pending</h1>
            <p className="text-cla-text-muted dark:text-cla-text-muted-dark mb-6">
                Thank you for signing up, {user.name}. Your account is currently under review by our administration team. You will be notified via email once your account has been verified.
            </p>
            <button onClick={logout} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker">
                Logout
            </button>
        </div>
    </div>
);