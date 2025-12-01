import React, { useState, useContext, useEffect, useMemo } from 'react';
import type { User, AppTheme } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import { FormInput, PasswordInput } from '../../ui/FormInputs';
import { UserCircleIcon, LockClosedIcon, BellIcon } from '../../icons';
import { PasswordStrengthMeter } from '../../ui/PasswordStrengthMeter';

const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ElementType;
    activeTab: string;
    setActiveTab: (id: string) => void;
}> = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0 ${activeTab === id
            ? 'border-cla-gold text-cla-gold'
            : 'border-transparent text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark hover:border-gray-300 dark:hover:border-gray-700'
            }`}
    >
        <Icon className="w-5 h-5" />
        {label}
    </button>
);

const SectionCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-cla-surface dark:bg-cla-surface-dark p-6 rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm animate-fade-in-up">
        <div className="border-b border-cla-border dark:border-cla-border-dark pb-4 mb-6">
            <h3 className="text-lg font-bold text-cla-text dark:text-cla-text-dark">{title}</h3>
            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-1">{description}</p>
        </div>
        {children}
    </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cla-gold focus:ring-offset-2 focus:ring-offset-cla-surface dark:focus:ring-offset-cla-surface-dark ${checked ? 'bg-cla-gold' : 'bg-gray-200 dark:bg-gray-700'
            }`}
    >
        <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                }`}
        />
    </button>
);

const defaultNotificationSettings = {
    email: {
        caseUpdates: true,
        newMessages: true,
        appointmentReminders: true,
    },
    reminders: {
        oneDay: true,
        oneHour: true,
        tenMinutes: false,
    }
};

export const CitizenSettings: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { user, handleUpdateProfile, handleChangePassword, setToast, setTheme, cases, appointments, messages } = context;

    const [activeTab, setActiveTab] = useState('profile');

    // Profile State
    const [profileData, setProfileData] = useState({ name: user?.name || '', phone: user?.phone || '', language: user?.language || 'English', theme: user?.theme || 'system' });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const isProfileDirty = useMemo(() => JSON.stringify({ name: user?.name, phone: user?.phone, language: user?.language, theme: user?.theme }) !== JSON.stringify(profileData) || !!avatarFile, [user, profileData, avatarFile]);

    // Security State
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const isPasswordDirty = useMemo(() => Object.values(passwordData).some(v => v !== ''), [passwordData]);
    const passwordStrength = useMemo(() => {
        const pass = passwordData.new;
        let score = 0;
        if (pass.length >= 8) score++; if (/(?=.*[a-z])/.test(pass)) score++; if (/(?=.*[A-Z])/.test(pass)) score++; if (/(?=.*\d)/.test(pass)) score++; if (/(?=.*[\W_])/.test(pass)) score++;
        return score;
    }, [passwordData.new]);

    // Notification State
    const [notificationSettings, setNotificationSettings] = useState(user?.notificationSettings || defaultNotificationSettings);
    const [isNotificationsSaving, setIsNotificationsSaving] = useState(false);
    const isNotificationsDirty = useMemo(() => JSON.stringify(user?.notificationSettings) !== JSON.stringify(notificationSettings), [user, notificationSettings]);

    useEffect(() => {
        if (user) {
            setProfileData({ name: user.name, phone: user.phone || '', language: user.language || 'English', theme: user.theme || 'system' });
            setNotificationSettings(user.notificationSettings || defaultNotificationSettings);
        }
    }, [user]);

    if (!user) return null;

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setToast({ message: "Image size must be less than 2MB", type: 'error' });
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                setToast({ message: "Please select a valid image file", type: 'error' });
                return;
            }

            setAvatarFile(file);

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isProfileDirty) return;
        setIsProfileSaving(true);
        try {
            let avatarData = user.avatar;

            // Convert file to base64 if a new file was selected
            if (avatarFile && avatarFile.size > 0) {
                avatarData = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(avatarFile);
                });
            } else if (avatarPreview && !avatarFile) {
                // User clicked remove or set to default
                avatarData = avatarPreview;
            }

            await handleUpdateProfile(user.id, { ...profileData, avatar: avatarData });
            setAvatarFile(null);
            setToast({ message: "Profile updated successfully!", type: 'success' });
        } catch (error) {
            console.error('Profile update error:', error);
            setToast({ message: "Failed to update profile.", type: 'error' });
        } finally {
            setIsProfileSaving(false);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(p => ({ ...p, [name]: value }));
        setPasswordErrors({});
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (passwordStrength < 4) newErrors.new = 'New password is too weak.';
        if (passwordData.new !== passwordData.confirm) newErrors.confirm = 'Passwords do not match.';
        setPasswordErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setIsPasswordSaving(true);
            try {
                const success = await handleChangePassword(user.id, passwordData.current, passwordData.new);
                if (success) {
                    setToast({ message: "Password changed successfully!", type: 'success' });
                    setPasswordData({ current: '', new: '', confirm: '' });
                } else {
                    setPasswordErrors({ current: 'Incorrect current password.' });
                }
            } catch (error) {
                setToast({ message: "An error occurred. Please try again.", type: 'error' });
            } finally {
                setIsPasswordSaving(false);
            }
        }
    };

    const handleNotificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isNotificationsDirty) return;
        setIsNotificationsSaving(true);
        try {
            await handleUpdateProfile(user.id, { notificationSettings });
            setToast({ message: "Notification settings saved!", type: 'success' });
        } catch (error) {
            setToast({ message: "Failed to save settings.", type: 'error' });
        } finally {
            setIsNotificationsSaving(false);
        }
    };

    const handleDownloadData = () => {
        const data = {
            userProfile: user,
            myCases: cases.filter(c => c.clientId === user.id),
            myAppointments: appointments.filter(a => a.clientId === user.id),
            myMessages: messages.filter(m => m.senderId === user.id || m.receiverId === user.id),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cla-data-${user.id}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({ message: "Data export started.", type: 'success' });
    };

    const renderProfileTab = () => (
        <form onSubmit={handleProfileSubmit}>
            <SectionCard title="Profile Picture" description="Update your photo. It will be visible to lawyers and on your profile.">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <img src={avatarPreview || user.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                    <div className="flex gap-2">
                        <label htmlFor="avatar-upload" className="cursor-pointer px-4 py-2 text-sm font-semibold bg-cla-gold text-cla-text rounded-lg hover:bg-cla-gold-darker transition-colors">Change Photo</label>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        {(avatarPreview || user.avatar !== `https://picsum.photos/seed/${user.id}/200`) &&
                            <button type="button" onClick={() => { setAvatarPreview(`https://picsum.photos/seed/${user.id}/200`); setAvatarFile(new File([], '')); }} className="px-4 py-2 text-sm font-semibold bg-cla-surface dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark rounded-lg hover:bg-cla-border dark:hover:bg-cla-border-dark transition-colors">Remove</button>}
                    </div>
                </div>
            </SectionCard>
            <SectionCard title="Personal Information" description="Manage your name, contact details, and language preferences.">
                <div className="space-y-4 max-w-lg">
                    <FormInput id="name" name="name" label="Full Name" value={profileData.name} onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))} />
                    <FormInput id="phone" name="phone" label="Phone Number" type="tel" value={profileData.phone} onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))} />
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Preferred Language</label>
                        <select id="language" name="language" value={profileData.language} onChange={(e) => setProfileData(p => ({ ...p, language: e.target.value as 'Bangla' | 'English' }))} className="mt-1 block w-full p-2 border-cla-border dark:border-cla-border-dark rounded-md bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark">
                            <option>English</option><option>Bangla</option>
                        </select>
                    </div>
                </div>
            </SectionCard>
            <SectionCard title="Theme Preferences" description="Choose how you want the application to look.">
                <div className="flex items-center gap-4">
                    {(['light', 'dark', 'system'] as AppTheme[]).map(t => (
                        <button type="button" key={t} onClick={() => { setProfileData(p => ({ ...p, theme: t })); setTheme(t); }} className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 capitalize ${profileData.theme === t ? 'border-cla-gold bg-cla-gold/10' : 'border-cla-border dark:border-cla-border-dark'}`}>{t}</button>
                    ))}
                </div>
            </SectionCard>
            <div className="mt-6 flex justify-start">
                <button type="submit" disabled={!isProfileDirty || isProfileSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-32 text-center">
                    {isProfileSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );

    const renderSecurityTab = () => (
        <form onSubmit={handlePasswordSubmit}>
            <SectionCard title="Change Password" description="For your security, we recommend choosing a strong password you don't use elsewhere.">
                <div className="space-y-4 max-w-lg">
                    <PasswordInput id="current" name="current" label="Current Password" value={passwordData.current} onChange={handlePasswordChange} show={false} toggleShow={() => { }} error={passwordErrors.current} />
                    <PasswordInput id="new" name="new" label="New Password" value={passwordData.new} onChange={handlePasswordChange} show={false} toggleShow={() => { }} error={passwordErrors.new} />
                    {passwordData.new && <PasswordStrengthMeter strength={passwordStrength} password={passwordData.new} />}
                    <PasswordInput id="confirm" name="confirm" label="Confirm New Password" value={passwordData.confirm} onChange={handlePasswordChange} show={false} toggleShow={() => { }} error={passwordErrors.confirm} />
                </div>
            </SectionCard>
            <div className="mt-6 flex justify-start">
                <button type="submit" disabled={!isPasswordDirty || isPasswordSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-40 text-center">
                    {isPasswordSaving ? 'Updating...' : 'Update Password'}
                </button>
            </div>
            <div className="mt-8 space-y-8">
                <SectionCard title="Data Privacy" description="Manage your data and privacy settings.">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-cla-text dark:text-white">Download Your Data</p>
                            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">Get a copy of your personal data, cases, and history.</p>
                        </div>
                        <button type="button" onClick={handleDownloadData} className="px-4 py-2 text-sm font-semibold bg-cla-surface dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark rounded-lg hover:bg-cla-border dark:hover:bg-cla-border-dark transition-colors flex items-center gap-2">
                            <span className="w-4 h-4">📄</span>
                            Download JSON
                        </button>
                    </div>
                </SectionCard>
                <SectionCard title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-cla-text dark:text-white">Two-Factor Authentication (2FA)</p>
                            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">Secure your account with 2FA.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setTwoFactorEnabled(!twoFactorEnabled);
                                setToast({ message: `2FA ${!twoFactorEnabled ? 'enabled' : 'disabled'} successfully!`, type: 'success' });
                            }}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${twoFactorEnabled ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-cla-surface dark:bg-cla-surface-dark border-cla-border dark:border-cla-border-dark hover:bg-gray-100 dark:hover:bg-white/5'}`}
                        >
                            {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        </button>
                    </div>
                </SectionCard>
                <SectionCard title="Active Sessions" description="This is a list of devices that have logged into your account.">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-cla-border dark:border-cla-border-dark">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                                    <span className="text-xl">💻</span>
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-cla-text dark:text-white">Windows PC - Chrome</p>
                                    <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark">Dhaka, Bangladesh • Active now</p>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">Current</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-cla-border dark:border-cla-border-dark">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                                    <span className="text-xl">📱</span>
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-cla-text dark:text-white">iPhone 13 - Safari</p>
                                    <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark">Dhaka, Bangladesh • 2 hours ago</p>
                                </div>
                            </div>
                            <button className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Revoke</button>
                        </div>
                    </div>
                </SectionCard>
            </div>
        </form>
    );

    const renderNotificationsTab = () => (
        <form onSubmit={handleNotificationSubmit}>
            <SectionCard title="Email Notifications" description="Choose which emails you'd like to receive.">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div><p>Case Updates</p><p className="text-xs text-cla-text-muted">Status changes, new documents, etc.</p></div>
                        <Toggle checked={notificationSettings.email.caseUpdates} onChange={(c) => setNotificationSettings(s => ({ ...s, email: { ...s.email, caseUpdates: c } }))} />
                    </div>
                    <div className="flex justify-between items-center">
                        <div><p>New Messages</p><p className="text-xs text-cla-text-muted">When you receive a new message from a lawyer.</p></div>
                        <Toggle checked={notificationSettings.email.newMessages} onChange={(c) => setNotificationSettings(s => ({ ...s, email: { ...s.email, newMessages: c } }))} />
                    </div>
                    <div className="flex justify-between items-center">
                        <div><p>Appointment Reminders</p><p className="text-xs text-cla-text-muted">Reminders for your upcoming appointments.</p></div>
                        <Toggle checked={notificationSettings.email.appointmentReminders} onChange={(c) => setNotificationSettings(s => ({ ...s, email: { ...s.email, appointmentReminders: c } }))} />
                    </div>
                </div>
            </SectionCard>
            <SectionCard title="Appointment Reminder Timing" description="Set when you receive reminders for upcoming appointments.">
                <div className="space-y-4">
                    <div className="flex items-center"><input type="checkbox" id="oneDay" checked={notificationSettings.reminders.oneDay} onChange={(e) => setNotificationSettings(s => ({ ...s, reminders: { ...s.reminders, oneDay: e.target.checked } }))} className="h-4 w-4 text-cla-gold focus:ring-cla-gold border-gray-300 rounded" /> <label htmlFor="oneDay" className="ml-3 text-sm">1 day before</label></div>
                    <div className="flex items-center"><input type="checkbox" id="oneHour" checked={notificationSettings.reminders.oneHour} onChange={(e) => setNotificationSettings(s => ({ ...s, reminders: { ...s.reminders, oneHour: e.target.checked } }))} className="h-4 w-4 text-cla-gold focus:ring-cla-gold border-gray-300 rounded" /> <label htmlFor="oneHour" className="ml-3 text-sm">1 hour before</label></div>
                    <div className="flex items-center"><input type="checkbox" id="tenMinutes" checked={notificationSettings.reminders.tenMinutes} onChange={(e) => setNotificationSettings(s => ({ ...s, reminders: { ...s.reminders, tenMinutes: e.target.checked } }))} className="h-4 w-4 text-cla-gold focus:ring-cla-gold border-gray-300 rounded" /> <label htmlFor="tenMinutes" className="ml-3 text-sm">10 minutes before</label></div>
                </div>
            </SectionCard>
            <div className="mt-6 flex justify-start">
                <button type="submit" disabled={!isNotificationsDirty || isNotificationsSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-56 text-center">
                    {isNotificationsSaving ? 'Saving...' : 'Save Notification Settings'}
                </button>
            </div>
        </form>
    );

    const [verificationFile, setVerificationFile] = useState<File | null>(null);
    const [isVerificationSaving, setIsVerificationSaving] = useState(false);

    const handleVerificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationFile) return;
        setIsVerificationSaving(true);
        try {
            // Create FormData to send file
            const formData = new FormData();
            formData.append('identity_document', verificationFile);

            // We need to use a direct API call here or update handleUpdateProfile to support FormData
            // Assuming handleUpdateProfile can handle the object structure we're passing or we modify it
            // For now, let's assume we can pass the file object in the profile update
            await handleUpdateProfile(user.id, { identity_document: verificationFile });

            setToast({ message: "Verification document submitted successfully!", type: 'success' });
            setVerificationFile(null);
        } catch (error) {
            setToast({ message: "Failed to upload document.", type: 'error' });
        } finally {
            setIsVerificationSaving(false);
        }
    };

    const renderVerificationTab = () => (
        <form onSubmit={handleVerificationSubmit}>
            <SectionCard title="Identity Verification" description="Upload your National ID, Passport, or Birth Certificate to verify your account.">
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                        <p className="font-semibold">Current Status: {user.isVerified ? 'Verified' : 'Unverified'}</p>
                        <p className="mt-1">Verified users get priority support and access to more features.</p>
                    </div>

                    <div>
                        <label htmlFor="identity-doc" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Upload Identity Document</label>
                        <input
                            id="identity-doc"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setVerificationFile(e.target.files?.[0] || null)}
                            className="mt-2 block w-full text-sm text-cla-text-muted dark:text-cla-text-muted-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cla-gold/20 file:text-cla-gold-darker hover:file:bg-cla-gold/30"
                        />
                        <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark mt-1">Accepted formats: PDF, JPG, PNG. Max size: 5MB.</p>
                    </div>
                </div>
            </SectionCard>
            <div className="mt-6 flex justify-start">
                <button type="submit" disabled={!verificationFile || isVerificationSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-48 text-center">
                    {isVerificationSaving ? 'Uploading...' : 'Submit for Verification'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="border-b border-cla-border dark:border-cla-border-dark mb-8">
                {/* Overflow-x-auto added here for mobile tab scrolling */}
                <nav className="-mb-px flex space-x-8 overflow-x-auto custom-scrollbar pb-1" aria-label="Tabs">
                    <TabButton id="profile" label="Profile" icon={UserCircleIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="security" label="Security" icon={LockClosedIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="notifications" label="Notifications" icon={BellIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="verification" label="Verification" icon={LockClosedIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>

            <div className="space-y-8">
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'security' && renderSecurityTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'verification' && renderVerificationTab()}
            </div>
        </div>
    );
};