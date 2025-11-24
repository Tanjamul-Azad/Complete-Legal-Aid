
import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../../icons';
import type { PayoutMethods } from '../../../services/paymentService';

interface PayoutSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: PayoutMethods | null;
    onSave: (settings: PayoutMethods) => Promise<void>;
}

export const PayoutSettingsModal: React.FC<PayoutSettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<PayoutMethods>({
        bank: { bankName: '', branch: '', accountName: '', accountNumber: '', routingNumber: '', verified: false },
        wallet: { provider: 'bKash', walletNumber: '', holder: '', verified: false }
    });

    useEffect(() => {
        if (currentSettings) {
            setFormData(currentSettings);
        }
    }, [currentSettings]);

    if (!isOpen) return null;

    const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, bank: { ...prev.bank, [e.target.name]: e.target.value } }));
    };

    const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, wallet: { ...prev.wallet, [e.target.name]: e.target.value } }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#050816] border border-cla-border dark:border-cla-border-dark shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-cla-border dark:border-cla-border-dark">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            Payout Settings
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Choose where your earnings are sent in Bangladesh.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Bank Details */}
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4">
                        <p className="mb-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                            Bank Account (BDT)
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block mb-1 text-[11px] text-slate-500">Bank Name</label>
                                <input name="bankName" value={formData.bank.bankName} onChange={handleBankChange} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:ring-2 focus:ring-cla-gold outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block mb-1 text-[11px] text-slate-500">Branch Name</label>
                                <input name="branch" value={formData.bank.branch} onChange={handleBankChange} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:ring-2 focus:ring-cla-gold outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block mb-1 text-[11px] text-slate-500">Routing Number</label>
                                <input name="routingNumber" value={formData.bank.routingNumber} onChange={handleBankChange} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:ring-2 focus:ring-cla-gold outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block mb-1 text-[11px] text-slate-500">Account Name</label>
                                <input name="accountName" value={formData.bank.accountName} onChange={handleBankChange} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:ring-2 focus:ring-cla-gold outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block mb-1 text-[11px] text-slate-500">Account Number</label>
                                <input name="accountNumber" value={formData.bank.accountNumber} onChange={handleBankChange} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:ring-2 focus:ring-cla-gold outline-none transition-all" />
                            </div>
                        </div>
                        {formData.bank.verified && (
                            <p className="mt-3 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                ✅ Bank account verified for payouts.
                            </p>
                        )}
                    </div>

                    {/* Mobile Wallet Details */}
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4">
                        <p className="mb-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                            Mobile Wallet
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 text-[11px] text-slate-500">Provider</label>
                                <select name="provider" value={formData.wallet.provider} onChange={handleWalletChange} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:ring-2 focus:ring-cla-gold outline-none transition-all">
                                    <option>bKash</option>
                                    <option>Nagad</option>
                                    <option>Rocket</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1 text-[11px] text-slate-500">Wallet Number</label>
                                <input name="walletNumber" value={formData.wallet.walletNumber} onChange={handleWalletChange} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:ring-2 focus:ring-cla-gold outline-none transition-all" />
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 text-[11px] text-slate-500">Account Holder Name</label>
                                <input name="holder" value={formData.wallet.holder} onChange={handleWalletChange} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 focus:ring-2 focus:ring-cla-gold outline-none transition-all" />
                            </div>
                        </div>
                        <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                            Mobile wallet will be used as a fallback or for small instant transfers.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-cla-border dark:border-cla-border-dark bg-gray-50 dark:bg-[#0B0B0B] rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="px-5 py-2 rounded-full text-[11px] font-semibold bg-cla-gold text-cla-text hover:bg-cla-gold-darker shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
