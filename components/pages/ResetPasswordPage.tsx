import React, { useState, useMemo } from 'react';
import { PasswordInput } from '../ui/FormInputs';
import { PasswordStrengthMeter } from '../ui/PasswordStrengthMeter';

export const ResetPasswordPage: React.FC<{ onReset: (newPassword: string) => void; }> = ({ onReset }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
        if (!/(?=.*[a-z])/.test(password)) newErrors.password = 'Password needs at least one lowercase letter.';
        if (!/(?=.*[A-Z])/.test(password)) newErrors.password = 'Password needs at least one uppercase letter.';
        if (!/(?=.*\d)/.test(password)) newErrors.password = 'Password needs at least one number.';
        if (!/(?=.*[\W_])/.test(password)) newErrors.password = 'Password needs at least one special character.';
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onReset(password);
        }
    };

    const passwordStrength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/(?=.*[a-z])/.test(password)) score++;
        if (/(?=.*[A-Z])/.test(password)) score++;
        if (/(?=.*\d)/.test(password)) score++;
        if (/(?=.*[\W_])/.test(password)) score++;
        return score;
    }, [password]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-cla-surface dark:bg-cla-bg-dark py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <form onSubmit={handleSubmit} className="bg-cla-bg dark:bg-cla-surface-dark p-8 rounded-xl shadow-2xl space-y-6">
                    <h2 className="text-3xl font-bold text-center text-cla-text dark:text-cla-text-dark">Set a New Password</h2>
                    <p className="text-center text-sm text-cla-text-muted dark:text-cla-text-muted-dark">
                        Your new password must be secure and different from previous passwords.
                    </p>
                    <div className="space-y-4">
                        <PasswordInput 
                            id="newPassword" 
                            name="newPassword" 
                            label="New Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            error={errors.password} 
                            show={showPassword} 
                            toggleShow={() => setShowPassword(!showPassword)} 
                        />
                        {password && <PasswordStrengthMeter strength={passwordStrength} password={password} />}
                        <PasswordInput 
                            id="confirmNewPassword" 
                            name="confirmNewPassword" 
                            label="Confirm New Password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            error={errors.confirmPassword} 
                            show={showConfirmPassword} 
                            toggleShow={() => setShowConfirmPassword(!showConfirmPassword)} 
                        />
                    </div>
                    <div>
                        <button 
                            type="submit" 
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-cla-text bg-cla-gold hover:bg-cla-gold-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cla-gold"
                        >
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
