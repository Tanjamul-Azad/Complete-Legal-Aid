
import React, { useState } from 'react';
import { WarningIcon, CloseIcon, CheckIcon, ShieldCheckIcon, EyeSlashIcon } from './icons';

interface EmergencyReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const incidentTypes = [
    "Police Misconduct / Abuse",
    "Domestic Violence",
    "Physical Assault / Threat",
    "Illegal Property Seizure",
    "Workplace Harassment",
    "Child Protection Issue",
    "Digital Harassment / Cybercrime",
    "Corruption Incident",
    "Emergency Unknown (Unsure)"
];

export const EmergencyReportModal: React.FC<EmergencyReportModalProps> = ({ isOpen, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Reset state on open
    if (!isOpen) return null;
    
    const handleReport = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call delay
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 2000);
    };

    const handleClose = () => {
        setIsSuccess(false);
        setIsSubmitting(false);
        setIsAnonymous(false);
        onClose();
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-4">
                <div className="bg-cla-bg dark:bg-[#121212] rounded-3xl shadow-2xl w-full max-w-sm text-center p-8 border border-green-500/30 animate-scale-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-500/5">
                        <CheckIcon className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-cla-text dark:text-white mb-2">Report Submitted</h2>
                    <p className="text-cla-text-muted dark:text-gray-400 mb-8 text-sm leading-relaxed">
                        Our emergency team has received your alert and will review it immediately.
                    </p>
                    <button 
                        onClick={handleClose} 
                        className="w-full bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] text-cla-text dark:text-white font-bold py-3.5 rounded-xl transition-colors border border-gray-200 dark:border-white/5"
                    >
                        Return to Safety
                    </button>
                    <p className="text-xs text-red-500 mt-6 font-medium bg-red-50 dark:bg-red-900/10 py-2 rounded-lg">If you are in immediate danger, call 999.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4 overflow-y-auto">
            <div className="bg-cla-bg dark:bg-[#121212] text-cla-text dark:text-white rounded-2xl shadow-2xl w-full max-w-lg m-4 border border-cla-border dark:border-white/10 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-cla-border dark:border-white/10 flex justify-between items-start bg-cla-surface dark:bg-[#0B0B0B] rounded-t-2xl sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-[#E53935] flex items-center gap-2 mb-1">
                            <WarningIcon className="w-6 h-6" />
                            EMERGENCY REPORT
                        </h2>
                        <p className="text-xs text-cla-text-muted dark:text-gray-400 font-medium">
                            Your report will be sent to CLA responders & verified partner NGOs.
                        </p>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-cla-text dark:hover:text-white p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleReport} className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-[#0E0E0E]">
                    <div>
                        <label htmlFor="incident-type" className="block text-sm font-bold text-cla-text dark:text-gray-300 mb-2">Type of Incident</label>
                        <div className="relative">
                            <select id="incident-type" name="incident-type" required className="block w-full pl-4 pr-10 py-3.5 text-sm border border-gray-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 rounded-xl bg-white dark:bg-[#1E1E1E] text-cla-text dark:text-white appearance-none transition-shadow shadow-sm">
                                <option value="" disabled selected>Select Category</option>
                                {incidentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-cla-text dark:text-gray-300 mb-2">Brief Description</label>
                        <textarea 
                            id="description" 
                            name="description" 
                            rows={4} 
                            required 
                            placeholder="Describe what happened. Include location, people involved, and any immediate danger."
                            className="block w-full p-4 text-sm border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#1E1E1E] text-cla-text dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none shadow-sm"
                        ></textarea>
                    </div>

                    <div className={`transition-all duration-300 ${isAnonymous ? 'opacity-40 pointer-events-none filter grayscale' : 'opacity-100'}`}>
                        <label htmlFor="contact-info" className="block text-sm font-bold text-cla-text dark:text-gray-300 mb-2">Contact Number</label>
                        <input 
                            type="tel" 
                            id="contact-info" 
                            name="contact-info" 
                            required={!isAnonymous}
                            className="block w-full p-3.5 text-sm border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#1E1E1E] text-cla-text dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 placeholder:text-gray-400 shadow-sm" 
                            placeholder="+880 1XXX XXXXXX"
                        />
                    </div>

                    <label className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all duration-200 ${isAnonymous ? 'bg-gray-800 border-gray-600 dark:bg-[#222] dark:border-gray-700' : 'bg-white border-gray-200 dark:bg-[#1E1E1E] dark:border-white/5 hover:border-gray-300'}`}>
                        <div className="flex items-center h-5">
                            <input 
                                id="anonymous" 
                                name="anonymous" 
                                type="checkbox" 
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded" 
                            />
                        </div>
                        <div className="ml-3">
                            <span className="font-bold text-sm text-cla-text dark:text-gray-200 flex items-center gap-2">
                                Report Anonymously
                                {isAnonymous && <EyeSlashIcon className="w-4 h-4 text-gray-400"/>}
                            </span>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Your contact details will be hidden. This may limit response speed.</p>
                        </div>
                    </label>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-[#E53935] hover:bg-red-700 text-white font-bold py-4 px-4 rounded-full shadow-lg shadow-red-600/20 transition-all transform active:scale-[0.98] flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending Report...
                                </>
                            ) : (
                                "Submit Emergency Report"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
