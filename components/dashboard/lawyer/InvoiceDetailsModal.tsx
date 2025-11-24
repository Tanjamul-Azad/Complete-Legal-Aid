
import React from 'react';
import { CloseIcon, DocumentTextIcon } from '../../icons';
import type { Invoice } from '../../../services/paymentService';

interface InvoiceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ isOpen, onClose, invoice }) => {
    if (!isOpen || !invoice) return null;

    const markInvoiceAsPaid = () => {
        alert(`Mock: Marking ${invoice.id} as paid`);
        // Later: call backend API to update status
        onClose();
    };

    const downloadInvoice = () => {
        alert(`Mock: Downloading invoice ${invoice.id} as PDF`);
        // Later: open PDF url
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#050816] border border-slate-200 dark:border-slate-800 shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            Invoice Details
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {invoice.id} • <span className="uppercase">{invoice.status}</span>
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[11px] text-slate-500">Invoice ID</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{invoice.id}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Status</p>
                            <span className={`inline-flex mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                invoice.status === 'unpaid' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                                {invoice.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Client</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{invoice.clientName}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Case</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{invoice.caseTitle}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Issued Date</p>
                            <p className="text-slate-700 dark:text-slate-200 mt-0.5">{new Date(invoice.issuedDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-500">Due Date</p>
                            <p className="text-slate-700 dark:text-slate-200 mt-0.5">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] text-slate-500">Total Amount</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                ৳ {invoice.amount.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-[11px] text-slate-500">Payment method</p>
                            <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium">
                                {invoice.method || "Not set"}
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                            <span className="font-bold">Note:</span> Online payments via bKash/Nagad/SSLCOMMERZ will automatically update the status. Use "Mark as paid" for manual cash or direct bank transfers.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center gap-3 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-gray-50 dark:bg-[#0B0B0B] rounded-b-2xl">
                    <button
                        className="px-4 py-2 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors flex items-center gap-2"
                        onClick={downloadInvoice}
                    >
                        <DocumentTextIcon className="w-4 h-4" />
                        Download PDF
                    </button>

                    {invoice.status !== 'paid' && (
                        <button
                            className="px-4 py-2 rounded-lg text-[11px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md transition-all"
                            onClick={markInvoiceAsPaid}
                        >
                            Mark as Paid
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
