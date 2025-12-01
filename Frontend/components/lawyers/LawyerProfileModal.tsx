import React, { useState, useContext } from 'react';
import type { User, UserRole } from '../../types';
import { AppContext } from '../../context/AppContext';
import { StarIcon, CloseIcon } from '../icons';
import { appointmentService } from '../../services/appointmentService';

export const LawyerProfileModal: React.FC<{ lawyer: User, onClose: () => void }> = ({ lawyer, onClose }) => {
    const { user: currentUser, goToAuth, setChatTargetUser, setInboxOpen } = useContext(AppContext);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handleBooking = async () => {
        if (!currentUser) {
            alert("Please sign in or create an account to book an appointment.");
            goToAuth('login');
            onClose();
            return;
        }
        if (!selectedDate || !selectedTime) {
            alert("Please select a date and time.");
            return;
        }

        const appointment = await appointmentService.createAppointment({
            clientId: currentUser.id,
            lawyerId: lawyer.profileId || lawyer.id, // Use profileId for LawyerProfile ID, fallback to id
            date: selectedDate,
            time: selectedTime,
            duration: 60,
            mode: lawyer.communicationMode === 'Phone' ? 'Online' : 'In-Person',
            status: 'Pending',
            title: `Consultation with ${lawyer.name}`
        });

        if (appointment) {
            alert(`Appointment with ${lawyer.name} on ${selectedDate} at ${selectedTime} has been requested.`);
            onClose();
        } else {
            alert("Failed to book appointment. Please try again.");
        }
    };

    const availableDates = Object.keys(lawyer.availability || {});

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const renderCalendar = () => {
        const daysArray = [];
        for (let i = 0; i < firstDay; i++) {
            daysArray.push(<div key={`empty-${i}`} className="p-2"></div>);
        }
        for (let d = 1; d <= days; d++) {
            const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d).toDateString();
            // Format date as YYYY-MM-DD for comparison with availability keys
            const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            const isAvailable = availableDates.includes(formattedDate);
            const isSelected = selectedDate === formattedDate;

            daysArray.push(
                <button
                    key={d}
                    disabled={!isAvailable}
                    onClick={() => { setSelectedDate(formattedDate); setSelectedTime(null); }}
                    className={`p-2 rounded-full w-8 h-8 flex items-center justify-center text-sm transition-all
                        ${isSelected ? 'bg-cla-gold text-white font-bold' : ''}
                        ${!isSelected && isAvailable ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer font-medium' : ''}
                        ${!isSelected && !isAvailable ? 'text-gray-300 cursor-not-allowed' : ''}
                    `}
                >
                    {d}
                </button>
            );
        }
        return daysArray;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] animate-modal-fade-in p-4">
            <div className="bg-cla-surface dark:bg-cla-surface-dark rounded-lg shadow-modal-light dark:shadow-modal-dark w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-modal-scale-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark z-10 p-2 rounded-full hover:bg-cla-border dark:hover:bg-cla-border-dark">
                    <CloseIcon />
                </button>
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        {/* Left Column */}
                        <div className="md:col-span-1 p-8 text-center border-r-0 md:border-r border-cla-border dark:border-white/5">
                            <img src={lawyer.avatar} alt={lawyer.name} className="w-32 h-32 rounded-full mx-auto object-cover mb-4 ring-4 ring-cla-gold/20" />
                            <h2 className="text-2xl font-bold text-cla-text dark:text-cla-text-dark">{lawyer.name}</h2>
                            <div className="flex items-center justify-center mt-2">
                                <StarIcon className="w-5 h-5 text-cla-gold" />
                                <span className="ml-1 font-bold text-cla-text dark:text-cla-text-dark">{lawyer.rating} ({lawyer.reviews?.length || 0} reviews)</span>
                            </div>
                            <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-1">{lawyer.location}</p>
                            <p className="mt-4 text-lg font-bold text-cla-gold-darker dark:text-cla-gold">{lawyer.fees} BDT / consultation</p>
                            <button className="mt-4 text-sm text-cla-gold hover:underline">Open Full Profile Page</button>
                        </div>

                        {/* Right Column */}
                        <div className="md:col-span-2 p-8">
                            <div>
                                <h3 className="font-bold text-lg text-cla-text dark:text-cla-text-dark">Biography</h3>
                                <p className="text-cla-text-muted dark:text-cla-text-muted-dark mt-1 text-sm">{lawyer.bio}</p>
                            </div>

                            <div className="border-t border-cla-border dark:border-white/5 my-6"></div>

                            <div>
                                <h3 className="font-bold text-lg text-cla-text dark:text-cla-text-dark mb-3">Reviews ({lawyer.reviews?.length || 0})</h3>
                                <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {lawyer.reviews && lawyer.reviews.length > 0 ? (
                                        lawyer.reviews.map((review, index) => (
                                            <div key={index} className="border-b border-cla-border dark:border-white/5 pb-4 last:border-b-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-cla-text dark:text-cla-text-dark">{review.reviewerName}</p>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i}>
                                                                <StarIcon className={`w-4 h-4 ${i < review.rating ? 'text-cla-gold' : 'text-gray-400 dark:text-gray-600'}`} isFilled={i < review.rating} />
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark mt-1">{review.comment}</p>
                                                <p className="text-xs text-cla-text-muted/70 dark:text-cla-text-muted-dark/70 mt-2 text-right">{new Date(review.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-cla-text-muted dark:text-cla-text-muted-dark">No reviews yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-cla-border dark:border-white/5 my-6"></div>

                            <div>
                                <h3 className="font-bold text-lg text-cla-text dark:text-cla-text-dark">Schedule Appointment</h3>
                                <div className="space-y-4 mt-2">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Select Date</label>
                                            <div className="flex gap-2">
                                                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-1 hover:bg-gray-100 rounded">&lt;</button>
                                                <span className="text-sm font-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                                                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-1 hover:bg-gray-100 rounded">&gt;</button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-xs font-bold text-gray-400">{d}</span>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {renderCalendar()}
                                        </div>
                                    </div>
                                    {selectedDate && lawyer.availability?.[selectedDate] && (
                                        <div>
                                            <label className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Select Time</label>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                                                {lawyer.availability[selectedDate]?.map(time => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`px-3 py-2 rounded-lg text-sm text-center border transition-all duration-200 shadow-sm transform active:scale-105
                                                            ${selectedTime === time
                                                                ? 'bg-cla-gold text-white font-bold border-cla-gold shadow-lg shadow-cla-gold/20'
                                                                : 'bg-cla-surface dark:bg-cla-bg-dark hover:border-cla-gold text-cla-text dark:text-cla-text-dark border-cla-border dark:border-cla-border-dark hover:shadow-lg hover:shadow-cla-gold/10 hover:-translate-y-0.5 dark:hover:bg-cla-gold/5'
                                                            }`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-cla-border dark:border-white/5 flex-shrink-0 flex gap-4">
                    <button
                        onClick={() => {
                            if (!currentUser) {
                                alert("Please sign in to message this lawyer.");
                                goToAuth('login');
                                onClose();
                                return;
                            }
                            setChatTargetUser(lawyer);
                            setInboxOpen(true);
                            onClose();
                        }}
                        className="flex-1 py-3 bg-white dark:bg-white/5 text-cla-text dark:text-white font-bold rounded-lg border border-cla-border dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-cla-gold/50 dark:hover:border-cla-gold/50 transition-all duration-200"
                    >
                        Message
                    </button>
                    <button onClick={handleBooking} disabled={!selectedTime && !!currentUser} className="flex-[2] py-3 bg-cla-gold text-cla-text font-bold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors">
                        {!currentUser ? 'Sign In to Book' : selectedTime ? `Request Appointment at ${selectedTime}` : 'Select a Time Slot'}
                    </button>
                </div>
            </div>
        </div>
    );
};
