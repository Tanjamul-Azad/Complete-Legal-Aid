import React from 'react';
import type { Page, SimulatedEmail } from '../../types';
import { CloseIcon } from '../icons';

interface SimulatedGmailInboxProps {
    isOpen: boolean;
    onClose: () => void;
    emails: SimulatedEmail[];
    onReadEmail: (id: string) => void;
    setCurrentPage: (page: Page) => void;
    onVerifyClick: (token: string) => void;
}

export const SimulatedGmailInbox: React.FC<SimulatedGmailInboxProps> = ({
    isOpen,
    onClose,
    emails,
    onReadEmail,
    setCurrentPage,
    onVerifyClick
}) => {
    if (!isOpen) return null;

    const handleActionClick = (email: SimulatedEmail) => {
        onReadEmail(email.id);
        if (email.action?.type === 'RESET_PASSWORD') {
            setCurrentPage('reset-password');
        } else if (email.action?.type === 'VERIFY_EMAIL') {
            onVerifyClick(email.action.token);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[101] animate-fade-in p-4">
            <div className="bg-cla-bg dark:bg-cla-surface-dark rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <header className="p-4 border-b border-cla-border dark:border-cla-border-dark flex justify-between items-center">
                    <h2 className="text-xl font-bold text-cla-text dark:text-cla-text-dark">Simulated Inbox</h2>
                    <button
                        onClick={onClose}
                        className="text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark"
                    >
                        <CloseIcon />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto">
                    {emails.length === 0 ? (
                        <p className="p-6 text-center text-cla-text-muted dark:text-cla-text-muted-dark">Your inbox is empty.</p>
                    ) : (
                        <ul>
                            {emails.slice().reverse().map(email => (
                                <li
                                    key={email.id}
                                    className={`p-4 border-b border-cla-border dark:border-cla-border-dark ${!email.read ? 'bg-cla-gold/10' : ''}`}
                                >
                                    <p className="font-bold text-cla-text dark:text-cla-text-dark">{email.from}</p>
                                    <p className="font-medium text-cla-text dark:text-cla-text-dark">{email.subject}</p>
                                    <div
                                        className="mt-2 text-sm text-cla-text-muted dark:text-cla-text-muted-dark"
                                        dangerouslySetInnerHTML={{ __html: email.body }}
                                    />
                                    {email.action && (
                                        <button
                                            onClick={() => handleActionClick(email)}
                                            className="mt-2 text-sm text-blue-500 hover:underline"
                                        >
                                            {email.action.buttonText}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
