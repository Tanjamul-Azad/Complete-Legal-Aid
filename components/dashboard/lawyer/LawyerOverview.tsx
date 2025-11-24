import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../../context/AppContext';
import {
    BriefcaseIcon, CalendarIcon, MessageIcon, DocumentCloudIcon, ClockIcon,
    ClipboardDocumentCheckIcon, BanknotesIcon, GavelIcon, SparklesIcon, BookOpenIcon, ChevronRightIcon, CloseIcon
} from '../../icons';
import { TaskManagerModal, type ManualTask } from './TaskManagerModal';

const MetricCard: React.FC<{ icon: React.ReactNode, value: string, label: string, subtext: string, onClick?: () => void }> = ({ icon, value, label, subtext, onClick }) => (
    <div
        onClick={onClick}
        className="p-5 rounded-xl bg-white dark:bg-[#050816] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-150 hover:-translate-y-[2px] cursor-pointer flex flex-col justify-between"
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs uppercase tracking-wide text-cla-text-muted dark:text-cla-text-muted-dark font-semibold">{label}</p>
                <p className="mt-3 text-3xl font-bold text-cla-text dark:text-white">{value}</p>
                <p className="mt-1 text-xs text-cla-text-muted dark:text-cla-text-muted-dark font-medium">
                    {subtext}
                </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-cla-gold/10 flex items-center justify-center text-cla-gold">
                {icon}
            </div>
        </div>
    </div>
);

const ActivityItem: React.FC<{ icon: React.ReactNode, text: React.ReactNode, time: string, isLast?: boolean }> = ({ icon, text, time, isLast }) => (
    <div className="relative flex items-start gap-4">
        {!isLast && <div className="absolute top-6 left-[15px] h-full w-[2px] bg-cla-border dark:bg-cla-border-dark" />}
        <div className="relative z-10 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-cla-gold/10 text-cla-gold ring-4 ring-cla-surface dark:ring-cla-surface-dark">
            {icon}
        </div>
        <div className="flex-1 py-1">
            <div className="font-medium text-sm text-cla-text dark:text-white">{text}</div>
            <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark mt-1">{time}</p>
        </div>
    </div>
);

const LegalReportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const downloadReportAsPdf = () => {
        const contentElement = document.getElementById('legal-report-content');
        if (!contentElement) return;
        const content = contentElement.innerHTML;

        const w = window.open('', '_blank');
        if (w) {
            w.document.write(`
                <html>
                  <head>
                    <title>Legal Analysis Report</title>
                    <style>
                      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; }
                      h3 { margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
                      p, li { font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 8px; }
                      ul { padding-left: 20px; margin-bottom: 16px; }
                      .font-medium { font-weight: 600; }
                      /* Simple utilities for the print view */
                      .mb-2 { margin-bottom: 0.5rem; }
                      .text-xs { font-size: 0.75rem; }
                      .bg-blue-100 { background-color: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-right: 8px; }
                      .bg-purple-100 { background-color: #f3e8ff; color: #6b21a8; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-right: 8px; }
                      .bg-amber-100 { background-color: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-right: 8px; }
                      .bg-green-100 { background-color: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-right: 8px; }
                      .flex { display: flex; align-items: center; }
                    </style>
                  </head>
                  <body>
                    <div style="margin-bottom: 32px; border-bottom: 2px solid #0f172a; padding-bottom: 16px;">
                        <h1 style="font-size: 24px; margin: 0;">Legal Analysis Report</h1>
                        <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Generated on ${new Date().toLocaleDateString()} • Case ID c#21</p>
                    </div>
                    ${content}
                    <div style="margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                        Confidential • Complete Legal Aid Platform
                    </div>
                  </body>
                </html>
            `);
            w.document.close();
            w.focus();
            setTimeout(() => {
                w.print();
            }, 500);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div
                className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#050816] border border-slate-200 dark:border-slate-800 shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-[#050816] z-10">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                            Legal Analysis – Land Dispute in Savar
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Generated · Today at 03:24 PM · Case ID c#21
                        </p>
                    </div>
                    <button
                        className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        onClick={onClose}
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div id="legal-report-content" className="px-6 py-6 space-y-6 text-sm text-slate-800 dark:text-slate-100">
                    <section>
                        <h3 className="font-semibold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">1</span>
                            Case Summary
                        </h3>
                        <div className="pl-7">
                            <p className="text-slate-600 dark:text-slate-300 text-[13px] leading-relaxed">
                                John Doe alleges boundary encroachment by neighboring property in Savar. A permanent
                                fence has been constructed beyond the registered land demarcation. Client possesses updated RS Khatian and survey report from 2022 indicating clear violation of approximately 450 sq. ft.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs">2</span>
                            Applicable Laws
                        </h3>
                        <div className="pl-7">
                            <ul className="list-disc list-outside ml-3 text-[13px] text-slate-600 dark:text-slate-300 space-y-1.5">
                                <li><span className="font-medium text-slate-800 dark:text-slate-200">Land Boundary Act – Section 14:</span> Governs boundary disputes and encroachment procedures.</li>
                                <li><span className="font-medium text-slate-800 dark:text-slate-200">Civil Procedure Code – Order 39:</span> Relevant for filing interim injunctions to stop further construction.</li>
                                <li><span className="font-medium text-slate-800 dark:text-slate-200">Specific Relief Act 1877:</span> Section 42 for declaration of title and Section 8 for recovery of possession.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">3</span>
                            Key Precedents
                        </h3>
                        <div className="pl-7">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                <p className="text-[13px] text-slate-600 dark:text-slate-300">
                                    <span className="font-medium text-slate-800 dark:text-slate-200 block mb-1">Supreme Court – 2019 Civil Appeal 134</span>
                                    The Court held that structural encroachment beyond 2ft is actionable without prior negotiation if intent is malicious. Ordered removal of structure at defendant's cost.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs">4</span>
                            Risk & Strategy
                        </h3>
                        <div className="pl-7">
                            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                Likelihood of success is <span className="font-semibold text-green-600 dark:text-green-400">Moderate to High</span> if the digital survey supports the client’s claim.
                                <br /><br />
                                <strong>Recommended Strategy:</strong>
                                <br />1. Issue Legal Notice demanding removal within 15 days.
                                <br />2. If non-compliant, file for mandatory injunction under Order 39.
                                <br />3. Prepare for local inquiry commission appointment.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer actions */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-[#050816] z-10">
                    <button
                        className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    <button
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-brand text-white hover:bg-brand-strong shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                        onClick={downloadReportAsPdf}
                    >
                        <DocumentCloudIcon className="w-4 h-4" />
                        Download as PDF
                    </button>
                </div>
            </div>
        </div>
    );
};


export const LawyerOverview: React.FC = () => {
    const context = useContext(AppContext);

    // Hooks must be called unconditionally
    const [caseOverviewTab, setCaseOverviewTab] = useState('This Month');
    const [scheduleTab, setScheduleTab] = useState('Week');
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // Task State (Initialize with some mock manual tasks)
    const [manualTasks, setManualTasks] = useState<ManualTask[]>([
        { id: 'mt1', title: 'Review NDA for Startup Client', completed: false, dueDate: new Date().toISOString().split('T')[0] },
        { id: 'mt2', title: 'Submit court fees for Case #21', completed: false, dueDate: new Date().toISOString().split('T')[0] }
    ]);

    // Safely access context values
    const user = context?.user;
    const setDashboardSubPage = context?.setDashboardSubPage || (() => { });
    const appointments = context?.appointments || [];

    // Calculate total pending tasks (Manual + Automated from Future Appointments)
    const automatedTasks = useMemo(() => {
        const now = new Date();
        if (!user) return [];
        return appointments.filter(a =>
            a.lawyerId === user.id &&
            a.status === 'Confirmed' &&
            new Date(a.date) >= now
        );
    }, [appointments, user]);

    const pendingTaskCount = manualTasks.filter(t => !t.completed).length + automatedTasks.length;
    const dueTodayCount = manualTasks.filter(t => !t.completed && t.dueDate === new Date().toISOString().split('T')[0]).length +
        automatedTasks.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length;


    // Filter today's appointments for display
    const todaysAppointments = useMemo(() => {
        if (!user) return [];
        const todayStr = new Date().toDateString();
        return appointments
            .filter(a => a.lawyerId === user.id && new Date(a.date).toDateString() === todayStr)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [appointments, user]);

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Adjust so Mon is 0

    if (!context || !user) return null;

    const caseStages = [
        { name: 'Intake', count: 2, color: 'bg-sky-400' },
        { name: 'Review', count: 5, color: 'bg-teal-400' },
        { name: 'Drafting', count: 3, color: 'bg-amber-400' },
        { name: 'Filed', count: 4, color: 'bg-orange-500' },
        { name: 'Hearing', count: 2, color: 'bg-purple-400' },
        { name: 'Closed', count: 8, color: 'bg-slate-500' },
    ];
    const maxCount = Math.max(...caseStages.map(s => s.count));

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Row 1: Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <MetricCard icon={<BriefcaseIcon className="w-5 h-5" />} value="12" label="Active Cases" subtext="3 in Hearing this week" onClick={() => setDashboardSubPage('cases')} />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <MetricCard icon={<GavelIcon className="w-5 h-5" />} value="4" label="Hearings" subtext="Next: Thu 10:30 AM" onClick={() => setDashboardSubPage('appointments')} />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <MetricCard
                        icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
                        value={pendingTaskCount.toString()}
                        label="Tasks"
                        subtext={`${dueTodayCount} due today`}
                        onClick={() => setIsTaskModalOpen(true)}
                    />
                </div>
                <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                    <MetricCard icon={<BanknotesIcon className="w-5 h-5" />} value="12.5h" label="Billable Hours" subtext="Tracked this week" onClick={() => setDashboardSubPage('billing')} />
                </div>
            </div>

            {/* Row 2: Main Analytics Split */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left 8/12: Analytics Case Pipeline */}
                <div className="xl:col-span-8 bg-cla-surface dark:bg-cla-surface-dark p-8 rounded-2xl border border-cla-border dark:border-cla-border-dark shadow-sm animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-50">
                                Case Overview
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Breakdown of your cases by stage.
                            </p>
                        </div>

                        <div className="inline-flex rounded-full bg-slate-100 dark:bg-slate-900 p-1 text-xs">
                            {['This Week', 'This Month', '90 Days'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setCaseOverviewTab(tab)}
                                    className={`px-3 py-1 rounded-full transition-colors ${caseOverviewTab === tab
                                        ? 'bg-brand text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Analytics Chart */}
                    <div className="space-y-4">
                        {caseStages.map(stage => (
                            <div key={stage.name} className="flex items-center gap-4 text-xs font-medium">
                                <div className="w-20 text-right text-cla-text-muted dark:text-cla-text-muted-dark">{stage.name}</div>
                                <div className="flex-1 h-3 bg-cla-bg dark:bg-cla-bg-dark rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${stage.color}`}
                                        style={{ width: `${(stage.count / maxCount) * 100}%` }}
                                    />
                                </div>
                                <div className="w-6 text-right text-cla-text dark:text-white font-bold">{stage.count}</div>
                            </div>
                        ))}
                    </div>

                    {/* Cases Needing Attention */}
                    <div className="mt-6">
                        <hr className="my-4 border-slate-200 dark:border-slate-800" />
                        <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Cases Needing Attention
                        </h3>
                        <div className="space-y-2">
                            {/* Alert 1: Hearing */}
                            <button
                                onClick={() => setDashboardSubPage('cases')}
                                className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 px-4 py-3 text-left hover:border-brand hover:bg-brand-soft/60 dark:hover:bg-brand-soft/10 transition-all duration-150 group"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-50">
                                        Land Dispute – Savar (c#21)
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Next hearing approaching. Review documents and prepare notes.
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
                                        Hearing tomorrow
                                    </span>
                                    <span className="text-slate-400 dark:text-slate-500 text-lg group-hover:text-brand transition-colors">
                                        ›
                                    </span>
                                </div>
                            </button>

                            {/* Alert 2: Deadline */}
                            <button
                                onClick={() => setDashboardSubPage('cases')}
                                className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 px-4 py-3 text-left hover:border-brand hover:bg-brand-soft/60 dark:hover:bg-brand-soft/10 transition-all duration-150 group"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-50">
                                        Contract Review (c#34)
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Client waiting for initial draft. Review partnership clauses.
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap">
                                        Draft due in 2 days
                                    </span>
                                    <span className="text-slate-400 dark:text-slate-500 text-lg group-hover:text-brand transition-colors">
                                        ›
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right 4/12: Schedule & Calendar */}
                <div className="xl:col-span-4 bg-cla-surface dark:bg-cla-surface-dark p-6 rounded-2xl border border-cla-border dark:border-cla-border-dark shadow-sm animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-cla-text dark:text-white">My Schedule</h3>
                        <div className="inline-flex rounded-lg bg-cla-bg dark:bg-cla-bg-dark p-1 text-xs font-medium">
                            {['Day', 'Week', 'Month'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setScheduleTab(tab)}
                                    className={`px-3 py-1 rounded-md transition-all ${scheduleTab === tab
                                        ? 'bg-white dark:bg-cla-surface-dark text-cla-text dark:text-white shadow-sm font-semibold'
                                        : 'text-cla-text-muted dark:text-cla-text-muted-dark'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Week View */}
                    <div className="flex justify-between text-center mb-6 px-2">
                        {weekDays.map((day, i) => (
                            <div key={day} className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-bold uppercase text-cla-text-muted dark:text-cla-text-muted-dark">{day}</span>
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${i === currentDayIndex
                                    ? 'bg-cla-gold text-white shadow-lg shadow-cla-gold/30'
                                    : 'text-cla-text dark:text-white hover:bg-cla-bg dark:hover:bg-cla-bg-dark'
                                    }`}>
                                    {new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1 + i)).getDate()}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Agenda List */}
                    <div className="space-y-1">
                        {todaysAppointments.length > 0 ? todaysAppointments.map(appt => (
                            <div key={appt.id} className="flex items-center gap-4 p-3 hover:bg-cla-bg dark:hover:bg-cla-bg-dark rounded-xl transition-colors border border-transparent hover:border-cla-border dark:hover:border-cla-border-dark group">
                                <div className="text-center min-w-[48px]">
                                    <p className="text-xs font-bold text-cla-text dark:text-white">{appt.time.split(' ')[0]}</p>
                                    <p className="text-[10px] text-cla-text-muted dark:text-cla-text-muted-dark uppercase">{appt.time.split(' ')[1]}</p>
                                </div>
                                <div className="w-1 h-8 rounded-full bg-cla-gold/50 group-hover:bg-cla-gold transition-colors"></div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold text-sm text-cla-text dark:text-white truncate">{appt.title || appt.type}</p>
                                    <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark truncate">{appt.type} • {appt.mode}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 bg-cla-bg/50 dark:bg-cla-bg-dark/50 rounded-xl border border-dashed border-cla-border dark:border-cla-border-dark">
                                <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark font-medium">No events scheduled today.</p>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setDashboardSubPage('appointments')} className="mt-6 w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider text-cla-gold hover:bg-cla-gold/10 rounded-lg transition-colors border border-cla-gold/20 hover:border-cla-gold">
                        View Full Calendar
                    </button>
                </div>
            </div>

            {/* Row 3: Secondary Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Activity Timeline */}
                <div className="xl:col-span-8 bg-cla-surface dark:bg-cla-surface-dark p-8 rounded-2xl border border-cla-border dark:border-cla-border-dark shadow-sm animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <h3 className="text-lg font-bold text-cla-text dark:text-white mb-6">Recent Activity</h3>
                    <div className="space-y-6 pl-2">
                        <ActivityItem icon={<MessageIcon className="w-4 h-4" />} text={<>New message from <strong className="text-cla-text dark:text-white">John Doe</strong> in Case c#21</>} time="5 min ago" />
                        <ActivityItem icon={<DocumentCloudIcon className="w-4 h-4" />} text={<><strong className="text-cla-text dark:text-white">Partnership_Agreement_Final.pdf</strong> uploaded by client in Case c#34</>} time="20 min ago" />
                        <ActivityItem icon={<CalendarIcon className="w-4 h-4" />} text={<>Appointment booked by <strong className="text-cla-text dark:text-white">Jane Smith</strong> for tomorrow</>} time="1 hour ago" isLast={true} />
                    </div>
                </div>

                {/* Intelligence & Tools (Smart Legal Research) */}
                <div className="xl:col-span-4 space-y-6 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <div className="bg-white dark:bg-cla-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4 text-brand" />
                                Smart Legal Research
                            </h2>
                            <button className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-brand transition-colors">
                                View All Reports
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg mb-3">
                            <span className="text-slate-600 dark:text-slate-300">🔍</span>
                            <input
                                type="text"
                                placeholder="Search case law, precedents, or legal articles…"
                                className="flex-1 bg-transparent text-xs focus:outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>

                        {/* Snippets */}
                        <div className="space-y-2 text-xs">
                            <div className="p-3 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                    Land Boundary Act – Section 14
                                </p>
                                <p className="mt-1 text-slate-600 dark:text-slate-400">
                                    Defines property encroachment guidelines and dispute resolution procedures.
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                    Supreme Court Ruling – 2019 Civil Appeal 134
                                </p>
                                <p className="mt-1 text-slate-600 dark:text-slate-400">
                                    Court held that structural encroachment beyond 2ft is actionable without negotiation.
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            className="mt-4 w-full px-4 py-2 rounded-full bg-brand text-white text-xs font-semibold hover:bg-brand-strong transition-all duration-150 shadow-sm hover:shadow-md"
                            onClick={() => setIsReportOpen(true)}
                        >
                            Generate Full Legal Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <LegalReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
            {isTaskModalOpen && (
                <TaskManagerModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    appointments={appointments}
                    manualTasks={manualTasks}
                    setManualTasks={setManualTasks}
                />
            )}
        </div>
    );
};