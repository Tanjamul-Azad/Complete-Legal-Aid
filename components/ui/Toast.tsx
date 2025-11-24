import React, { useEffect } from 'react';

export const Toast: React.FC<{ message: string; show: boolean; onDismiss: () => void; type?: 'success' | 'error' }> = ({ message, show, onDismiss, type = 'success' }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onDismiss();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onDismiss]);

    if (!show) return null;

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`fixed top-20 right-5 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-[101] animate-fade-in`}>
            {message}
        </div>
    );
};
