import React, { useState, useMemo, useContext, useEffect } from 'react';
import type { User, UserRole } from '../../../types';
import { AppContext } from '../../../context/AppContext';
import { ALL_USERS } from '../../../constants';
import { SearchIcon, BriefcaseIcon, MapPinIcon } from '../../icons';
import { LawyerProfileCard } from '../../lawyers/LawyerProfileCard';
import { LawyerProfileModal } from '../../lawyers/LawyerProfileModal';

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

const EmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
    <div className="text-center py-20 bg-cla-surface dark:bg-cla-surface-dark rounded-lg border-2 border-dashed border-cla-border dark:border-cla-border-dark col-span-1 md:col-span-2 xl:col-span-3">
        <SearchIcon className="w-16 h-16 mx-auto text-cla-text-muted dark:text-cla-text-muted-dark opacity-50" />
        <h3 className="mt-4 text-xl font-semibold text-cla-text dark:text-cla-text-dark">Couldn’t find a match.</h3>
        <p className="mt-1 text-cla-text-muted dark:text-cla-text-muted-dark">Try removing some filters to see more results.</p>
        <button onClick={onReset} className="mt-6 px-5 py-2.5 bg-cla-gold text-cla-text font-bold rounded-lg hover:bg-cla-gold-darker transition-colors">
            Reset Filters
        </button>
    </div>
);

export const CitizenFindLawyers: React.FC = () => {
    const { user: currentUser, goToAuth } = useContext(AppContext);
    const [selectedLawyer, setSelectedLawyer] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [isFiltering, setIsFiltering] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const verifiedLawyers = useMemo(() => ALL_USERS.filter(u => u.role === 'lawyer' && u.verificationStatus === 'Verified'), []);

    const allSpecializations = useMemo(() => [...new Set(verifiedLawyers.flatMap(l => l.specializations || []))].sort(), [verifiedLawyers]);
    const allLocations = useMemo(() => [...new Set(verifiedLawyers.map(l => l.location || ''))].sort(), [verifiedLawyers]);

    const filteredLawyers = useMemo(() => {
        return verifiedLawyers.filter(lawyer => {
            const nameMatch = lawyer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const specMatch = specializationFilter === '' || lawyer.specializations?.includes(specializationFilter);
            const locMatch = locationFilter === '' || lawyer.location === locationFilter;
            return nameMatch && specMatch && locMatch;
        });
    }, [debouncedSearchTerm, specializationFilter, locationFilter, verifiedLawyers]);
    
    // Trigger animations on filter change
    useEffect(() => {
        setIsFiltering(true);
        const timer = setTimeout(() => setIsFiltering(false), 150); // duration of fade-out
        return () => clearTimeout(timer);
    }, [debouncedSearchTerm, specializationFilter, locationFilter]);


    const clearFilters = () => {
        setSearchTerm('');
        setSpecializationFilter('');
        setLocationFilter('');
    };

    return (
        <div className="animate-fade-in bg-cla-bg dark:bg-[#0E0E0E] min-h-full -m-8 p-8">
            <div className="animate-fade-in-up">
                <h1 className="text-3xl font-bold text-cla-text dark:text-white mb-2">Find Your Legal Expert</h1>
                <p className="text-md text-cla-text-muted dark:text-[#CFCFCF] mb-8">Search our network of verified lawyers in Bangladesh.</p>
            </div>

            <div className="bg-cla-surface dark:bg-[#111111] p-4 rounded-lg shadow-sm dark:border border-white/5 mb-8 sticky top-[88px] z-20 animate-fade-in-up" style={{animationDelay: '100ms'}}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                         <label htmlFor="search" className="flex items-center gap-2 text-sm font-medium text-cla-text dark:text-white mb-1">
                            <SearchIcon className="h-[18px] w-[18px] text-cla-gold" />
                            Search by name
                        </label>
                        <input
                            type="text"
                            id="search"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="block w-full p-2.5 border rounded-xl bg-[#F7F7F7] dark:bg-white/5 border-[#E5E5E5] dark:border-white/10 text-cla-text dark:text-white placeholder:text-[#A0A0A0] dark:placeholder:text-white/40 focus:ring-cla-gold focus:border-cla-gold transition-all"
                            placeholder="e.g., Anisul Huq"
                        />
                    </div>
                     <div>
                        <label htmlFor="specialization" className="flex items-center gap-2 text-sm font-medium text-cla-text dark:text-white mb-1">
                            <BriefcaseIcon className="h-5 w-5 text-cla-gold" />
                            Specialization
                        </label>
                        <select id="specialization" value={specializationFilter} onChange={e => setSpecializationFilter(e.target.value)} className="block w-full p-2.5 border rounded-xl bg-white dark:bg-[#111111] border-[#E5E5E5] dark:border-white/10 text-cla-text dark:text-white focus:ring-cla-gold focus:border-cla-gold transition-all appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23F59E0B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.7rem center'}}>
                            <option value="">All Specializations</option>
                            {allSpecializations.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-cla-text dark:text-white mb-1">
                            <MapPinIcon className="h-5 w-5 text-cla-gold" />
                            Location
                        </label>
                        <select id="location" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="block w-full p-2.5 border rounded-xl bg-white dark:bg-[#111111] border-[#E5E5E5] dark:border-white/10 text-cla-text dark:text-white focus:ring-cla-gold focus:border-cla-gold transition-all appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23F59E0B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.7rem center'}}>
                            <option value="">All Locations</option>
                            {allLocations.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
                {!isFiltering && (filteredLawyers.length > 0 ? (
                    filteredLawyers.map((lawyer, index) => 
                        <LawyerProfileCard 
                            key={lawyer.id} 
                            user={lawyer} 
                            onSelect={() => setSelectedLawyer(lawyer)}
                            animationDelay={`${100 + index * 60}ms`}
                        />
                    )
                ) : (
                    <EmptyState onReset={clearFilters} />
                ))}
            </div>

            {selectedLawyer && <LawyerProfileModal lawyer={selectedLawyer} onClose={() => setSelectedLawyer(null)} />}
        </div>
    );
};
