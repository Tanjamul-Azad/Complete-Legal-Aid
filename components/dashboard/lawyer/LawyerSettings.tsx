
import React, { useState, useContext, useEffect, useMemo } from 'react';
import type { User, AppTheme } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import { FormInput, PasswordInput } from '../../ui/FormInputs';
import { UserCircleIcon, LockClosedIcon, BellIcon, BriefcaseIcon } from '../../icons';
import { PasswordStrengthMeter } from '../../ui/PasswordStrengthMeter';

const TabButton: React.FC<{ id: string; label: string; icon: React.ElementType; activeTab: string; setActiveTab: (id: string) => void; }> = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
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

    useEffect(() => {
        if(context?.user) {
            setProfileData({
                name: context.user.name,
                phone: context.user.phone || '',
                bio: context.user.bio || '',
                specializations: context.user.specializations?.join(', ') || '',
                experience: context.user.experience || 0,
                fees: context.user.fees || 0,
                location: context.user.location || '',
            });
        }
    }, [context?.user]);

    if (!context || !context.user) return null;
    const { user, handleUpdateProfile, setToast } = context;

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileSaving(true);
        try {
            await handleUpdateProfile(user.id, {
                ...profileData,
                specializations: profileData.specializations.split(',').map(s => s.trim()).filter(Boolean),
                experience: Number(profileData.experience),
                fees: Number(profileData.fees),
            });
            setToast({ message: "Profile updated successfully!", type: 'success' });
        } catch (error) {
            setToast({ message: "Failed to update profile.", type: 'error' });
        } finally {
            setIsProfileSaving(false);
        }
    };
    
    const renderPublicProfileTab = () => (
        <form onSubmit={handleProfileSubmit}>
            <SectionCard title="Public Profile" description="This information will be visible to potential clients on the platform.">
                <div className="space-y-4">
                    <FormInput id="name" name="name" label="Full Name" value={profileData.name} onChange={(e) => setProfileData(p => ({...p, name: e.target.value}))} />
                    <FormInput id="location" name="location" label="Location (e.g., Dhaka)" value={profileData.location} onChange={(e) => setProfileData(p => ({...p, location: e.target.value}))} />
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium">Bio</label>
                        <textarea id="bio" name="bio" rows={4} value={profileData.bio} onChange={(e) => setProfileData(p => ({...p, bio: e.target.value}))} className="mt-1 block w-full p-2 border-cla-border dark:border-cla-border-dark rounded-md bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark" />
                    </div>
                    <FormInput id="specializations" name="specializations" label="Specializations (comma-separated)" value={profileData.specializations} onChange={(e) => setProfileData(p => ({...p, specializations: e.target.value}))} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput id="experience" name="experience" label="Years of Experience" type="number" value={profileData.experience} onChange={(e) => setProfileData(p => ({...p, experience: Number(e.target.value)}))} />
                        <FormInput id="fees" name="fees" label="Consultation Fee (BDT)" type="number" value={profileData.fees} onChange={(e) => setProfileData(p => ({...p, fees: Number(e.target.value)}))} />
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
    
    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="border-b border-cla-border dark:border-cla-border-dark mb-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton id="profile" label="Public Profile" icon={BriefcaseIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="account" label="Account" icon={UserCircleIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="security" label="Security" icon={LockClosedIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton id="notifications" label="Notifications" icon={BellIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>
            <div className="space-y-8">
                {activeTab === 'profile' && renderPublicProfileTab()}
                {activeTab === 'account' && <p>Account settings coming soon.</p>}
                {activeTab === 'security' && <p>Security settings coming soon.</p>}
                {activeTab === 'notifications' && <p>Notification settings coming soon.</p>}
            </div>
        </div>
    );
};
