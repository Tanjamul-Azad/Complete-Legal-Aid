
import React, { useState } from 'react';
import { GoogleIcon } from '../icons';
import { FormInput, PasswordInput } from '../ui/FormInputs';
import type { UserRole } from '../../types';

interface LoginFormProps {
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errors: Record<string, string>;
    isLoading: boolean;
    setForgotModalOpen: (isOpen: boolean) => void;
    setView: (view: 'login' | 'signup') => void;
    openGoogleAuth: () => void;
    loginRole: UserRole;
}

const GoogleSignIn: React.FC<{ view: string, openGoogleAuth: () => void }> = ({ view, openGoogleAuth }) => (
    <>
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cla-border dark:border-cla-border-dark" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-cla-surface dark:bg-cla-surface-dark text-cla-text-muted dark:text-cla-text-muted-dark">Or continue with</span>
            </div>
        </div>
        <button
            type="button"
            onClick={openGoogleAuth}
            className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-cla-border dark:border-cla-border-dark rounded-xl shadow-sm text-sm font-medium text-cla-text dark:text-cla-text-dark bg-cla-bg dark:bg-cla-bg-dark hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
            <GoogleIcon />
            {view === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
        </button>
    </>
);

export const LoginForm: React.FC<LoginFormProps> = ({
    formData,
    handleInputChange,
    errors,
    isLoading,
    setForgotModalOpen,
    setView,
    openGoogleAuth,
    loginRole
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const roleTitle = loginRole === 'lawyer' ? 'Lawyer' : 'Citizen';

    return (
        <>
            <h2 className="text-2xl font-bold text-center text-cla-text dark:text-cla-text-dark mb-6">
                {roleTitle} Login
            </h2>
            <div className="space-y-5">
                <FormInput id="loginIdentifier" name="loginIdentifier" label="Email / Phone Number" value={formData.loginIdentifier} onChange={handleInputChange} error={errors.loginIdentifier} />
                <PasswordInput id="loginPassword" name="loginPassword" label="Password" value={formData.loginPassword} onChange={handleInputChange} error={errors.loginPassword} show={showPassword} toggleShow={() => setShowPassword(!showPassword)} />
            </div>
            <div className="flex items-center justify-between text-sm mt-4 mb-6">
                <div className="flex items-center">
                    <input id="rememberMe" name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleInputChange} className="h-4 w-4 text-cla-gold focus:ring-cla-gold border-cla-border dark:border-cla-border-dark rounded"/>
                    <label htmlFor="rememberMe" className="ml-2 block text-cla-text-muted dark:text-cla-text-muted-dark">Remember Me</label>
                </div>
                <button type="button" onClick={() => setForgotModalOpen(true)} className="font-medium text-cla-gold hover:underline">Forgot Password?</button>
            </div>
            
            {errors.form && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-sm text-red-600 dark:text-red-400 text-center font-medium">{errors.form}</div>}
            
            <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-cla-gold/20 text-sm font-bold text-cla-text bg-cla-gold hover:bg-cla-gold-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cla-gold disabled:bg-gray-400 disabled:shadow-none transition-all transform active:scale-[0.98]">
                    {isLoading ? 'Signing in...' : 'Log In Securely'}
                </button>
                <p className="mt-6 text-center text-sm text-cla-text-muted dark:text-cla-text-muted-dark">
                    Don't have an account? <button type="button" onClick={() => setView('signup')} className="font-bold text-cla-gold hover:underline">Create an Account</button>
                </p>
            </div>
            <GoogleSignIn view="login" openGoogleAuth={openGoogleAuth} />
        </>
    );
};
