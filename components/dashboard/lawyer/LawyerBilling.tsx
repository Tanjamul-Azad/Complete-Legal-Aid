
import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../../context/AppContext';
import { BanknotesIcon } from '../../icons';
import { 
    getPaymentSummary, 
    getPaymentHistory, 
    getPayoutMethods, 
    savePayoutMethods,
    getInvoices,
    getInvoiceById,
    type PaymentSummary,
    type PaymentHistoryItem,
    type PayoutMethods,
    type Invoice
} from '../../../services/paymentService';
import { PayoutSettingsModal } from './PayoutSettingsModal';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';

export const LawyerBilling: React.FC = () => {
    const context = useContext(AppContext);
    const [summary, setSummary] = useState<PaymentSummary | null>(null);
    const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
    const [payoutMethods, setPayoutMethods] = useState<PayoutMethods | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [summaryData, historyData, payoutData, invoicesData] = await Promise.all([
                    getPaymentSummary(),
                    getPaymentHistory(),
                    getPayoutMethods(),
                    getInvoices()
                ]);
                setSummary(summaryData);
                setHistory(historyData);
                setPayoutMethods(payoutData);
                setInvoices(invoicesData);
            } catch (error) {
                console.error("Failed to fetch billing data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSaveSettings = async (newSettings: PayoutMethods) => {
        try {
            await savePayoutMethods(newSettings);
            setPayoutMethods(newSettings); // Optimistic update
            context?.setToast({ message: "Payout settings saved successfully.", type: 'success' });
        } catch (error) {
            context?.setToast({ message: "Failed to save settings.", type: 'error' });
        }
    };

    const handleViewInvoice = async (id: string) => {
        const invoice = await getInvoiceById(id);
        if (invoice) {
            setSelectedInvoice(invoice);
        }
    };

    const handleCreateInvoice = () => {
        context?.setToast({ message: "Invoice creation feature coming soon!", type: 'success' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cla-gold"></div>
            </div>
        );
    }

    return (
        <section className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                        Payments & Billing
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Track client payments, invoices, and payouts to your bank or mobile wallet.
                    </p>
                </div>

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="rounded-full bg-cla-gold text-cla-text text-xs font-semibold
                             px-4 py-2 shadow-sm hover:bg-cla-gold-darker hover:shadow-md
                             transition-all"
                >
                    View payout settings
                </button>
            </div>

            {/* Top money summary cards */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {/* Outstanding invoices */}
                <div className="p-5 rounded-xl bg-white dark:bg-[#050816]
                            border border-slate-200 dark:border-slate-800
                            shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        Outstanding Invoices
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                        ৳ {summary?.outstandingInvoices.toLocaleString()}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                        3 invoices awaiting client payment
                    </p>
                </div>

                {/* Paid this month */}
                <div className="p-5 rounded-xl bg-white dark:bg-[#050816]
                            border border-slate-200 dark:border-slate-800
                            shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        Paid This Month
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                        ৳ {summary?.paidThisMonth.toLocaleString()}
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        +18% vs last month
                    </p>
                </div>

                {/* Next payout */}
                <div className="p-5 rounded-xl bg-white dark:bg-[#050816]
                            border border-slate-200 dark:border-slate-800
                            shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        Next Payout
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
                        ৳ {summary?.payout.nextPayoutAmount.toLocaleString()}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                        Scheduled: {new Date(summary?.payout.nextPayoutDate || '').toLocaleDateString()} · to {summary?.payout.method}
                    </p>
                </div>

                {/* Payment method status */}
                <div className="p-5 rounded-xl bg-white dark:bg-[#050816]
                            border border-slate-200 dark:border-slate-800
                            shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                        Payout Method
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-1">
                        {payoutMethods?.bank.verified ? '✅ Verified' : '⚠️ Unverified'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                        Bank: {payoutMethods?.bank.bankName} · Mobile: {payoutMethods?.wallet.provider}
                    </p>
                </div>
            </div>

            {/* Lower Section */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1.5fr)]">
                
                {/* Pending Payouts */}
                <div className="rounded-2xl bg-white dark:bg-[#050816]
                            border border-slate-200 dark:border-slate-800
                            shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                            Pending Payouts
                        </h2>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Auto-transferred every 7 days
                        </span>
                    </div>

                    <ul className="space-y-3 text-xs">
                        <li className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900/60 px-3 py-3 border border-slate-100 dark:border-slate-800">
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">
                                    ৳ 12,500 · Completed Consultations
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Will be sent to {payoutMethods?.bank.bankName} · 24 Nov
                                </p>
                            </div>
                            <span className="text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-1">
                                Pending
                            </span>
                        </li>

                        <li className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900/60 px-3 py-3 border border-slate-100 dark:border-slate-800">
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">
                                    ৳ 8,500 · Emergency Helpline Cases
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Will be sent to {payoutMethods?.wallet.provider} · 27 Nov
                                </p>
                            </div>
                            <span className="text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-1">
                                Scheduled
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Payment History */}
                <div className="rounded-2xl bg-white dark:bg-[#050816]
                            border border-slate-200 dark:border-slate-800
                            shadow-sm p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                            Payment History
                        </h2>
                        <button className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-cla-gold transition-colors">
                            View all transactions
                        </button>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="min-w-full text-[11px] text-left">
                            <thead className="text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-2.5 px-3 font-medium rounded-tl-lg">Date</th>
                                    <th className="py-2.5 px-3 font-medium">Client</th>
                                    <th className="py-2.5 px-3 font-medium">Service</th>
                                    <th className="py-2.5 px-3 text-right font-medium">Amount</th>
                                    <th className="py-2.5 px-3 text-right font-medium rounded-tr-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {history.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td className="py-3 px-3 text-slate-900 dark:text-slate-200 font-medium">{item.client}</td>
                                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{item.service}</td>
                                        <td className="py-3 px-3 text-right text-slate-900 dark:text-slate-200 font-semibold">৳ {item.amount.toLocaleString()}</td>
                                        <td className="py-3 px-3 text-right">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                                item.status === 'paid' 
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Invoices Section */}
            <div className="rounded-2xl bg-white dark:bg-[#050816] border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                        Invoices
                    </h2>
                    <button 
                        onClick={handleCreateInvoice}
                        className="text-[11px] font-bold text-cla-gold hover:text-cla-gold-darker uppercase tracking-wide transition-colors"
                    >
                        Create New Invoice
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-[11px] text-left">
                        <thead className="text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-2.5 px-3 font-medium rounded-tl-lg">Invoice ID</th>
                                <th className="py-2.5 px-3 font-medium">Client</th>
                                <th className="py-2.5 px-3 font-medium">Case</th>
                                <th className="py-2.5 px-3 font-medium">Issued</th>
                                <th className="py-2.5 px-3 font-medium">Due</th>
                                <th className="py-2.5 px-3 text-right font-medium">Amount</th>
                                <th className="py-2.5 px-3 text-right font-medium rounded-tr-lg">Status</th>
                                <th className="py-2.5 px-3 text-right font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {invoices.map((inv) => (
                                <tr 
                                    key={inv.id} 
                                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                                    onClick={() => handleViewInvoice(inv.id)}
                                >
                                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">{inv.id}</td>
                                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{inv.clientName}</td>
                                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{inv.caseTitle}</td>
                                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{new Date(inv.issuedDate).toLocaleDateString()}</td>
                                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                    <td className="py-3 px-3 text-right font-semibold text-slate-900 dark:text-slate-100">৳ {inv.amount.toLocaleString()}</td>
                                    <td className="py-3 px-3 text-right">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                            inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                            inv.status === 'unpaid' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                            'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <button
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cla-gold hover:text-cla-gold-darker transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewInvoice(inv.id);
                                            }}
                                        >
                                            View
                                            <span>→</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <PayoutSettingsModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)} 
                currentSettings={payoutMethods}
                onSave={handleSaveSettings}
            />

            <InvoiceDetailsModal
                isOpen={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                invoice={selectedInvoice}
            />
        </section>
    );
};
