
import React, { useState, useMemo, useContext } from 'react';
import type { User, Appointment } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import { CalendarIcon, PlusCircleIcon, ClockIcon, GlobeAltIcon, BuildingOfficeIcon, ChevronRightIcon, ChevronDownIcon } from '../../icons';
import { AppointmentDetailPanel } from '../AppointmentDetailPanel';

const getEventColor = (type: Appointment['type']) => {
    switch (type) {
        case 'Hearing': return 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300';
        case 'Consultation': return 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300';
        case 'Deadline': return 'bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300';
        case 'Meeting': return 'bg-cla-gold/10 border-cla-gold/20 text-cla-gold-darker dark:bg-cla-gold/20 dark:border-cla-gold/30 dark:text-cla-gold';
        default: return 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300';
    }
};

// Simple Chevron Left implementation for this component
const ChevronLeftIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

export const LawyerAppointments: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { user, appointments, users: allUsers } = context;

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Month Navigation
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Calendar Logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

    const monthAppointments = useMemo(() => {
        if (!user) return [];
        return appointments.filter(a => {
            const apptDate = new Date(a.date);
            return (
                a.lawyerId === user.id &&
                apptDate.getMonth() === currentDate.getMonth() &&
                apptDate.getFullYear() === currentDate.getFullYear()
            );
        });
    }, [appointments, user, currentDate]);

    const getAppointmentsForDay = (day: number) => {
        return monthAppointments.filter(a => new Date(a.date).getDate() === day).sort((a, b) => a.time.localeCompare(b.time));
    };

    // Generate Grid Cells
    const gridCells = [];
    // Padding for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        gridCells.push(<div key={`empty-${i}`} className="min-h-[120px] border-b border-r border-cla-border dark:border-cla-border-dark/50 bg-gray-50/30 dark:bg-white/[0.02]"></div>);
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const dayAppointments = getAppointmentsForDay(d);
        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toDateString();

        gridCells.push(
            <div key={`day-${d}`} className={`min-h-[120px] border-b border-r border-cla-border dark:border-cla-border-dark/50 p-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${isToday ? 'bg-cla-gold/5 dark:bg-cla-gold/10' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-cla-gold text-white shadow-md' : 'text-cla-text-muted dark:text-cla-text-muted-dark'}`}>
                        {d}
                    </span>
                </div>
                <div className="space-y-1">
                    {dayAppointments.map(appt => (
                        <button
                            key={appt.id}
                            onClick={() => setSelectedAppointment(appt)}
                            className={`w-full text-left px-2 py-1 rounded-md text-xs font-medium border border-transparent truncate transition-all hover:scale-[1.02] hover:shadow-sm ${getEventColor(appt.type)}`}
                            title={`${appt.time} - ${appt.title}`}
                        >
                            <span className="opacity-70 mr-1">{appt.time}</span>
                            {appt.title || 'Appointment'}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="animate-fade-in h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-cla-text dark:text-cla-text-dark">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h1>
                    <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">Manage your schedule and hearings.</p>
                </div>
                <div className="flex items-center gap-4 bg-cla-surface dark:bg-cla-surface-dark p-1.5 rounded-xl border border-cla-border dark:border-cla-border-dark shadow-sm">
                     <button onClick={prevMonth} className="p-2 hover:bg-cla-bg dark:hover:bg-cla-bg-dark rounded-lg text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-white transition-colors">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button onClick={goToToday} className="px-4 py-1.5 text-sm font-semibold bg-cla-bg dark:bg-cla-bg-dark rounded-lg border border-cla-border dark:border-cla-border-dark hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                        Today
                    </button>
                     <button onClick={nextMonth} className="p-2 hover:bg-cla-bg dark:hover:bg-cla-bg-dark rounded-lg text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-white transition-colors">
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
                 <button onClick={() => {}} className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-cla-gold text-cla-text font-bold rounded-lg hover:bg-cla-gold-darker transition-colors shadow-lg shadow-cla-gold/20">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>New Event</span>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 bg-cla-surface dark:bg-cla-surface-dark rounded-xl border border-cla-border dark:border-cla-border-dark overflow-hidden shadow-sm flex flex-col">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-cla-border dark:border-cla-border-dark bg-gray-50/50 dark:bg-white/[0.02]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-3 text-center text-sm font-semibold text-cla-text-muted dark:text-cla-text-muted-dark uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>
                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-fr flex-1 overflow-y-auto custom-scrollbar">
                    {gridCells}
                </div>
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
