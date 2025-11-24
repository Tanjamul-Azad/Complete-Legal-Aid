
import React, { useState, useEffect, useMemo } from 'react';
import type { Page, User, UserRole } from '../../types';
import { CloseIcon } from '../icons';
import { FormInput } from '../ui/FormInputs';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { AdminLoginForm } from './AdminLoginForm';


export const AuthPage: React.FC<{ 
    onLogin: (emailOrPhone: string, pass: string, rememberMe: boolean, expectedRole: UserRole) => Promise<User | 'PENDING_EMAIL_VERIFICATION' | 'ROLE_MISMATCH' | null>; 
    onSignup: (user: Omit<User, 'id' | 'avatar'>) => Promise<User | null>;
    onSimulateGoogleLogin: (email: string) => void;
    openGoogleAuth: () => void;
    defaultMode: 'login' | 'signup' | 'admin-login';
    initialSignupRole: UserRole;
    onForgotPassword: (email: string) => Promise<boolean>;
    setCurrentPage: (page: Page) => void;
    showLegalPage: (title: string, type: 'terms' | 'privacy') => void;
    onLogout: () => void;
}> = ({ onLogin, onSignup, onSimulateGoogleLogin, openGoogleAuth, defaultMode, initialSignupRole, onForgotPassword, setCurrentPage, showLegalPage, onLogout }) => {
    const [view, setView] = useState<'login' | 'signup' | 'admin-login'>('login');
    
    // We maintain separate role states to remember the user's choice when switching tabs
    const [signupRole, setSignupRole] = useState<UserRole>('citizen');
    const [loginRole, setLoginRole] = useState<UserRole>('citizen');
    
    // Form state
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        language: 'English', terms: false, lawyerId: '', specializations: '',
        doc: null as File | null, commMode: 'Email', lawyerTerms: false,
        loginIdentifier: '', loginPassword: '', rememberMe: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Forgot Password Modal State
    const [isForgotModalOpen, setForgotModalOpen] = useState(false);
    const [forgotStep, setForgotStep] = useState<'email' | 'confirmation'>('email');
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');

    useEffect(() => {
        // Map default mode to internal view state
        if (defaultMode === 'admin-login') {
            setView('admin-login');
        } else if (defaultMode === 'signup') {
            setView('signup');
            setSignupRole(initialSignupRole);
            // Also sync login role so if they switch to login, it stays on the same persona
            setLoginRole(initialSignupRole === 'lawyer' ? 'lawyer' : 'citizen');
        } else {
             setView('login');
             // Sync login role based on intent (e.g. "Join as Lawyer" -> goes to Login -> Lawyer Tab)
             const role = initialSignupRole === 'lawyer' ? 'lawyer' : 'citizen';
             setLoginRole(role);
             setSignupRole(role);
        }
    }, [defaultMode, initialSignupRole]);
    
    const validateField = (name: string, value: any, currentFormData = formData) => {
        let error = '';

        switch (name) {
            case 'name':
                if (!value || value.length < 3 || !/^[a-zA-Z\s.]+$/.test(value)) error = 'Full name must be at least 3 characters and contain only letters and spaces.';
                break;
            case 'email':
                if (!value || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(value)) error = 'Please enter a valid email address.';
                break;
            case 'phone':
                if (!value || !/^(?:\+?88)?01[3-9]\d{8}$/.test(value)) error = 'Please enter a valid Bangladeshi phone number.';
                break;
            case 'password':
                if (!value || value.length < 8) error = 'Password must be at least 8 characters.';
                else if (!/(?=.*[a-z])/.test(value)) error = 'Password needs at least one lowercase letter.';
                else if (!/(?=.*[A-Z])/.test(value)) error = 'Password needs at least one uppercase letter.';
                else if (!/(?=.*\d)/.test(value)) error = 'Password needs at least one number.';
                else if (!/(?=.*[\W_])/.test(value)) error = 'Password needs at least one special character.';
                break;
            case 'confirmPassword':
                if (value !== currentFormData.password) error = 'Passwords do not match.';
                break;
            case 'terms':
                if (!value) error = 'You must agree to the Terms & Privacy Policy.';
                break;
            case 'lawyerId':
                if (signupRole === 'lawyer' && !value) error = 'Bar Council ID is required.';
                break;
            case 'specializations':
                if (signupRole === 'lawyer' && !value) error = 'At least one specialization is required.';
                break;
            case 'doc':
                if (signupRole === 'lawyer' && !value) error = 'Verification document is required.';
                break;
            case 'lawyerTerms':
                if (signupRole === 'lawyer' && !value) error = 'You must agree to the professional conduct policy.';
                break;
            case 'loginIdentifier':
                if (!value) error = 'Email or Phone is required.';
                break;
            case 'loginPassword':
                if (!value) error = 'Password is required.';
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        // @ts-ignore
        const val = isCheckbox ? e.target.checked : value;
        
        const newFormData = { ...formData, [name]: val };
        setFormData(newFormData);

        // Real-time validation
        validateField(name, val, newFormData);

        // If password is changed, re-validate confirmPassword
        if (name === 'password') {
            validateField('confirmPassword', newFormData.confirmPassword, newFormData);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        let error = '';
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                 error = 'File size must be less than 5MB';
            } else if (!['application/pdf', 'image/jpeg'].includes(file.type)) {
                 error = 'Only PDF and JPG files are allowed';
            }
        }
        setErrors(prev => ({...prev, doc: error}));
        setFormData(prev => ({ ...prev, doc: error ? null : file }));
    }

    const validateForm = (isSignup: boolean): boolean => {
        const fieldsToValidate = isSignup
            ? (signupRole === 'citizen'
                ? ['name', 'email', 'phone', 'password', 'confirmPassword', 'terms']
                : ['name', 'email', 'phone', 'password', 'confirmPassword', 'terms', 'lawyerId', 'specializations', 'doc', 'lawyerTerms'])
            : ['loginIdentifier', 'loginPassword'];
        
        let isValid = true;
        // @ts-ignore
        fieldsToValidate.forEach(field => {
            // @ts-ignore
            if (!validateField(field, formData[field], formData)) {
                isValid = false;
            }
        });
        
        return isValid;
    }


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors(prev => ({ ...prev, form: '' }));
        
        const isSignup = view === 'signup';
        if (!validateForm(isSignup)) {
            return;
        }

        setIsLoading(true);
        setTimeout(async () => {
            if (view === 'login' || view === 'admin-login') {
                const expectedRole: UserRole = view === 'admin-login' ? 'admin' : loginRole;
                const result = await onLogin(formData.loginIdentifier, formData.loginPassword, formData.rememberMe, expectedRole);
                
                if (!result) {
                    setErrors(prev => ({ ...prev, form: 'Incorrect email/phone or password. Please try again.' }));
                } else if (result === 'ROLE_MISMATCH') {
                    setErrors(prev => ({ 
                        ...prev, 
                        form: `Account exists but is not a ${expectedRole === 'citizen' ? 'Citizen' : expectedRole === 'lawyer' ? 'Lawyer' : 'Admin'}. Please use the ${expectedRole === 'citizen' ? 'Lawyer' : 'Citizen'} login tab.` 
                    }));
                } else if (result === 'PENDING_EMAIL_VERIFICATION') {
                    setErrors(prev => ({ ...prev, form: 'Your account is not verified. A new verification link has been sent to your email.' }));
                } else if (view === 'admin-login' && result.role !== 'admin') {
                    onLogout(); 
                    setErrors(prev => ({ ...prev, form: 'Access denied. This login is for administrators only.' }));
                }
            } else { // Signup
                const newUser: Omit<User, 'id' | 'avatar'> = {
                    name: formData.name, email: formData.email, password: formData.password,
                    phone: formData.phone, language: formData.language as 'Bangla' | 'English',
                    role: signupRole, verificationStatus: 'Pending',
                };
                if (signupRole === 'lawyer') {
                    newUser.lawyerId = formData.lawyerId;
                    newUser.specializations = formData.specializations.split(',').map(s => s.trim()).filter(Boolean);
                    newUser.communicationMode = formData.commMode as 'Email' | 'Phone' | 'Both';
                    if (formData.doc) {
                         newUser.verificationDocs = [{ name: formData.doc.name, url: '#' }];
                    }
                }
                const user = await onSignup(newUser);
                if (!user) {
                     setErrors(prev => ({ ...prev, form: 'An account with this email already exists.' }));
                }
            }
             setIsLoading(false);
        }, 1000);
    };

    const handleForgotPasswordSubmit = async () => {
        if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(forgotEmail)) {
            setForgotError('Please enter a valid email.');
            return;
        }
        const success = await onForgotPassword(forgotEmail);
        if (success) {
            setForgotStep('confirmation');
            setForgotError('');
        } else {
            setForgotError('No account found with that email address.');
        }
    };
    
    const passwordStrength = useMemo(() => {
        const pass = formData.password;
        let score = 0;
        if (pass.length >= 8) score++;
        if (/(?=.*[a-z])/.test(pass)) score++;
        if (/(?=.*[A-Z])/.test(pass)) score++;
        if (/(?=.*\d)/.test(pass)) score++;
        if (/(?=.*[\W_])/.test(pass)) score++;
        return score;
    }, [formData.password]);
    
    // Smart View Switcher: Keeps role context when switching between login/signup
    const handleSwitchView = (targetView: 'login' | 'signup') => {
        setView(targetView);
        if (targetView === 'login') {
            // If moving to login, use the current signup role as the target login role
            setLoginRole(signupRole);
        } else {
            // If moving to signup, use the current login role as the target signup role
            setSignupRole(loginRole);
        }
    };


    const renderForm = () => {
        switch(view) {
            case 'signup':
                return <SignupForm 
                            signupRole={signupRole} setSignupRole={setSignupRole}
                            formData={formData} handleInputChange={handleInputChange}
                            handleFileChange={handleFileChange} errors={errors}
                            passwordStrength={passwordStrength} isLoading={isLoading}
                            showLegalPage={showLegalPage} 
                            setView={handleSwitchView} 
                            openGoogleAuth={openGoogleAuth}
                        />;
            case 'admin-login':
                return <AdminLoginForm 
                            formData={formData} handleInputChange={handleInputChange}
                            errors={errors} isLoading={isLoading} setView={setView}
                        />;
            case 'login':
            default:
                return (
                    <>
                        <div className="border-b border-cla-border dark:border-cla-border-dark mb-6">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button 
                                    type="button" 
                                    onClick={() => setLoginRole('citizen')} 
                                    className={`${loginRole === 'citizen' ? 'border-cla-gold text-cla-gold' : 'border-transparent text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    Citizen Login
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setLoginRole('lawyer')} 
                                    className={`${loginRole === 'lawyer' ? 'border-cla-gold text-cla-gold' : 'border-transparent text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    Lawyer Login
                                </button>
                            </nav>
                        </div>
                        <LoginForm 
                            formData={formData} handleInputChange={handleInputChange}
                            errors={errors} isLoading={isLoading}
                            setForgotModalOpen={setForgotModalOpen} 
                            setView={handleSwitchView}
                            openGoogleAuth={openGoogleAuth}
                            loginRole={loginRole}
                        />
                    </>
                );
        }
    }

    return (
        <div className="min-h-[85vh] flex items-center justify-center bg-cla-bg dark:bg-cla-bg-dark py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full">
                <form onSubmit={handleSubmit} className="bg-cla-surface dark:bg-cla-surface-dark p-8 rounded-2xl shadow-xl dark:shadow-black/40 border border-cla-border dark:border-white/5 space-y-6">
                    {renderForm()}
                </form>
            </div>
            {isForgotModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-cla-surface dark:bg-cla-surface-dark rounded-xl shadow-2xl w-full max-w-md m-4 p-6 relative border border-cla-border dark:border-white/10">
                         <button onClick={() => setForgotModalOpen(false)} className="absolute top-4 right-4 text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                            <CloseIcon />
                        </button>
                        {forgotStep === 'email' ? (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-cla-text dark:text-cla-text-dark">Reset Your Password</h3>
                                <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">Enter your registered email address below. We will simulate sending a password reset link to your inbox.</p>
                                <FormInput id="forgotEmail" name="forgotEmail" label="Email Address" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} error={forgotError} />
                                <button onClick={handleForgotPasswordSubmit} className="w-full bg-cla-gold hover:bg-cla-gold-darker text-cla-text font-bold py-2.5 px-4 rounded-lg transition-colors">
                                    Send Reset Link
                                </button>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <h3 className="text-xl font-bold text-cla-text dark:text-cla-text-dark">Check Your Inbox</h3>
                                <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">We've simulated sending a password recovery link to <strong>{forgotEmail}</strong>. Please check the simulated inbox (mail icon in the header).</p>
                                <button onClick={() => setForgotModalOpen(false)} className="w-full bg-cla-gold hover:bg-cla-gold-darker text-cla-text font-bold py-2.5 px-4 rounded-lg transition-colors">
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
