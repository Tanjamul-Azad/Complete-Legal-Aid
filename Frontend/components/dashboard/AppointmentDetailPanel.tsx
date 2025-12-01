import React, { useContext, useState } from 'react';
import type { Appointment } from '../../types';
import { AppContext } from '../../context/AppContext';
import { CloseIcon, CalendarIcon, ClockIcon, GlobeAltIcon, BuildingOfficeIcon, StarIcon, LinkIcon, BriefcaseIcon, CheckCircleIcon, XCircleIcon } from '../icons';
import { appointmentService } from '../../services/appointmentService';

interface AppointmentDetailPanelProps {
    appointment: Appointment;
    onClose: () => void;
}

export const AppointmentDetailPanel: React.FC<AppointmentDetailPanelProps> = ({ appointment, onClose }) => {
    const context = useContext(AppContext);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!context) return null;

    const { user, users: allUsers, setDashboardSubPage, setSelectedCaseId, setToast, handleUpdateAppointment } = context;
    const isLawyer = user?.role === 'lawyer';
    const isPending = appointment.status === 'Pending';

    const lawyer = allUsers.find(u => u.id === appointment.lawyerId);
    const client = allUsers.find(u => u.id === appointment.clientId);

    const getStatusChipClasses = (status: Appointment['status']) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'Pending': return 'bg-cla-gold/10 text-cla-gold-darker dark:bg-cla-gold/20 dark:text-cla-gold-light';
            case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const handleViewCase = () => {
        if (appointment.caseId) {
            setSelectedCaseId(appointment.caseId);
            setDashboardSubPage('cases');
            onClose();
        }
    };

    const handleApprove = async () => {
        setIsProcessing(true);
        const updated = await appointmentService.updateAppointment(appointment.id, { status: 'Confirmed' });
        if (updated) {
            handleUpdateAppointment(appointment.id, { status: 'Confirmed' });
            setToast({ message: 'Appointment confirmed successfully!', type: 'success' });
            onClose();
        } else {
            setToast({ message: 'Failed to confirm appointment.', type: 'error' });
        }
        setIsProcessing(false);
    };

    const handleReject = async () => {
        if (!confirm('Are you sure you want to reject this appointment?')) return;

        setIsProcessing(true);
        const updated = await appointmentService.updateAppointment(appointment.id, { status: 'Cancelled' });
        if (updated) {
            handleUpdateAppointment(appointment.id, { status: 'Cancelled' });
            setToast({ message: 'Appointment rejected.', type: 'success' });
            onClose();
        } else {
            setToast({ message: 'Failed to reject appointment.', type: 'error' });
        }
        setIsProcessing(false);
    };

    const handleReschedule = () => {
        setToast({ message: 'Reschedule feature coming soon!', type: 'success' });
        // TODO: Implement reschedule UI with date/time picker
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        setIsProcessing(true);
        const updated = await appointmentService.updateAppointment(appointment.id, { status: 'Cancelled' });
        if (updated) {
            handleUpdateAppointment(appointment.id, { status: 'Cancelled' });
            setToast({ message: 'Appointment cancelled.', type: 'success' });
            onClose();
        } else {
            setToast({ message: 'Failed to cancel appointment.', type: 'error' });
        }
        setIsProcessing(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={onClose}></div>
            <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-cla-bg dark:bg-cla-bg-dark shadow-2xl z-50 flex flex-col animate-slide-in-right">
                <header className="p-4 flex justify-between items-center border-b border-cla-border dark:border-cla-border-dark flex-shrink-0">
                    <h3 className="font-bold text-lg text-cla-text dark:text-cla-text-dark">Appointment Details</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-cla-text-muted dark:text-cla-text-muted-dark hover:bg-cla-surface dark:hover:bg-cla-surface-dark">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Lawyer/Client Info */}
                    {(isLawyer ? client : lawyer) && (
                        <div className="bg-cla-surface dark:bg-cla-surface-dark p-4 rounded-xl border border-cla-border dark:border-cla-border-dark">
                            <div className="flex items-center gap-4">
                                <img src={(isLawyer ? client : lawyer)!.avatar} alt={(isLawyer ? client : lawyer)!.name} className="w-20 h-20 rounded-full object-cover" />
                                <div>
                                    <h4 className="text-xl font-bold text-cla-text dark:text-white">{(isLawyer ? client : lawyer)!.name}</h4>
                                    <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">
                                        {isLawyer ? 'Client' : (lawyer?.specializations?.join(', ') || 'Lawyer')}
                                    </p>
                                    {!isLawyer && lawyer && (
                                        <div className="flex items-center mt-1">
                                            <StarIcon className="w-4 h-4 text-cla-gold" />
                                            <span className="ml-1 text-sm font-semibold">{lawyer.rating} ({lawyer.reviews?.length} reviews)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appointment Details */}
                    <div className="bg-cla-surface dark:bg-cla-surface-dark p-4 rounded-xl border border-cla-border dark:border-cla-border-dark space-y-3">
                        <div className="flex justify-between items-center">
                            <h5 className="font-semibold text-cla-text dark:text-white">Appointment Info</h5>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusChipClasses(appointment.status)}`}>
                                {appointment.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm"><CalendarIcon className="w-5 h-5 text-cla-text-muted dark:text-cla-text-muted-dark" /> <span className="text-cla-text dark:text-white">{new Date(appointment.date).toDateString()}</span></div>
                        <div className="flex items-center gap-3 text-sm"><ClockIcon className="w-5 h-5 text-cla-text-muted dark:text-cla-text-muted-dark" /> <span className="text-cla-text dark:text-white">{appointment.time}</span></div>
                        <div className="flex items-center gap-3 text-sm">
                            {appointment.mode === 'Online' ? <GlobeAltIcon className="w-5 h-5 text-cla-text-muted dark:text-cla-text-muted-dark" /> : <BuildingOfficeIcon className="w-5 h-5 text-cla-text-muted dark:text-cla-text-muted-dark" />}
                            <span className="text-cla-text dark:text-white">{appointment.mode}</span>
                        </div>
                        {appointment.mode === 'Online' && appointment.status === 'Confirmed' && (
                            <a href="#" className="flex items-center gap-3 text-sm text-blue-500 hover:underline pt-2 border-t border-cla-border dark:border-cla-border-dark mt-3">
                                <LinkIcon className="w-5 h-5" /> Join Meeting
                            </a>
                        )}
                    </div>

                    {/* Appointment Notes */}
                    <div className="bg-cla-surface dark:bg-cla-surface-dark p-4 rounded-xl border border-cla-border dark:border-cla-border-dark">
                        <h5 className="font-semibold text-cla-text dark:text-white mb-2">Appointment Notes</h5>
                        <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">{appointment.notes || "No notes for this appointment."}</p>
                    </div>

                    {/* Related Case */}
                    {appointment.caseId && (
                        <div className="bg-cla-surface dark:bg-cla-surface-dark p-4 rounded-xl border border-cla-border dark:border-cla-border-dark">
                            <h5 className="font-semibold text-cla-text dark:text-white mb-2">Related Case</h5>
                            <button onClick={handleViewCase} className="w-full text-left p-3 rounded-lg hover:bg-cla-bg dark:hover:bg-cla-bg-dark flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-cla-gold"><BriefcaseIcon className="w-5 h-5" /> View Related Case File</span>
                            </button>
                        </div>
                    )}
                </div>

                <footer className="p-4 border-t border-cla-border dark:border-cla-border-dark flex-shrink-0">
                    {isLawyer && isPending ? (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                Approve
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isProcessing}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <XCircleIcon className="w-5 h-5" />
                                Reject
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleReschedule}
                                disabled={isProcessing || appointment.status === 'Cancelled'}
                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-cla-surface dark:bg-cla-surface-dark hover:bg-cla-border dark:hover:bg-cla-border-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Reschedule
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isProcessing || appointment.status === 'Cancelled'}
                                className="px-4 py-2 text-sm font-semibold rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    )}
                </footer>
            </div>
        </>
    );
};