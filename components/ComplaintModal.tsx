
import React, { useState } from 'react';
import { CloseIcon, SendIcon } from './icons';

interface ComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    helplineName: string;
    recipientEmail: string;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ isOpen, onClose, helplineName, recipientEmail }) => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        details: '',
    });

    if (!isOpen) return null;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = `Urgent Complaint via CLA Platform for: ${helplineName}`;
        let body = `Complaint Details:\n${formData.details}\n\n`;
        if (formData.name) body += `From: ${formData.name}\n`;
        if (formData.contact) body += `Contact: ${formData.contact}\n`;
        
        const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] animate-fade-in p-4">
            <div className="bg-cla-bg-dark text-cla-text-dark rounded-lg shadow-xl w-full max-w-lg m-4 border border-cla-border-dark">
                <div className="p-6 border-b border-cla-border-dark flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                        Submit Complaint to <span className="text-cla-gold">{helplineName}</span>
                    </h2>
                    <button onClick={onClose} className="text-cla-text-muted-dark hover:text-white">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSend} className="p-6 space-y-4">
                    <p className="text-xs text-cla-text-muted-dark -mt-2">This will open your default email client to send the complaint. Your details are not stored by us.</p>
                    <div>
                        <label htmlFor="details" className="block text-sm font-medium text-white">Complaint Details</label>
                        <textarea id="details" name="details" rows={5} required value={formData.details} onChange={handleInputChange} className="mt-1 block w-full shadow-sm sm:text-sm border-cla-border-dark rounded-md bg-cla-surface-dark text-white focus:ring-cla-gold focus:border-cla-gold"></textarea>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white">Your Name (Optional)</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full shadow-sm sm:text-sm border-cla-border-dark rounded-md bg-cla-surface-dark text-white focus:ring-cla-gold focus:border-cla-gold" />
                    </div>
                     <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-white">Contact Number (Optional)</label>
                        <input type="tel" id="contact" name="contact" value={formData.contact} onChange={handleInputChange} className="mt-1 block w-full shadow-sm sm:text-sm border-cla-border-dark rounded-md bg-cla-surface-dark text-white focus:ring-cla-gold focus:border-cla-gold" />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="w-full flex justify-center items-center gap-2 bg-cla-gold hover:bg-cla-gold-darker text-cla-text font-bold py-3 px-4 rounded-md transition-colors">
                            <SendIcon className="w-5 h-5" />
                            Proceed to Email
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};