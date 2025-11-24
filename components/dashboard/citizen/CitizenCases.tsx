
import React, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import type { User, Case } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import { BriefcaseIcon, ChevronRightIcon, PlusCircleIcon, DocumentTextIcon, SearchIcon, ScaleIcon, BuildingOfficeIcon } from '../../icons';

const getCaseIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    const props = {
        className: "w-[22px] h-[22px] text-gray-500 dark:text-cla-gold",
        strokeWidth: 1.75
    };
    if (lowerTitle.includes('land') || lowerTitle.includes('rental') || lowerTitle.includes('property')) {
        return <BuildingOfficeIcon {...props} />;
    }
    if (lowerTitle.includes('bail') || lowerTitle.includes('custody')) {
        return <ScaleIcon {...props} />;
    }
    if (lowerTitle.includes('contract') || lowerTitle.includes('filing')) {
        return <DocumentTextIcon {...props} />;
    }
    return <BriefcaseIcon {...props} />;
};

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


export const CitizenCases: React.FC<{ onSelectCase: (caseId: string) => void; }> = ({ onSelectCase }) => {
    const context = useContext(AppContext);
    
    const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    const user = context?.user;
    const cases = context?.cases || [];
    const allUsers = context?.users || [];

    const userCases = useMemo(() => user ? cases.filter(c => c.clientId === user.id) : [], [cases, user]);

    const filteredAndSortedCases = useMemo(() => {
        let processedCases = [...userCases];
        
        if (debouncedSearchTerm.trim() !== '') {
            processedCases = processedCases.filter(c => 
                c.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        if (filter === 'active') {
            processedCases = processedCases.filter(c => c.status !== 'Resolved');
        } else if (filter === 'resolved') {
            processedCases = processedCases.filter(c => c.status === 'Resolved');
        }

        processedCases.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());

        return processedCases;
    }, [userCases, filter, debouncedSearchTerm]);

    if (!context || !user) return null;

    const caseStatusSteps: Case['status'][] = ['Submitted', 'In Review', 'Scheduled', 'Resolved'];
    
    const PremiumProgressStepper: React.FC<{ status: Case['status'] }> = ({ status }) => {
        const currentStepIndex = caseStatusSteps.indexOf(status);
        return (
            <div className="w-full pt-4">
                <div className="flex items-center">
                    {caseStatusSteps.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isActive = index === currentStepIndex;
                        const isUpcoming = index > currentStepIndex;

                        return (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300
                                        ${isActive ? 'bg-cla-gold border-cla-gold' : ''}
                                        ${isCompleted ? 'bg-gray-400 border-gray-400' : ''}
                                        ${isUpcoming ? 'bg-transparent border-gray-400' : ''}
                                    `}></div>
                                </div>
                                {index < caseStatusSteps.length - 1 && (
                                    <div className="flex-1 h-0.5 mx-1 bg-gradient-to-r from-gray-400 to-gray-300 dark:from-gray-500 dark:to-gray-700 relative">
                                        <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-cla-gold to-gray-400 dark:to-gray-500 transition-all duration-500 ease-out`}
                                            style={{ width: `${ index < currentStepIndex ? '100%' : '0%' }` }}
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
                <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark/70 mt-3">
                    Next action: Lawyer Review
                </p>
            </div>
        );
    };


    const FilterButton: React.FC<{ value: typeof filter; current: typeof filter; onClick: (value: typeof filter) => void; children: React.ReactNode }> = ({ value, current, onClick, children }) => (
        <button
            onClick={() => onClick(value)}
            className={`group relative px-4 py-2 text-sm rounded-full transition-colors duration-300
                ${current === value 
                    ? 'font-semibold text-cla-text dark:text-white bg-cla-gold/10 dark:bg-cla-gold/15' 
                    : 'text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-white'
                }`}
        >
            {children}
            <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-cla-gold transition-transform duration-300 ease-out origin-left ${current === value ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
        </button>
    );

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        const rect = button.getBoundingClientRect();
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add("ripple");

        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) ripple.remove();
        
        button.appendChild(circle);
    };

    const CaseCard: React.FC<{ caseData: Case; lawyer: User | undefined, animationDelay: string }> = ({ caseData, lawyer, animationDelay }) => (
        <div 
            className="group bg-white dark:bg-[#111111] rounded-2xl shadow-lg shadow-gray-500/5 dark:shadow-black/20 border border-cla-border dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-cla-gold/50 dark:hover:border-cla-gold/30 active:scale-[0.98] animate-fade-in-up"
            style={{ animationDelay }}
        >
            <div className="p-6 h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 flex-shrink-0 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center">
                                {getCaseIcon(caseData.title)}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[#444] dark:text-gray-200 pr-4">{caseData.title}</h3>
                                 <p className="text-sm text-cla-text-muted dark:text-[#CFCFCF] mt-1">
                                    {lawyer ? `with ${lawyer.name}` : 'Awaiting lawyer assignment'}
                                </p>
                            </div>
                        </div>
                        {lawyer && <img src={lawyer.avatar} alt={lawyer.name} className="w-12 h-12 rounded-full ring-2 ring-cla-border dark:ring-white/10 flex-shrink-0" />}
                    </div>
                    <PremiumProgressStepper status={caseData.status} />
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-cla-border dark:border-white/5">
                     <p className="text-xs text-cla-text-muted dark:text-cla-text-muted-dark">Submitted: {new Date(caseData.submittedDate).toLocaleDateString()}</p>
                    <button 
                        onClick={(e) => { createRipple(e); setTimeout(() => onSelectCase(caseData.id), 200); }} 
                        className="ripple-container px-4 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker transition-all text-sm transform hover:shadow-lg hover:shadow-cla-gold/20 dark:bg-gradient-to-br dark:from-cla-gold dark:to-cla-gold-darker dark:hover:shadow-cla-gold/30 dark:hover:brightness-110"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
    
    return (
        <div className="animate-fade-in">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4 animate-fade-in-up">
                 <div>
                    <h1 className="text-3xl font-semibold text-cla-text dark:text-cla-text-dark">My Cases</h1>
                    <p className="text-md text-cla-text-muted dark:text-cla-text-muted-dark mt-1">View and manage all your ongoing and past legal cases.</p>
                 </div>
                 <button onClick={() => alert('Submit New Case form would open here.')} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cla-gold text-cla-text font-bold rounded-lg hover:bg-cla-gold-darker transition-colors whitespace-nowrap">
                    <PlusCircleIcon className="w-5 h-5" />
                     Submit New Case
                 </button>
             </div>
             
             {userCases.length > 0 ? (
                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="p-1 bg-gray-100 dark:bg-cla-surface-dark rounded-full flex items-center gap-2 flex-wrap">
                            <FilterButton value="all" current={filter} onClick={setFilter}>All Cases</FilterButton>
                            <FilterButton value="active" current={filter} onClick={setFilter}>Active</FilterButton>
                            <FilterButton value="resolved" current={filter} onClick={setFilter}>Resolved</FilterButton>
                        </div>
                        
                        <div className="relative w-full sm:max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by case title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 p-2.5 border-cla-border dark:border-white/10 rounded-lg bg-[#F3F4F6] dark:bg-white/5 text-cla-text dark:text-cla-text-dark focus:ring-cla-gold focus:border-cla-gold placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 shadow-sm"
                            />
                        </div>
                    </div>

                    <div key={filter} className="grid md:grid-cols-2 gap-6">
                       {filteredAndSortedCases.length > 0 ? (
                           filteredAndSortedCases.map((c, index) => {
                                const lawyer = allUsers.find(u => u.id === c.lawyerId);
                                return <CaseCard key={c.id} caseData={c} lawyer={lawyer} animationDelay={`${150 + index * 80}ms`} />;
                            })
                        ) : (
                            <div className="text-center py-16 bg-cla-surface dark:bg-cla-surface-dark rounded-lg col-span-2">
                                 <p className="text-cla-text-muted dark:text-cla-text-muted-dark">No cases found matching your search criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
             ) : (
                <div className="text-center py-20 bg-cla-surface dark:bg-cla-surface-dark rounded-lg border-2 border-dashed border-cla-border dark:border-cla-border-dark animate-fade-in-up">
                    <DocumentTextIcon className="w-16 h-16 mx-auto text-cla-text-muted dark:text-cla-text-muted-dark" />
                    <h3 className="mt-4 text-xl font-semibold text-cla-text dark:text-cla-text-dark">No Cases Found</h3>
                    <p className="mt-1 text-cla-text-muted dark:text-cla-text-muted-dark">You haven't submitted any legal cases yet. <br /> Get started by submitting your first case.</p>
                     <button onClick={() => alert('Submit New Case form would open here.')} className="mt-6 flex items-center justify-center gap-2 mx-auto px-5 py-2.5 bg-cla-gold text-cla-text font-bold rounded-lg hover:bg-cla-gold-darker transition-colors">
                        <PlusCircleIcon className="w-5 h-5" />
                        Submit a Case
                    </button>
                </div>
             )}
        </div>
    );
};
