
import React, { useState, useEffect, useContext } from 'react';
import { BanknotesIcon, CreditCardIcon, ClockIcon, CheckIcon } from '../../icons';
import { PaymentModal } from './PaymentModal';
import { AppContext } from '../../../context/AppContext';
import { getCitizenPaymentHistory, getInvoices, type CitizenPayment, type Invoice } from '../../../services/paymentService';

export const CitizenBilling: React.FC = () => {
    const context = useContext(AppContext);
    const [selectedInvoice, setSelectedInvoice] = useState<{ id: string; service: string; lawyerName: string; amount: string; } | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<CitizenPayment[]>([]);
    const [outstandingInvoices, setOutstandingInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (context?.user) {
                setIsLoading(true);
                try {
                    const [history, allInvoices] = await Promise.all([
                        getCitizenPaymentHistory(context.user.id),
                        getInvoices()
                    ]);
                    
                    setPaymentHistory(history);
                    
                    // Filter for invoices that are unpaid or overdue
                    // In a real app, backend would filter by clientId
                    const unpaid = allInvoices.filter(inv => 
                        inv.status !== 'paid'
                    );
                    setOutstandingInvoices(unpaid);

                } catch (error) {
                    console.error("Failed to fetch billing data", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [context?.user]);

    const handlePayNow = (inv: Invoice) => {
        setSelectedInvoice({
            id: inv.id,
            service: inv.caseTitle,
            lawyerName: inv.lawyerName,
            amount: `৳ ${inv.amount.toLocaleString()}`
        });
    };

    const handleContactSupport = () => {
        context?.setToast({ message: "Support ticket created! An agent will contact you shortly.", type: 'success' });
    };

    return (
        <section className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-cla-text dark:text-white">
                        Payments & Invoices
                    </h1>
                    <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-1">
                        Manage your outgoing payments and view transaction history.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                    <CheckIcon className="w-3 h-3" /> All payments secured by SSLCOMMERZ
                </div>
            </div>

            {/* Top Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-[#111] border border-cla-border dark:border-cla-border-dark shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                    <p className="text-xs font-bold text-cla-text-muted dark:text-cla-text-muted-dark uppercase tracking-wider">Total Due</p>
                    <p className="mt-2 text-3xl font-bold text-cla-text dark:text-white">৳ {outstandingInvoices.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</p>
                    <p className="mt-1 text-xs text-red-500 font-medium">{outstandingInvoices.length} invoices pending</p>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-[#111] border border-cla-border dark:border-cla-border-dark shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                    <p className="text-xs font-bold text-cla-text-muted dark:text-cla-text-muted-dark uppercase tracking-wider">Total Paid (YTD)</p>
                    <p className="mt-2 text-3xl font-bold text-cla-text dark:text-white">৳ 45,000</p>
                    <p className="mt-1 text-xs text-green-500 font-medium">Across 5 services</p>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-[#111] border border-cla-border dark:border-cla-border-dark shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                    <p className="text-xs font-bold text-cla-text-muted dark:text-cla-text-muted-dark uppercase tracking-wider">Last Payment</p>
                    <p className="mt-2 text-2xl font-bold text-cla-text dark:text-white">৳ 5,000</p>
                    <p className="mt-1 text-xs text-cla-text-muted dark:text-cla-text-muted-dark">To Anisul Huq • Nov 18</p>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-[#111] border border-cla-border dark:border-cla-border-dark shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                    <p className="text-xs font-bold text-cla-text-muted dark:text-cla-text-muted-dark uppercase tracking-wider">Payment Method</p>
                    <div className="mt-3 flex items-center gap-2">
                        <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-bold border border-blue-100 dark:border-blue-800">VISA •• 4242</div>
                        <div className="px-2 py-1 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded text-xs font-bold border border-pink-100 dark:border-pink-800">bKash</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Actionable Section: Due Invoices */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-cla-text dark:text-white flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-cla-gold" />
                        Outstanding Invoices
                    </h2>
                    
                    {isLoading ? (
                        <div className="p-8 text-center text-sm text-gray-500">Loading invoices...</div>
                    ) : outstandingInvoices.length > 0 ? (
                        <div className="space-y-4">
                            {outstandingInvoices.map((inv) => (
                                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-[#111] border border-cla-border dark:border-cla-border-dark rounded-xl shadow-sm hover:border-cla-gold/50 transition-colors group">
                                    <div>
                                        <h3 className="font-bold text-cla-text dark:text-white text-lg">{inv.caseTitle}</h3>
                                        <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-1">Lawyer: <span className="font-medium text-cla-text dark:text-gray-300">{inv.lawyerName}</span></p>
                                        <div className="flex items-center gap-3 mt-3 text-xs">
                                            <span className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-gray-600 dark:text-gray-300">ID: {inv.id}</span>
                                            <span className={`font-medium px-2 py-1 rounded ${inv.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/10 text-red-500' : 'bg-amber-50 dark:bg-amber-900/10 text-amber-600'}`}>
                                                Due: {new Date(inv.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 sm:mt-0 flex flex-col items-end gap-3">
                                        <span className="text-2xl font-bold text-cla-text dark:text-white">৳ {inv.amount.toLocaleString()}</span>
                                        <button 
                                            onClick={() => handlePayNow(inv)}
                                            className="inline-flex items-center justify-center rounded-full bg-emerald-500 text-white px-6 py-2 text-xs font-bold uppercase tracking-wide hover:bg-emerald-600 transition-colors shadow-md w-full sm:w-auto"
                                        >
                                            Pay Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-white dark:bg-[#111] rounded-xl border border-dashed border-cla-border dark:border-cla-border-dark text-sm text-gray-500">
                            No outstanding invoices. You are all caught up!
                        </div>
                    )}

                    {/* Payment History Table */}
                    <div className="pt-6">
                        <h2 className="text-lg font-bold text-cla-text dark:text-white mb-4 flex items-center gap-2">
                            <BanknotesIcon className="w-5 h-5 text-gray-400" />
                            Payment History
                        </h2>
                        <div className="bg-white dark:bg-[#111] rounded-xl border border-cla-border dark:border-cla-border-dark overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-white/5 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Date & Time</th>
                                            <th className="px-6 py-4 font-medium">Invoice</th>
                                            <th className="px-6 py-4 font-medium">Case / Service</th>
                                            <th className="px-6 py-4 font-medium text-right">Amount</th>
                                            <th className="px-6 py-4 font-medium text-right">Method</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-cla-border dark:divide-cla-border-dark">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-cla-text-muted dark:text-gray-400">
                                                    Loading history...
                                                </td>
                                            </tr>
                                        ) : paymentHistory.length > 0 ? (
                                            paymentHistory.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4 text-cla-text-muted dark:text-gray-400">
                                                        {payment.paidAt}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-cla-text dark:text-white">
                                                        {payment.invoiceId}
                                                    </td>
                                                    <td className="px-6 py-4 text-cla-text-muted dark:text-gray-400">
                                                        {payment.caseTitle}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-cla-text dark:text-white">
                                                        ৳ {payment.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-cla-text-muted dark:text-gray-400">
                                                        {payment.method}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-cla-text-muted dark:text-gray-400">
                                                    No payment history found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Secure Payment Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-bold mb-4 relative z-10">Secure Wallet</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-6 bg-white/20 rounded"></div>
                                    <div>
                                        <p className="text-sm font-bold">VISA ending in 4242</p>
                                        <p className="text-xs opacity-70">Expires 12/25</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">Default</span>
                            </div>
                            <button className="w-full py-2.5 border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                <CreditCardIcon className="w-4 h-4" /> Manage Methods
                            </button>
                        </div>
                    </div>

                    <div className="bg-cla-surface dark:bg-[#111] p-6 rounded-2xl border border-cla-border dark:border-cla-border-dark shadow-sm">
                        <h3 className="font-bold text-cla-text dark:text-white mb-3">Payment Support</h3>
                        <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mb-4">
                            Having trouble with a transaction? Our billing support team is available 24/7.
                        </p>
                        <button onClick={handleContactSupport} className="text-sm text-cla-gold font-bold hover:underline">Contact Billing Support →</button>
                    </div>
                </div>
            </div>

            {selectedInvoice && (
                <PaymentModal 
                    isOpen={!!selectedInvoice} 
                    onClose={() => setSelectedInvoice(null)} 
                    invoice={selectedInvoice} 
                />
            )}
        </section>
    );
};
