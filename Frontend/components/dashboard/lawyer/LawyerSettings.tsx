
import React, { useState, useContext, useEffect, useMemo } from 'react';
import type { User, AppTheme } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import { FormInput, PasswordInput } from '../../ui/FormInputs';
import { UserCircleIcon, LockClosedIcon, BellIcon, BriefcaseIcon, ClockIcon } from '../../icons';
import { PasswordStrengthMeter } from '../../ui/PasswordStrengthMeter';

const TabButton: React.FC<{ id: string; label: string; icon: React.ElementType; activeTab: string; setActiveTab: (id: string) => void; }> = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === id
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

export const LawyerSettings: React.FC = () => {
    const context = useContext(AppContext);

    const [activeTab, setActiveTab] = useState('profile');

    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        bio: '',
        specializations: '',
        experience: 0,
        fees: 0,
        location: '',
    });
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [scheduleData, setScheduleData] = useState<{ [day: string]: { active: boolean; start: string; end: string } }>({
        'Monday': { active: true, start: '09:00', end: '17:00' },
        'Tuesday': { active: true, start: '09:00', end: '17:00' },
        'Wednesday': { active: true, start: '09:00', end: '17:00' },
        'Thursday': { active: true, start: '09:00', end: '17:00' },
        'Friday': { active: false, start: '09:00', end: '17:00' },
        'Saturday': { active: false, start: '10:00', end: '14:00' },
        'Sunday': { active: true, start: '09:00', end: '17:00' },
    });
    const [isScheduleSaving, setIsScheduleSaving] = useState(false);

    // Account Tab State
    const [accountData, setAccountData] = useState({
        email: '',
        phone: '',
        language: 'English',
    });
    const [isAccountSaving, setIsAccountSaving] = useState(false);

    // Security Tab State
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    // Notification Tab State
    const [notificationSettings, setNotificationSettings] = useState({
        email: {
            caseUpdates: true,
            newMessages: true,
            appointmentReminders: true,
        },
        push: {
            caseUpdates: true,
            newMessages: true,
            appointmentReminders: false,
        }
    });
    const [isNotificationsSaving, setIsNotificationsSaving] = useState(false);


    const handleScheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsScheduleSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsScheduleSaving(false);
            context?.setToast({ message: "Availability schedule updated!", type: 'success' });
        }, 1000);
    };

    useEffect(() => {
        if (context?.user) {
            setProfileData({
                name: context.user.name,
                phone: context.user.phone || '',
                bio: context.user.bio || '',
                specializations: context.user.specializations?.join(', ') || '',
                experience: context.user.experience || 0,
                fees: context.user.fees || 0,
                location: context.user.location || '',
            });
            setAccountData({
                email: context.user.email,
                phone: context.user.phone || '',
                language: context.user.language || 'English',
            });
            // In a real app, these would come from user settings
            setTwoFactorEnabled(false);
        }
    }, [context?.user]);

    if (!context || !context.user) return null;
    const { user, handleUpdateProfile, handleChangePassword, setToast } = context;

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileSaving(true);
        try {
            await handleUpdateProfile(user.id, {
                ...profileData,
                specializations: profileData.specializations.split(',').map(s => s.trim()).filter(Boolean),
                experience: Number(profileData.experience),
                fees: Number(profileData.fees),
                avatarFile: avatarFile || undefined
            });
            setToast({ message: "Profile updated successfully!", type: 'success' });
        } catch (error) {
            setToast({ message: "Failed to update profile.", type: 'error' });
        } finally {
            setIsProfileSaving(false);
        }
    };

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAccountSaving(true);
        try {
            await handleUpdateProfile(user.id, {
                phone: accountData.phone,
                language: accountData.language as 'Bangla' | 'English',
            });
            setToast({ message: "Account settings updated!", type: 'success' });
        } catch (error) {
            setToast({ message: "Failed to update account settings.", type: 'error' });
        } finally {
            setIsAccountSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (passwordData.new !== passwordData.confirm) newErrors.confirm = 'Passwords do not match.';
        if (passwordData.new.length < 6) newErrors.new = 'Password must be at least 6 characters.';

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
        setIsNotificationsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsNotificationsSaving(false);
            setToast({ message: "Notification settings saved!", type: 'success' });
        }, 1000);
    };


    const renderScheduleTab = () => (
        <form onSubmit={handleScheduleSubmit}>
            <SectionCard title="Weekly Availability" description="Set your available hours for appointments.">
                <div className="space-y-4">
                    {Object.entries(scheduleData).map(([day, data]: [string, { active: boolean; start: string; end: string }]) => (
                        <div key={day} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-cla-border dark:border-cla-border-dark">
                            <div className="flex items-center gap-4 w-32">
                                <input
                                    type="checkbox"
                                    checked={data.active}
                                    onChange={(e) => setScheduleData(prev => ({ ...prev, [day]: { ...prev[day], active: e.target.checked } }))}
                                    className="w-4 h-4 text-cla-gold rounded focus:ring-cla-gold"
                                />
                                <span className={`font-medium ${data.active ? 'text-cla-text dark:text-white' : 'text-gray-400'}`}>{day}</span>
                            </div>
                            {data.active ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        value={data.start}
                                        onChange={(e) => setScheduleData(prev => ({ ...prev, [day]: { ...prev[day], start: e.target.value } }))}
                                        className="p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="time"
                                        value={data.end}
                                        onChange={(e) => setScheduleData(prev => ({ ...prev, [day]: { ...prev[day], end: e.target.value } }))}
                                        className="p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                                    />
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400 italic">Unavailable</span>
                            )}
                        </div>
                    ))}
                </div>
            </SectionCard>
            <div className="mt-6 flex justify-start">
                <button type="submit" disabled={isScheduleSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400">
                    {isScheduleSaving ? 'Saving...' : 'Save Schedule'}
                </button>
            </div>
        </form>
    );

    const renderPublicProfileTab = () => (
        <form onSubmit={handleProfileSubmit}>
            <SectionCard title="Public Profile" description="This information will be visible to potential clients on the platform.">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                        <img src={avatarPreview || user.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                        <div className="flex gap-2">
                            <label htmlFor="lawyer-avatar-upload" className="cursor-pointer px-4 py-2 text-sm font-semibold bg-cla-gold text-cla-text rounded-lg hover:bg-cla-gold-darker transition-colors">Change Photo</label>
                            <input
                                id="lawyer-avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setAvatarFile(file);
                                        setAvatarPreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <FormInput id="name" name="name" label="Full Name" value={profileData.name} onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))} />
                    <FormInput id="location" name="location" label="Location (e.g., Dhaka)" value={profileData.location} onChange={(e) => setProfileData(p => ({ ...p, location: e.target.value }))} />
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium">Bio</label>
                        <textarea id="bio" name="bio" rows={4} value={profileData.bio} onChange={(e) => setProfileData(p => ({ ...p, bio: e.target.value }))} className="mt-1 block w-full p-2 border-cla-border dark:border-cla-border-dark rounded-md bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark" />
                    </div>
                    <FormInput id="specializations" name="specializations" label="Specializations (comma-separated)" value={profileData.specializations} onChange={(e) => setProfileData(p => ({ ...p, specializations: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput id="experience" name="experience" label="Years of Experience" type="number" value={profileData.experience} onChange={(e) => setProfileData(p => ({ ...p, experience: Number(e.target.value) }))} />
                        <FormInput id="fees" name="fees" label="Consultation Fee (BDT)" type="number" value={profileData.fees} onChange={(e) => setProfileData(p => ({ ...p, fees: Number(e.target.value) }))} />
                    </div>
                </div>
            </SectionCard>
            <div className="mt-6 flex justify-start">
                <button type="submit" disabled={isProfileSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400">
                    {isProfileSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </form>
    );

    const renderAccountTab = () => (
        <form onSubmit={handleAccountSubmit}>
            <SectionCard title="Account Information" description="Manage your personal account details.">
                <div className="space-y-4 max-w-lg">
                    <FormInput id="email" name="email" label="Email Address" type="email" value={accountData.email} disabled />
                    <FormInput id="phone" name="phone" label="Phone Number" type="tel" value={accountData.phone} onChange={(e) => setAccountData(p => ({ ...p, phone: e.target.value }))} />
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Preferred Language</label>
                        <select id="language" name="language" value={accountData.language} onChange={(e) => setAccountData(p => ({ ...p, language: e.target.value }))} className="mt-1 block w-full p-2 border-cla-border dark:border-cla-border-dark rounded-md bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark">
                            <option>English</option><option>Bangla</option>
                        </select>
                    </div>
                </div>
            </SectionCard>
            <div className="mt-6 flex justify-start">
                <button type="submit" disabled={isAccountSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400">
                    {isAccountSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );

    const renderSecurityTab = () => (
        <form onSubmit={handlePasswordSubmit}>
            <SectionCard title="Change Password" description="Update your password to keep your account secure.">
                <div className="space-y-4 max-w-lg">
                    <PasswordInput id="current" name="current" label="Current Password" value={passwordData.current} onChange={(e) => setPasswordData(p => ({ ...p, current: e.target.value }))} show={false} toggleShow={() => { }} error={passwordErrors.current} />
                    <PasswordInput id="new" name="new" label="New Password" value={passwordData.new} onChange={(e) => setPasswordData(p => ({ ...p, new: e.target.value }))} show={false} toggleShow={() => { }} error={passwordErrors.new} />
                    {passwordData.new && <PasswordStrengthMeter password={passwordData.new} />}
                    <PasswordInput id="confirm" name="confirm" label="Confirm New Password" value={passwordData.confirm} onChange={(e) => setPasswordData(p => ({ ...p, confirm: e.target.value }))} show={false} toggleShow={() => { }} error={passwordErrors.confirm} />
                </div>
                <div className="mt-4">
                    <button type="submit" disabled={isPasswordSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400">
                        {isPasswordSaving ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </SectionCard>

            <div className="mt-8">
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
            </div>
        </form>
    );

    const renderNotificationsTab = () => (
        <form onSubmit={handleNotificationSubmit}>
            <SectionCard title="Email Notifications" description="Choose which emails you'd like to receive.">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div><p className="font-medium">Case Updates</p><p className="text-xs text-cla-text-muted">Status changes, new documents, etc.</p></div>
                        <input type="checkbox" checked={notificationSettings.email.caseUpdates} onChange={(e) => setNotificationSettings(s => ({ ...s, email: { ...s.email, caseUpdates: e.target.checked } }))} className="w-5 h-5 text-cla-gold rounded focus:ring-cla-gold" />
                    </div>
                    <div className="flex justify-between items-center">
                        <div><p className="font-medium">New Messages</p><p className="text-xs text-cla-text-muted">When you receive a new message from a client.</p></div>
                        <input type="checkbox" checked={notificationSettings.email.newMessages} onChange={(e) => setNotificationSettings(s => ({ ...s, email: { ...s.email, newMessages: e.target.checked } }))} className="w-5 h-5 text-cla-gold rounded focus:ring-cla-gold" />
                    </div>
                    <div className="flex justify-between items-center">
                        <div><p className="font-medium">Appointment Reminders</p><p className="text-xs text-cla-text-muted">Reminders for your upcoming appointments.</p></div>
                        <input type="checkbox" checked={notificationSettings.email.appointmentReminders} onChange={(e) => setNotificationSettings(s => ({ ...s, email: { ...s.email, appointmentReminders: e.target.checked } }))} className="w-5 h-5 text-cla-gold rounded focus:ring-cla-gold" />
                    </div>
                </div>
            </SectionCard>

            <div className="mt-6 flex justify-start">
                <button type="submit" disabled={isNotificationsSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400">
                    {isNotificationsSaving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </form>
    );

    const [verificationFiles, setVerificationFiles] = useState<{ identity: File | null; barCouncil: File | null }>({ identity: null, barCouncil: null });
    const [isVerificationSaving, setIsVerificationSaving] = useState(false);

    const handleVerificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationFiles.identity && !verificationFiles.barCouncil) return;
        setIsVerificationSaving(true);
        try {
            const updates: any = {};
            if (verificationFiles.identity) updates.identity_document = verificationFiles.identity;
            if (verificationFiles.barCouncil) updates.verification_document = verificationFiles.barCouncil;

            await handleUpdateProfile(user.id, updates);

            setToast({ message: "Verification documents submitted successfully!", type: 'success' });
            setVerificationFiles({ identity: null, barCouncil: null });
        } catch (error) {
            setToast({ message: "Failed to upload documents.", type: 'error' });
        } finally {
            setIsVerificationSaving(false);
        }
    };

    const renderVerificationTab = () => (
        <form onSubmit={handleVerificationSubmit}>
            <SectionCard title="Professional Verification" description="Upload your documents to get verified as a lawyer.">
                <div className="space-y-6">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                        <p className="font-semibold">Current Status: {user.isVerified ? 'Verified' : 'Pending Verification'}</p>
                        <p className="mt-1">Verified lawyers appear in search results and can accept cases.</p>
                    </div>

                    <div>
                        <label htmlFor="bar-council-doc" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Bar Council Certificate</label>
                        <input
                            id="bar-council-doc"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setVerificationFiles(prev => ({ ...prev, barCouncil: e.target.files?.[0] || null }))}
                            className="mt-2 block w-full text-sm text-cla-text-muted dark:text-cla-text-muted-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cla-gold/20 file:text-cla-gold-darker hover:file:bg-cla-gold/30"
                        />
                        <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark mt-1">Upload your Bar Council registration certificate.</p>
                    </div>

                    <div>
                        <label htmlFor="identity-doc" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">National ID / Passport</label>
                        <input
                            id="identity-doc"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setVerificationFiles(prev => ({ ...prev, identity: e.target.files?.[0] || null }))}
                            className="mt-2 block w-full text-sm text-cla-text-muted dark:text-cla-text-muted-dark file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cla-gold/20 file:text-cla-gold-darker hover:file:bg-cla-gold/30"
                        />
                        <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark mt-1">Upload a clear copy of your NID or Passport.</p>
                    </div>
                </div>
            </SectionCard>
            <div className="mt-6 flex justify-start">
                <button type="submit" disabled={(!verificationFiles.identity && !verificationFiles.barCouncil) || isVerificationSaving} className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-48 text-center">
                    {isVerificationSaving ? 'Uploading...' : 'Submit Documents'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="border-b border-cla-border dark:border-cla-border-dark mb-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton id="profile" label="Public Profile" icon={BriefcaseIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="schedule" label="Schedule" icon={ClockIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="account" label="Account" icon={UserCircleIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="security" label="Security" icon={LockClosedIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="notifications" label="Notifications" icon={BellIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="verification" label="Verification" icon={LockClosedIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>
            <div className="space-y-8">
                {activeTab === 'profile' && renderPublicProfileTab()}
                {activeTab === 'schedule' && renderScheduleTab()}
                {activeTab === 'account' && renderAccountTab()}
                {activeTab === 'security' && renderSecurityTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'verification' && renderVerificationTab()}
            </div>
        </div>
    );
};
