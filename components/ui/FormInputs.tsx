import React from 'react';
import { EyeIcon, EyeSlashIcon } from '../icons';

export const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ id, label, type = 'text', error, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">{label}</label>
        <input id={id} type={type} {...props} className={`mt-1 block w-full px-3 py-2 bg-cla-bg dark:bg-cla-bg-dark border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cla-gold focus:border-cla-gold sm:text-sm text-cla-text dark:text-cla-text-dark ${error ? 'border-red-500 ring-red-500' : 'border-cla-border dark:border-cla-border-dark'}`} />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export const PasswordInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; show: boolean; toggleShow: () => void; }> = ({ id, label, error, show, toggleShow, ...props }) => (
     <div>
        <label htmlFor={id} className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">{label}</label>
        <div className="relative mt-1">
            <input id={id} type={show ? 'text' : 'password'} {...props} className={`block w-full px-3 py-2 bg-cla-bg dark:bg-cla-bg-dark border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cla-gold focus:border-cla-gold sm:text-sm text-cla-text dark:text-cla-text-dark ${error ? 'border-red-500 ring-red-500' : 'border-cla-border dark:border-cla-border-dark'}`} />
            <button type="button" onClick={toggleShow} className="absolute inset-y-0 right-0 pr-3 flex items-center text-cla-text-muted dark:text-cla-text-muted-dark">
                {show ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
            </button>
        </div>
         {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);
