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
        className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === id
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
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cla-gold focus:ring-offset-2 focus:ring-offset-cla-surface dark:focus:ring-offset-cla-surface-dark ${
            checked ? 'bg-cla-gold' : 'bg-gray-200 dark:bg-gray-700'
        }`}
    >
        <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                checked ? 'translate-x-5' : 'translate-x-0'
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
    const { user, handleUpdateProfile, handleChangePassword, setToast, setTheme } = context;

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
        if(user) {
            setProfileData({ name: user.name, phone: user.phone || '', language: user.language || 'English', theme: user.theme || 'system' });
            setNotificationSettings(user.notificationSettings || defaultNotificationSettings);
        }
    }, [user]);

    if (!user) return null;
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isProfileDirty) return;
        setIsProfileSaving(true);
        try {
            const updatedAvatar = avatarPreview || user.avatar;
            await handleUpdateProfile(user.id, { ...profileData, avatar: updatedAvatar });
            setAvatarFile(null);
            setToast({ message: "Profile updated successfully!", type: 'success' });
        } catch (error) {
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

    const renderProfileTab = () => (
        <form onSubmit={handleProfileSubmit}>
            <SectionCard title="Profile Picture" description="Update your photo. It will be visible to lawyers and on your profile.">
                 <div className="flex items-center gap-6">
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
                    <FormInput id="name" name="name" label="Full Name" value={profileData.name} onChange={(e) => setProfileData(p => ({...p, name: e.target.value}))} />
                    <FormInput id="phone" name="phone" label="Phone Number" type="tel" value={profileData.phone} onChange={(e) => setProfileData(p => ({...p, phone: e.target.value}))} />
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Preferred Language</label>
                        <select id="language" name="language" value={profileData.language} onChange={(e) => setProfileData(p => ({...p, language: e.target.value as 'Bangla' | 'English'}))} className="mt-1 block w-full p-2 border-cla-border dark:border-cla-border-dark rounded-md bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark">
                            <option>English</option><option>Bangla</option>
                        </select>
                    </div>
                </div>
            </SectionCard>
            <SectionCard title="Theme Preferences" description="Choose how you want the application to look.">
                <div className="flex items-center gap-4">
                    {(['light', 'dark', 'system'] as AppTheme[]).map(t => (
                        <button type="button" key={t} onClick={() => { setProfileData(p => ({...p, theme: t})); setTheme(t); }} className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 capitalize ${profileData.theme === t ? 'border-cla-gold bg-cla-gold/10' : 'border-cla-border dark:border-cla-border-dark'}`}>{t}</button>
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
                    <PasswordInput id="current" name="current" label="Current Password" value={passwordData.current} onChange={handlePasswordChange} show={false} toggleShow={()=>{}} error={passwordErrors.current} />
                    <PasswordInput id="new" name="new" label="New Password" value={passwordData.new} onChange={handlePasswordChange} show={false} toggleShow={()=>{}} error={passwordErrors.new} />
                    {passwordData.new && <PasswordStrengthMeter strength={passwordStrength} password={passwordData.new} />}
                    <PasswordInput id="confirm" name="confirm" label="Confirm New Password" value={passwordData.confirm} onChange={handlePasswordChange} show={false} toggleShow={()=>{}} error={passwordErrors.confirm} />
                 </div>
             </SectionCard>
            <div className="mt-6 flex justify-start">
                <button type="submit" disabled={!isPasswordDirty || isPasswordSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-40 text-center">
                    {isPasswordSaving ? 'Updating...' : 'Update Password'}
                </button>
            </div>
             <div className="mt-8 space-y-8">
                 <SectionCard title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
                    <button type="button" className="px-4 py-2 text-sm font-semibold bg-cla-surface dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark rounded-lg" disabled>Enable 2FA (Coming Soon)</button>
                 </SectionCard>
                 <SectionCard title="Active Sessions" description="This is a list of devices that have logged into your account.">
                     <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">Feature coming soon.</p>
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
                        <Toggle checked={notificationSettings.email.caseUpdates} onChange={(c) => setNotificationSettings(s => ({...s, email: {...s.email, caseUpdates: c}}))} />
                     </div>
                      <div className="flex justify-between items-center">
                        <div><p>New Messages</p><p className="text-xs text-cla-text-muted">When you receive a new message from a lawyer.</p></div>
                         <Toggle checked={notificationSettings.email.newMessages} onChange={(c) => setNotificationSettings(s => ({...s, email: {...s.email, newMessages: c}}))} />
                     </div>
                      <div className="flex justify-between items-center">
                        <div><p>Appointment Reminders</p><p className="text-xs text-cla-text-muted">Reminders for your upcoming appointments.</p></div>
                        <Toggle checked={notificationSettings.email.appointmentReminders} onChange={(c) => setNotificationSettings(s => ({...s, email: {...s.email, appointmentReminders: c}}))} />
                     </div>
                 </div>
            </SectionCard>
             <SectionCard title="Appointment Reminder Timing" description="Set when you receive reminders for upcoming appointments.">
                <div className="space-y-4">
                    <div className="flex items-center"><input type="checkbox" id="oneDay" checked={notificationSettings.reminders.oneDay} onChange={(e) => setNotificationSettings(s => ({...s, reminders: {...s.reminders, oneDay: e.target.checked}}))} className="h-4 w-4 text-cla-gold focus:ring-cla-gold border-gray-300 rounded"/> <label htmlFor="oneDay" className="ml-3 text-sm">1 day before</label></div>
                    <div className="flex items-center"><input type="checkbox" id="oneHour" checked={notificationSettings.reminders.oneHour} onChange={(e) => setNotificationSettings(s => ({...s, reminders: {...s.reminders, oneHour: e.target.checked}}))} className="h-4 w-4 text-cla-gold focus:ring-cla-gold border-gray-300 rounded"/> <label htmlFor="oneHour" className="ml-3 text-sm">1 hour before</label></div>
                    <div className="flex items-center"><input type="checkbox" id="tenMinutes" checked={notificationSettings.reminders.tenMinutes} onChange={(e) => setNotificationSettings(s => ({...s, reminders: {...s.reminders, tenMinutes: e.target.checked}}))} className="h-4 w-4 text-cla-gold focus:ring-cla-gold border-gray-300 rounded"/> <label htmlFor="tenMinutes" className="ml-3 text-sm">10 minutes before</label></div>
                </div>
            </SectionCard>
            <div className="mt-6 flex justify-start">
                <button type="submit" disabled={!isNotificationsDirty || isNotificationsSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-56 text-center">
                    {isNotificationsSaving ? 'Saving...' : 'Save Notification Settings'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="border-b border-cla-border dark:border-cla-border-dark mb-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton id="profile" label="Profile" icon={UserCircleIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="security" label="Security" icon={LockClosedIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="notifications" label="Notifications" icon={BellIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>
            
            <div className="space-y-8">
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'security' && renderSecurityTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
            </div>
        </div>
    );
};
