import React, { useContext, useMemo, useState, useEffect } from 'react';
import type { User, Appointment, ActivityLog, Case, DashboardSubPage, EvidenceDocument, Notification } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import {
    BriefcaseIcon, CalendarIcon, VaultIcon, PlusCircleIcon, SearchIcon,
    ChevronRightIcon, DocumentTextIcon, BookOpenIcon, WarningIcon, RobotIcon,
    LockClosedIcon, StarIcon, MessageIcon, ClockIcon, DocumentCloudIcon, ScaleIcon, BuildingOfficeIcon
} from '../../icons';

// --- Helper Components (Defined outside to prevent re-renders) ---

const SectionHeader: React.FC<{ icon: React.ReactNode, title: string, className?: string, count?: number }> = ({ icon, title, className = '', count }) => (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
        <div className="p-2 bg-cla-surface dark:bg-cla-bg-dark rounded-lg">{icon}</div>
        <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-cla-text dark:text-cla-text-dark">{title}</h3>
            {typeof count !== 'undefined' && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cla-gold/20 text-cla-gold-darker dark:text-cla-gold">{count} items</span>}
        </div>
    </div>
);

const ClickableWidget: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
    <div onClick={onClick} className={`bg-cla-surface dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark rounded-xl transition-all duration-300 hover:ring-2 hover:ring-cla-gold cursor-pointer transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cla-gold/10 ${className}`}>
        {children}
    </div>
);

const AttentionItem: React.FC<{ icon: React.ReactNode, title: string, description: string, buttonText: string, onClick: () => void; }> = ({ icon, title, description, buttonText, onClick }) => (
    <div className="flex items-center gap-4 p-4 bg-cla-surface dark:bg-cla-bg-dark rounded-lg">
        <div className="text-cla-gold flex-shrink-0">{icon}</div>
        <div className="flex-grow">
            <h4 className="font-semibold text-cla-text dark:text-cla-text-dark">{title}</h4>
            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">{description}</p>
        </div>
        <button onClick={onClick} className="self-center px-3 py-1 text-xs font-semibold bg-cla-gold/10 text-cla-gold rounded-full hover:bg-cla-gold/20 transition-colors whitespace-nowrap">{buttonText}</button>
    </div>
);

const getCaseIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('land') || lowerTitle.includes('rental') || lowerTitle.includes('property')) return <BuildingOfficeIcon className="w-5 h-5 text-cla-text-muted dark:text-cla-text-muted-dark" />;
    if (lowerTitle.includes('bail') || lowerTitle.includes('custody')) return <ScaleIcon className="w-5 h-5 text-cla-text-muted dark:text-cla-text-muted-dark" />;
    if (lowerTitle.includes('contract') || lowerTitle.includes('filing')) return <DocumentTextIcon className="w-5 h-5 text-cla-text-muted dark:text-cla-text-muted-dark" />;
    return <BriefcaseIcon className="w-5 h-5 text-cla-text-muted dark:text-cla-text-muted-dark" />;
};

const getActivityType = (message: string): 'upload' | 'update' | 'appointment' | 'message' | 'default' => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('upload')) return 'upload';
    if (lowerMessage.includes('status') || lowerMessage.includes('updated')) return 'update';
    if (lowerMessage.includes('appointment') || lowerMessage.includes('rescheduled')) return 'appointment';
    if (lowerMessage.includes('message')) return 'message';
    return 'default';
};

const ActivityIcon: React.FC<{ type: ReturnType<typeof getActivityType> }> = ({ type }) => {
    const iconProps = { className: "w-5 h-5" };
    switch (type) {
        case 'upload': return <DocumentCloudIcon {...iconProps} />;
        case 'update': return <BriefcaseIcon {...iconProps} />;
        case 'appointment': return <CalendarIcon {...iconProps} />;
        case 'message': return <MessageIcon {...iconProps} />;
        default: return <ClockIcon {...iconProps} />;
    }
};

const ActivityMessage: React.FC<{ message: string; onCaseClick: (id: string) => void }> = ({ message, onCaseClick }) => {
    const parts = message.split(/(Case #\w+|"[^"]+")/g);
    return (
        <p className="text-cla-text dark:text-cla-text-dark">
            {parts.map((part, index) => {
                if (part.startsWith('Case #')) {
                    const targetCaseId = part.split('#')[1];
                    return <button key={index} onClick={() => onCaseClick(targetCaseId)} className="font-semibold text-cla-gold hover:underline">{part}</button>;
                }
                if (part.startsWith('"')) {
                    return <strong key={index} className="font-semibold text-cla-text dark:text-white">{part}</strong>;
                }
                return part;
            })}
        </p>
    );
};

export const CitizenOverview: React.FC = () => {
    const context = useContext(AppContext);
    const [animateProgress, setAnimateProgress] = useState(false);

    // All hooks must be called at the top level, before any conditional returns.
    const user = context?.user;
    const activityLogs = context?.activityLogs;

    const initialUserActivity = useMemo(() => {
        if (!user || !activityLogs) return [];
        return activityLogs.filter(a => a.userId === user.id);
    }, [activityLogs, user]);

    const [displayedActivity, setDisplayedActivity] = useState<ActivityLog[]>([]);

    useEffect(() => {
        setDisplayedActivity(initialUserActivity);
    }, [initialUserActivity]);

    useEffect(() => {
        const timer = setTimeout(() => setAnimateProgress(true), 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!user) return;
        const mockActivities = [
            { userId: user.id, message: 'You have a new message from "Barrister Sumon" regarding Case #c2.', caseId: 'c2' },
            { userId: user.id, message: 'Your appointment with "Anisul Huq" was rescheduled to tomorrow.' },
            { userId: user.id, message: 'New document "Partnership_Agreement_Final.pdf" uploaded to Case #c4.', caseId: 'c4' },
        ];
        let mockIndex = 0;

        const intervalId = setInterval(() => {
            const newActivity = { ...mockActivities[mockIndex % mockActivities.length], id: `mock-${Date.now()}`, timestamp: 'Just now' };
            setDisplayedActivity(prev => [newActivity, ...prev]);
            mockIndex++;
        }, 7000);

        return () => clearInterval(intervalId);
    }, [user]);

    // This conditional return must come AFTER all hooks have been called.
    if (!context || !user) {
        return null;
    }

    const {
        users: allUsers, appointments, cases, messages, evidenceDocuments, notifications,
        setDashboardSubPage, setReviewTarget, setChatOpen, setSelectedCaseId,
        openInbox, setSelectedCaseForUpload, handleNotificationNavigation
    } = context;

    const documentCount = evidenceDocuments.filter(doc => cases.some(c => c.id === doc.caseId && c.clientId === user.id)).length;
    const activeCases = cases.filter(c => c.clientId === user.id && c.status !== 'Resolved');

    const attentionItems = useMemo(() => {
        const items: any[] = [];
        const userNotifications = notifications.filter(n => n.userId === user.id && !n.read);
        const priorityOrder: Notification['type'][] = ['deadline', 'new_message', 'appointment', 'case_update'];
        const sortedNotifications = userNotifications.sort((a, b) => {
            const priorityA = priorityOrder.indexOf(a.type);
            const priorityB = priorityOrder.indexOf(b.type);
            if (priorityA !== priorityB) return priorityA - priorityB;
            return b.timestamp - a.timestamp;
        });

        sortedNotifications.slice(0, 4).forEach(notif => {
            let item: any = { id: notif.id, title: notif.title, description: notif.body || '', onClick: () => { handleNotificationNavigation(notif); openInbox(); } };
            switch (notif.type) {
                case 'new_message': item.icon = <MessageIcon className="w-6 h-6" />; item.buttonText = 'View Message'; break;
                case 'appointment': item.icon = <CalendarIcon className="w-6 h-6" />; item.buttonText = 'View Schedule'; break;
                case 'deadline': item.icon = <WarningIcon className="w-6 h-6" />; item.buttonText = 'View Case'; break;
                default: item.icon = <BriefcaseIcon className="w-6 h-6" />; item.buttonText = 'View Details';
            }
            items.push(item);
        });

        const pendingReviewCase = cases.find(c => c.clientId === user.id && c.status === 'Resolved' && !c.reviewed);
        if (pendingReviewCase && items.length < 4) {
            const lawyer = allUsers.find(u => u.id === pendingReviewCase.lawyerId);
            if (lawyer) {
                items.push({ id: 'review', icon: <StarIcon className="w-6 h-6" />, title: `Rate your experience for case: "${pendingReviewCase.title}"`, description: `Your case with ${lawyer.name} is complete. Please provide your feedback.`, buttonText: 'Leave a Review', onClick: () => setReviewTarget({ lawyerId: lawyer.id, source: { type: 'case', id: pendingReviewCase.id } }) });
            }
        }
        return items;
    }, [user.id, notifications, cases, handleNotificationNavigation, setReviewTarget, openInbox, allUsers]);

    const handleCaseClick = (targetCaseId: string) => {
        if (setSelectedCaseId) {
            setSelectedCaseId(targetCaseId);
            setDashboardSubPage('cases');
        }
    };

    return (
        <div className="space-y-8">
            <div className="animate-fade-in-up pb-8 border-b border-cla-border dark:border-cla-border-dark">
                <h1 className="text-3xl font-semibold text-cla-text dark:text-cla-text-dark">Welcome back, {user.name} 👋</h1>
                <p className="text-md text-cla-text-muted dark:text-cla-text-muted-dark mt-1">{attentionItems.length > 0 ? `Here’s what needs your attention today.` : "You're all caught up. Here's a summary of your activities."}</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    {attentionItems.length > 0 && (
                        <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <SectionHeader icon={<WarningIcon className="w-6 h-6 text-yellow-500" />} title="Needs Your Attention" count={attentionItems.length} />
                            <div className="space-y-3">{attentionItems.map(item => <AttentionItem key={item.id} {...item} />)}</div>
                        </section>
                    )}

                    <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <SectionHeader icon={<BriefcaseIcon className="w-6 h-6 text-cla-gold" />} title="Active Cases" />
                        <ClickableWidget onClick={() => setDashboardSubPage('cases')} className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-cla-text dark:text-cla-text-dark">Case Progress</h3>
                                <div className="flex items-center text-sm text-cla-gold hover:underline"><span>View All</span><ChevronRightIcon className="w-4 h-4 ml-1" /></div>
                            </div>
                            {activeCases.length > 0 ? (
                                <div className="space-y-6">
                                    {activeCases.slice(0, 3).map(c => {
                                        const steps = ['Submitted', 'In Review', 'Scheduled', 'Resolved'];
                                        const currentStep = steps.indexOf(c.status);
                                        const progress = currentStep >= 0 ? ((currentStep + 1) / (steps.length) * 100) : 0;
                                        return (
                                            <div key={c.id} onClick={(e) => { e.stopPropagation(); setSelectedCaseId(c.id); setDashboardSubPage('cases'); }} className="hover:bg-cla-surface dark:hover:bg-cla-bg-dark -m-2 p-2 rounded-md cursor-pointer">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="font-semibold text-cla-text dark:text-cla-text-dark flex items-center gap-2">{getCaseIcon(c.title)} {c.title}</p>
                                                    <p className="text-sm font-medium text-cla-text-muted dark:text-cla-text-muted-dark">{c.status}</p>
                                                </div>
                                                <div className="w-full bg-cla-border dark:bg-cla-border-dark rounded-full h-2">
                                                    <div className="bg-cla-gold h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: animateProgress ? `${progress}%` : '0%' }}></div>
                                                </div>
                                                <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark mt-2">Next action: Lawyer Review</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <DocumentTextIcon className="w-12 h-12 text-cla-text-muted dark:text-cla-text-muted-dark mx-auto" />
                                    <p className="mt-2 text-cla-text-muted dark:text-cla-text-muted-dark font-medium">You have no active cases.</p>
                                </div>
                            )}
                        </ClickableWidget>
                    </section>

                    <section className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <SectionHeader icon={<ClockIcon className="w-6 h-6 text-cla-gold" />} title="Recent Activity" />
                        <div className="bg-cla-surface dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark p-6 rounded-xl">
                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {displayedActivity.length > 0 ? displayedActivity.slice(0, 5).map((log, index) => {
                                    const type = getActivityType(log.message);
                                    const iconColors = { upload: 'text-blue-500 bg-blue-500/10', update: 'text-cla-gold bg-cla-gold/10', appointment: 'text-green-500 bg-green-500/10', message: 'text-purple-500 bg-purple-500/10', default: 'text-gray-500 bg-gray-500/10' };
                                    return (
                                        <div key={log.id} className="relative flex items-start gap-4 animate-fade-in-up" style={{ animationDuration: '500ms' }}>
                                            {index < displayedActivity.slice(0, 5).length - 1 && <div className="absolute top-5 left-[11px] h-full w-0.5 bg-cla-border dark:bg-cla-border-dark" />}
                                            <div className={`relative z-10 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full mt-1 ${iconColors[type]}`}><ActivityIcon type={type} /></div>
                                            <div className="flex-1 flex justify-between items-start text-sm">
                                                <div>
                                                    <ActivityMessage message={log.message} onCaseClick={handleCaseClick} />
                                                    <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark mt-0.5">{log.timestamp}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-cla-text-muted dark:text-cla-text-muted-dark text-center py-4">No recent activity.</p>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        <SectionHeader icon={<CalendarIcon className="w-6 h-6 text-cla-gold" />} title="My Schedule" />
                        <ClickableWidget onClick={() => setDashboardSubPage('appointments')} className="p-6">
                            {appointments.filter(a => new Date(a.date) >= new Date()).length > 0 ? <div>...</div> : (
                                <div className="text-center">
                                    <p className="font-medium text-cla-text-muted dark:text-cla-text-muted-dark">No upcoming appointments.</p>
                                    <button onClick={(e) => { e.stopPropagation(); setDashboardSubPage('find-lawyers'); }} className="mt-3 px-4 py-2 text-sm font-semibold bg-cla-gold text-cla-text rounded-lg hover:bg-cla-gold-darker transition-colors">Book a Consultation</button>
                                </div>
                            )}
                        </ClickableWidget>
                    </section>

                    <section className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                        <SectionHeader icon={<VaultIcon className="w-6 h-6 text-cla-gold" />} title="Evidence Vault" />
                        <ClickableWidget onClick={() => setDashboardSubPage('vault')} className="p-6 text-center">
                            <p className="text-6xl font-bold text-cla-gold">{documentCount}</p>
                            <p className="text-cla-text-muted dark:text-cla-text-muted-dark mt-1 text-sm font-semibold uppercase tracking-wider">Documents Secured</p>
                            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-green-600 dark:text-green-400">
                                <LockClosedIcon className="w-4 h-4" />
                                <span>Vault is end-to-end encrypted</span>
                            </div>
                        </ClickableWidget>
                    </section>

                    <section className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                        <div className="bg-cla-surface dark:bg-cla-surface-dark border border-cla-border dark:border-cla-border-dark p-6 rounded-xl">
                            <SectionHeader icon={<RobotIcon className="w-6 h-6 text-cla-gold" />} title="Quick AI Help" className="mb-2" />
                            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mb-4">Ask our AI assistant for preliminary legal information.</p>
                            <div className="space-y-2 text-sm">
                                <button onClick={() => setChatOpen(true)} className="block w-full text-left p-2 rounded-md hover:bg-cla-surface-dark/50 dark:hover:bg-cla-bg-dark text-blue-500 dark:text-blue-400">How to file a GD?</button>
                                <button onClick={() => setChatOpen(true)} className="block w-full text-left p-2 rounded-md hover:bg-cla-surface-dark/50 dark:hover:bg-cla-bg-dark text-blue-500 dark:text-blue-400">What are my rights in a labor dispute?</button>
                            </div>
                        </div>
                    </section>

                    <section className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                        <SectionHeader icon={<BookOpenIcon className="w-6 h-6 text-cla-gold" />} title="Legal Resources" />
                        <div className="space-y-3">
                            <ClickableWidget onClick={() => { }} className="p-4">
                                <h4 className="font-semibold text-cla-text dark:text-cla-text-dark">Bangladesh Legal Aid Act, 2000</h4>
                                <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark mt-1">Understand your rights to government-funded legal aid.</p>
                            </ClickableWidget>
                            <ClickableWidget onClick={() => { }} className="p-4">
                                <h4 className="font-semibold text-cla-text dark:text-cla-text-dark">The Code of Civil Procedure, 1908</h4>
                                <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark mt-1">Rules governing civil lawsuits in Bangladesh.</p>
                            </ClickableWidget>
                        </div>
                    </section>

                    <section className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                        <SectionHeader icon={<PlusCircleIcon className="w-6 h-6 text-cla-gold" />} title="Quick Actions" />
                        <div className="flex flex-col gap-3">
                            <button onClick={() => setDashboardSubPage('cases')} className="w-full text-center px-4 py-3 bg-cla-gold/10 text-cla-gold font-bold rounded-lg hover:bg-cla-gold/20 transition-colors">Submit a New Case</button>
                            <button onClick={() => setDashboardSubPage('find-lawyers')} className="w-full text-center px-4 py-3 bg-cla-surface dark:bg-cla-surface-dark text-cla-text dark:text-cla-text-dark font-bold rounded-lg border border-cla-border dark:border-cla-border-dark hover:bg-cla-bg dark:hover:bg-cla-bg-dark transition-colors">Find a Lawyer</button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};