import React, { useState } from 'react';
import type { Page, UserRole } from '../../types';
import { GoogleIcon } from '../icons';
import { FormInput, PasswordInput } from '../ui/FormInputs';
import { PasswordStrengthMeter } from '../ui/PasswordStrengthMeter';

interface SignupFormProps {
    signupRole: UserRole;
    setSignupRole: (role: UserRole) => void;
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errors: Record<string, string>;
    passwordStrength: number;
    isLoading: boolean;
    showLegalPage: (title: string, type: 'terms' | 'privacy') => void;
    setView: (view: 'login' | 'signup' | 'admin-login') => void;
    openGoogleAuth: () => void;
}

const GoogleSignIn: React.FC<{ view: string, openGoogleAuth: () => void }> = ({ view, openGoogleAuth }) => (
    <>
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cla-border dark:border-cla-border-dark" />
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-cla-bg dark:bg-cla-surface-dark text-cla-text-muted dark:text-cla-text-muted-dark">Or continue with</span>
            </div>
        </div>
        <button
            type="button"
            onClick={openGoogleAuth}
            className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-cla-border dark:border-cla-border-dark rounded-md shadow-sm text-sm font-medium text-cla-text dark:text-cla-text-dark bg-cla-bg dark:bg-cla-surface-dark hover:bg-cla-surface dark:hover:bg-cla-bg-dark"
        >
            <GoogleIcon />
            {view === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
        </button>
    </>
);

export const SignupForm: React.FC<SignupFormProps> = ({
    signupRole,
    setSignupRole,
    formData,
    handleInputChange,
    handleFileChange,
    errors,
    passwordStrength,
    isLoading,
    showLegalPage,
    setView,
    openGoogleAuth,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <>
            <div className="border-b border-cla-border dark:border-cla-border-dark">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <button type="button" onClick={() => setSignupRole('citizen')} className={`${signupRole === 'citizen' ? 'border-cla-gold text-cla-gold' : 'border-transparent text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Citizen/User Signup
                    </button>
                    <button type="button" onClick={() => setSignupRole('lawyer')} className={`${signupRole === 'lawyer' ? 'border-cla-gold text-cla-gold' : 'border-transparent text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Lawyer Signup
                    </button>
                </nav>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-cla-text dark:text-cla-text-dark pt-4">
                {signupRole === 'citizen' ? "Create Your Account — Access Justice Simplified" : "Join as a Verified Legal Professional"}
            </h2>

            <div className="space-y-4">
                <FormInput id="name" name="name" label="Full Name" value={formData.name} onChange={handleInputChange} error={errors.name}/>
                <FormInput id="email" name="email" label="Email Address" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} />
                <FormInput id="phone" name="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleInputChange} error={errors.phone} />
                <PasswordInput id="password" name="password" label="Password" value={formData.password} onChange={handleInputChange} error={errors.password} show={showPassword} toggleShow={() => setShowPassword(!showPassword)} />
                {formData.password && <PasswordStrengthMeter strength={passwordStrength} password={formData.password} />}
                <PasswordInput id="confirmPassword" name="confirmPassword" label="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} show={showConfirmPassword} toggleShow={() => setShowConfirmPassword(!showConfirmPassword)} />

                {signupRole === 'lawyer' && (
                    <>
                        <FormInput id="lawyerId" name="lawyerId" label="Lawyer ID / Bar Council Registration Number" value={formData.lawyerId} onChange={handleInputChange} error={errors.lawyerId} />
                        <FormInput id="specializations" name="specializations" label="Specializations (comma-separated)" value={formData.specializations} onChange={handleInputChange} error={errors.specializations} />
                        <div>
                             <label htmlFor="doc" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Upload Verification Document (PDF/JPG)</label>
                            <input id="doc" name="doc" type="file" accept=".pdf,.jpg,.jpeg" onChange={handleFileChange} className="mt-1 block w-full text-sm text-cla-text-muted dark:text-cla-text-muted-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cla-gold/20 file:text-cla-gold-darker hover:file:bg-cla-gold/30"/>
                            <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark mt-1">Max size: 5 MB. Must be a clear copy of your NID or license.</p>
                             {errors.doc && <p className="mt-1 text-xs text-red-500">{errors.doc}</p>}
                        </div>
                         <div>
                            <label htmlFor="commMode" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Preferred Communication Mode</label>
                            <select id="commMode" name="commMode" value={formData.commMode} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 border-cla-border dark:border-cla-border-dark rounded-md bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark">
                                <option>Email</option><option>Phone</option><option>Both</option>
                            </select>
                        </div>
                    </>
                )}
                 <div>
                    <label htmlFor="language" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Preferred Language</label>
                    <select id="language" name="language" value={formData.language} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 border-cla-border dark:border-cla-border-dark rounded-md bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark">
                        <option>English</option><option>Bangla</option>
                    </select>
                </div>

                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input id="terms" name="terms" type="checkbox" checked={formData.terms} onChange={handleInputChange} className="h-4 w-4 text-cla-gold focus:ring-cla-gold border-gray-300 rounded"/>
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="terms" className="text-cla-text-muted dark:text-cla-text-muted-dark">I agree to the <button type="button" onClick={() => showLegalPage('Terms & Privacy Policy', 'terms')} className="font-medium text-cla-gold hover:underline">Terms & Privacy Policy</button></label>
                        {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
                    </div>
                </div>
                
                 {signupRole === 'lawyer' && (
                     <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="lawyerTerms" name="lawyerTerms" type="checkbox" checked={formData.lawyerTerms} onChange={handleInputChange} className="h-4 w-4 text-cla-gold focus:ring-cla-gold border-gray-300 rounded"/>
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="lawyerTerms" className="text-cla-text-muted dark:text-cla-text-muted-dark">I confirm that the provided details are true and agree to Complete Legal Aid’s professional conduct policy.</label>
                            {errors.lawyerTerms && <p className="mt-1 text-xs text-red-500">{errors.lawyerTerms}</p>}
                        </div>
                    </div>
                )}
            </div>

            {errors.form && <p className="text-sm text-red-600 text-center">{errors.form}</p>}
            
            <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-cla-text bg-cla-gold hover:bg-cla-gold-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cla-gold disabled:bg-gray-400">
                     {isLoading ? 'Creating account...' : (signupRole === 'citizen' ? 'Create My Account' : 'Register as Lawyer')}
                </button>
                <p className="mt-4 text-center text-sm">
                    Already have an account? <button type="button" onClick={() => setView('login')} className="font-medium text-cla-gold hover:text-cla-gold-darker">Log In</button>
                </p>
            </div>
             <GoogleSignIn view="signup" openGoogleAuth={openGoogleAuth} />
             <p className="mt-4 text-xs text-center text-cla-text-muted dark:text-cla-text-muted-dark">
                Your personal data is protected under the Digital Security Act of Bangladesh and will be used solely for verification and case management.
            </p>
        </>
    );
};
