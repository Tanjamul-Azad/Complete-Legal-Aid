import React from 'react';
import { WarningIcon, CloseIcon } from '../icons';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    variant = 'destructive'
}) => {
    if (!isOpen) return null;
    
    const confirmButtonClasses = {
        default: 'bg-cla-gold text-cla-text hover:bg-cla-gold-darker focus:ring-cla-gold',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    const iconClasses = {
        default: 'bg-cla-gold/10 text-cla-gold',
        destructive: 'bg-red-500/10 text-red-500',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[101] animate-fade-in p-4">
            <div className="bg-cla-bg-dark text-cla-text-dark rounded-lg shadow-xl w-full max-w-md m-4 border border-cla-border-dark">
                <div className="p-6">
                    <div className="flex items-start">
                        <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${iconClasses[variant]}`}>
                            <WarningIcon className="h-6 w-6" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg font-bold leading-6 text-white" id="modal-title">{title}</h3>
                            <div className="mt-2">
                                <p className="text-sm text-cla-text-muted-dark">{message}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-cla-surface-dark px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cla-surface-dark sm:ml-3 sm:w-auto sm:text-sm ${confirmButtonClasses[variant]}`}
                    >
                        {confirmText}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-cla-border-dark shadow-sm px-4 py-2 bg-cla-bg-dark text-base font-medium text-cla-text-dark hover:bg-cla-border-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cla-surface-dark focus:ring-cla-gold sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};