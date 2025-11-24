import React, { useState, useMemo, useContext } from 'react';
import type { User, Appointment } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import { CalendarIcon, StarIcon, PlusCircleIcon, ClockIcon, GlobeAltIcon, BuildingOfficeIcon } from '../../icons';
import { ConfirmationModal } from '../../ui/ConfirmationModal';
import { AppointmentDetailPanel } from '../AppointmentDetailPanel';

const getStatusChipClasses = (status: Appointment['status']) => {
    switch (status) {
        case 'Confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        case 'Pending': return 'bg-cla-gold/10 text-cla-gold-darker dark:bg-cla-gold/20 dark:text-cla-gold-light';
        case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

const AppointmentCard: React.FC<{ appointment: Appointment, lawyer?: User, animationDelay: string, onCardClick: () => void }> = ({ appointment, lawyer, animationDelay, onCardClick }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { setReviewTarget, handleUpdateAppointment } = context;

    const [isConfirmCancelOpen, setConfirmCancelOpen] = useState(false);
    const isPast = new Date(appointment.date) < new Date();
    const modeIcon = appointment.mode === 'Online' 
        ? <GlobeAltIcon className="w-4 h-4" /> 
        : <BuildingOfficeIcon className="w-4 h-4" strokeWidth={2}/>;

    const handleConfirmCancel = () => {
        handleUpdateAppointment(appointment.id, { status: 'Cancelled' });
        setConfirmCancelOpen(false);
    };

    return (
        <div 
            onClick={onCardClick}
            className="group cursor-pointer bg-white dark:bg-[#111111] rounded-2xl shadow-lg shadow-gray-500/5 dark:shadow-black/20 border border-cla-border dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-cla-gold/50 dark:hover:border-cla-gold/30 active:scale-[0.98] animate-fade-in-up"
            style={{ animationDelay }}
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <img src={lawyer?.avatar} alt={lawyer?.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100 dark:ring-white/10" />
                        <div>
                            <p className="font-bold text-lg text-cla-text dark:text-cla-text-dark">{lawyer?.name || 'Unknown Lawyer'}</p>
                            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">{lawyer?.specializations?.[0]}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChipClasses(appointment.status)}`}>
                        {appointment.status}
                    </span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-cla-border dark:border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-cla-text-muted dark:text-cla-text-muted-dark">
                        <div className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> <span className="font-medium text-cla-text dark:text-cla-text-dark">{new Date(appointment.date).toDateString()}</span></div>
                        <div className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> {appointment.time}</div>
                        <div className="flex items-center gap-1.5">{modeIcon} {appointment.mode}</div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {isPast && appointment.status === 'Confirmed' && !appointment.reviewed && lawyer && (
                            <button
                                onClick={() => setReviewTarget({ lawyerId: lawyer.id, source: { type: 'appointment', id: appointment.id } })}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-cla-gold bg-cla-gold/10 hover:bg-cla-gold/20 transition-colors flex items-center gap-1.5"
                            >
                                <StarIcon className="w-4 h-4"/> Rate Experience
                            </button>
                        )}
                        {!isPast && appointment.status !== 'Cancelled' && (
                            <>
                                <button onClick={() => alert('This would open a rescheduling modal.')} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cla-surface dark:bg-cla-bg-dark hover:bg-cla-border dark:hover:bg-cla-border-dark transition-colors">Reschedule</button>
                                <button onClick={() => setConfirmCancelOpen(true)} title="Cancel appointment" className="px-3 py-1.5 text-xs font-semibold rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors">Cancel</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isConfirmCancelOpen}
                onClose={() => setConfirmCancelOpen(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel Appointment"
                message={`Are you sure you want to cancel your appointment with ${lawyer?.name || 'this lawyer'} on ${new Date(appointment.date).toDateString()}?`}
                confirmText="Yes, Cancel"
                variant="destructive"
            />
        </div>
    );
};


export const CitizenAppointments: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { user, appointments, users: allUsers, setDashboardSubPage } = context;

    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const userAppointments = useMemo(() => {
        if (!user) return { upcoming: [], past: [] };
        
        const sorted = appointments
            .filter(a => a.clientId === user.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const upcoming = sorted.filter(a => new Date(a.date) >= now);
        const past = sorted.filter(a => new Date(a.date) < now).reverse();

        return { upcoming, past };
    }, [appointments, user]);

    const displayedAppointments = activeTab === 'upcoming' ? userAppointments.upcoming : userAppointments.past;

    if (!user) return null;

    const TabButton: React.FC<{ tabId: 'upcoming' | 'past', count: number, children: React.ReactNode }> = ({ tabId, count, children }) => (
        <button 
            onClick={() => setActiveTab(tabId)} 
            className={`group relative whitespace-nowrap py-4 px-1 text-sm font-semibold transition-colors ${activeTab === tabId ? 'text-cla-gold' : 'text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark'}`}
        >
            <div className="flex items-center gap-2">
                {children}
                <span className={`px-2 py-0.5 text-xs rounded-full transition-colors ${activeTab === tabId ? 'bg-cla-gold/20 text-cla-gold' : 'bg-gray-200 dark:bg-cla-border-dark text-cla-text-muted dark:text-cla-text-muted-dark group-hover:bg-gray-300 dark:group-hover:bg-cla-bg-dark'}`}>
                    {count}
                </span>
            </div>
            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-cla-gold origin-center transition-transform duration-300 ease-out ${activeTab === tabId ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
        </button>
    );

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-semibold text-cla-text dark:text-cla-text-dark mb-2">Appointments</h1>
            <p className="text-md text-cla-text-muted dark:text-cla-text-muted-dark mb-6">Manage your upcoming and past consultations.</p>

            <div className="border-b border-cla-border dark:border-cla-border-dark mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton tabId="upcoming" count={userAppointments.upcoming.length}>Upcoming</TabButton>
                    <TabButton tabId="past" count={userAppointments.past.length}>Past</TabButton>
                </nav>
            </div>
            
            <div className="space-y-5">
                {displayedAppointments.length > 0 ? (
                    displayedAppointments.map((appt, index) => {
                        const lawyer = allUsers.find(u => u.id === appt.lawyerId);
                        return <AppointmentCard key={appt.id} appointment={appt} lawyer={lawyer} animationDelay={`${index * 60}ms`} onCardClick={() => setSelectedAppointment(appt)}/>;
                    })
                ) : (
                    <div className="text-center py-20 bg-cla-surface dark:bg-cla-surface-dark rounded-lg border-2 border-dashed border-cla-border dark:border-cla-border-dark animate-fade-in-up">
                        <CalendarIcon className="w-16 h-16 mx-auto text-cla-text-muted dark:text-cla-text-muted-dark animate-subtle-pulse" />
                        <h3 className="mt-4 text-xl font-semibold text-cla-text dark:text-cla-text-dark">No {activeTab} appointments</h3>
                        <p className="mt-1 text-cla-text-muted dark:text-cla-text-muted-dark">Find and book consultations with verified legal experts.</p>
                        <p className="mt-1 text-xs text-cla-text-muted dark:text-cla-text-muted-dark">Need help? Connect with verified lawyers.</p>
                         <button 
                            onClick={() => setDashboardSubPage('find-lawyers')} 
                            className="mt-6 flex items-center justify-center gap-2 mx-auto px-5 py-2.5 bg-cla-gold text-cla-text font-bold rounded-lg hover:bg-cla-gold-darker transition-all duration-300 transform hover:scale-105 active:scale-95"
                         >
                            <PlusCircleIcon className="w-5 h-5" />
                            Book an Appointment
                        </button>
                    </div>
                )}
            </div>
            {selectedAppointment && (
                <AppointmentDetailPanel 
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                />
            )}
        </div>
    );
};