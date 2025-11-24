import React, { useState, useContext } from 'react';
import type { User, UserRole } from '../../types';
import { AppContext } from '../../context/AppContext';
import { StarIcon, CloseIcon } from '../icons';

export const LawyerProfileModal: React.FC<{ lawyer: User, onClose: () => void }> = ({ lawyer, onClose }) => {
    const { user: currentUser, goToAuth } = useContext(AppContext);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const handleBooking = () => {
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
        alert(`Appointment with ${lawyer.name} on ${selectedDate} at ${selectedTime} has been requested.`);
        onClose();
    };
    
    const availableDates = Object.keys(lawyer.availability || {}).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());

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
                                        <label className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Select Date</label>
                                        <select onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(null); }} className="mt-1 block w-full p-2 border-cla-border dark:border-cla-border-dark rounded-md bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark">
                                            <option value="">Select a date</option>
                                            {availableDates.map(date => <option key={date} value={date}>{new Date(date).toDateString()}</option>)}
                                        </select>
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
                                                                : 'bg-cla-surface dark:bg-cla-bg-dark hover:border-cla-gold text-cla-text dark:text-cla-text-dark border-cla-border dark:border-cla-border-dark hover:shadow-md hover:-translate-y-0.5'
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
                <div className="p-6 border-t border-cla-border dark:border-white/5 flex-shrink-0">
                    <button onClick={handleBooking} disabled={!selectedTime && !!currentUser} className="w-full py-3 bg-cla-gold text-cla-text font-bold rounded-lg hover:bg-cla-gold-darker disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors">
                        {!currentUser ? 'Sign In to Book' : selectedTime ? `Request Appointment at ${selectedTime}` : 'Select a Time Slot'}
                    </button>
                </div>
            </div>
        </div>
    );
};
