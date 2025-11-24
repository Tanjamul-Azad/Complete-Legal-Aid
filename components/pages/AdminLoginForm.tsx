
import React, { useState } from 'react';
import { FormInput, PasswordInput } from '../ui/FormInputs';
import { ShieldCheckIcon } from '../icons';

interface AdminLoginFormProps {
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errors: Record<string, string>;
    isLoading: boolean;
    setView: (view: 'login' | 'signup' | 'admin-login') => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
    formData,
    handleInputChange,
    errors,
    isLoading,
    setView
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <div className="flex flex-col items-center mb-6">
                <div className="p-4 bg-cla-gold/10 rounded-full mb-4 ring-4 ring-cla-gold/5">
                    <ShieldCheckIcon className="w-10 h-10 text-cla-gold" />
                </div>
                <h2 className="text-3xl font-bold text-center text-cla-text dark:text-cla-text-dark">Admin Portal</h2>
                <p className="text-center text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-2 max-w-xs">
                    Secure access restricted to authorized administrators only.
                </p>
            </div>
            <div className="space-y-5">
                <FormInput id="loginIdentifier" name="loginIdentifier" label="Admin Email / ID" value={formData.loginIdentifier} onChange={handleInputChange} error={errors.loginIdentifier} />
                <PasswordInput id="loginPassword" name="loginPassword" label="Password" value={formData.loginPassword} onChange={handleInputChange} error={errors.loginPassword} show={showPassword} toggleShow={() => setShowPassword(!showPassword)} />
            </div>
            {errors.form && <p className="text-sm text-red-600 text-center font-medium mt-4 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/20">{errors.form}</p>}
            <div className="mt-8">
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-cla-text bg-cla-gold hover:bg-cla-gold-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cla-gold disabled:bg-gray-400 transition-all hover:shadow-lg">
                    {isLoading ? 'Verifying Credentials...' : 'Access Dashboard'}
                </button>
                <div className="mt-6 border-t border-cla-border dark:border-cla-border-dark pt-4">
                    <p className="text-center text-sm text-cla-text-muted dark:text-cla-text-muted-dark">
                        Not an admin? <button type="button" onClick={() => setView('login')} className="font-medium text-cla-gold hover:text-cla-gold-darker ml-1 hover:underline">Return to Main Login</button>
                    </p>
                </div>
            </div>
        </>
    );
};
