
import React, { useState } from 'react';
import { CloseIcon } from '../../icons';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: {
        id: string;
        service: string;
        lawyerName: string;
        amount: string;
    };
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, invoice }) => {
    const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');

    if (!isOpen) return null;

    const proceedToPay = () => {
        // FRONTEND ONLY (mock)
        alert(
            `Mock payment:\nInvoice: ${invoice.id}\nAmount: ${invoice.amount}\nMethod: ${selectedMethod.toUpperCase()}`
        );
        
        // Future Backend Integration:
        // fetch('/api/payments/checkout', { ... })
        //   .then(r => r.json())
        //   .then(data => window.location.href = data.redirectUrl);

        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#050816] border border-slate-200 dark:border-slate-800 shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            Choose payment method
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Invoice: {invoice.id}
                        </p>
                    </div>
                    <button
                        className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        onClick={onClose}
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-4 text-xs">
                    <div>
                        <p className="mb-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Amount to pay
                        </p>
                        <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                            {invoice.amount}
                        </p>
                    </div>

                    <div>
                        <p className="mb-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            Pay securely with
                        </p>

                        <div className="grid grid-cols-3 gap-2">
                            {/* bKash */}
                            <button
                                onClick={() => setSelectedMethod('bkash')}
                                className={`col-span-1 rounded-lg border px-2 py-3 text-center text-[11px] font-semibold transition-all flex flex-col items-center justify-center gap-1
                                    ${selectedMethod === 'bkash' 
                                        ? 'border-brand bg-brand-soft/60 dark:bg-brand-soft/10 text-slate-900 dark:text-white ring-1 ring-brand' 
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-100 hover:border-brand hover:bg-brand-soft/60 dark:hover:bg-brand-soft/10'
                                    }`}
                            >
                                <div className="text-lg">📱</div>
                                bKash
                            </button>

                            {/* Nagad */}
                            <button
                                onClick={() => setSelectedMethod('nagad')}
                                className={`col-span-1 rounded-lg border px-2 py-3 text-center text-[11px] font-semibold transition-all flex flex-col items-center justify-center gap-1
                                    ${selectedMethod === 'nagad' 
                                        ? 'border-brand bg-brand-soft/60 dark:bg-brand-soft/10 text-slate-900 dark:text-white ring-1 ring-brand' 
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-100 hover:border-brand hover:bg-brand-soft/60 dark:hover:bg-brand-soft/10'
                                    }`}
                            >
                                <div className="text-lg">💳</div>
                                Nagad
                            </button>

                            {/* Bank */}
                            <button
                                onClick={() => setSelectedMethod('bank')}
                                className={`col-span-1 rounded-lg border px-2 py-3 text-center text-[11px] font-semibold transition-all flex flex-col items-center justify-center gap-1
                                    ${selectedMethod === 'bank' 
                                        ? 'border-brand bg-brand-soft/60 dark:bg-brand-soft/10 text-slate-900 dark:text-white ring-1 ring-brand' 
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-100 hover:border-brand hover:bg-brand-soft/60 dark:hover:bg-brand-soft/10'
                                    }`}
                            >
                                <div className="text-lg">🏦</div>
                                Bank
                            </button>
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        You will be redirected to a secure payment page to complete the transaction.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-gray-50 dark:bg-[#0B0B0B] rounded-b-2xl">
                    <button
                        className="px-4 py-2 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded-full text-[11px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md transition-all"
                        onClick={proceedToPay}
                    >
                        Proceed to pay
                    </button>
                </div>
            </div>
        </div>
    );
};
