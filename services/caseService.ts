import { CASES } from '../constants';
import type { Case, User } from '../types';

// Simulate a database by creating a mutable copy.
let casesDB: Case[] = (() => {
    try {
        const stored = localStorage.getItem('cla-cases');
        return stored ? JSON.parse(stored) : [...CASES];
    } catch (error) { console.error("Failed to parse cases", error); return [...CASES]; }
})();


const syncToLocalStorage = () => {
    try {
        localStorage.setItem('cla-cases', JSON.stringify(casesDB));
    } catch (error) {
        console.error("Failed to save cases to localStorage", error);
    }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getUserCases = async (user: User): Promise<Case[]> => {
    await delay(400);
    switch (user.role) {
        case 'citizen':
            return casesDB.filter(c => c.clientId === user.id);
        case 'lawyer':
            return casesDB.filter(c => c.lawyerId === user.id);
        case 'admin':
            return [...casesDB];
        default:
            return [];
    }
};

const getCaseById = async (caseId: string): Promise<Case | null> => {
    await delay(200);
    return casesDB.find(c => c.id === caseId) || null;
};

const updateCase = async (caseId: string, data: Partial<Case>): Promise<Case | null> => {
    await delay(100);
    let updatedCase: Case | null = null;
    const caseIndex = casesDB.findIndex(c => c.id === caseId);

    if (caseIndex > -1) {
        casesDB[caseIndex] = { ...casesDB[caseIndex], ...data };
        updatedCase = casesDB[caseIndex];
        syncToLocalStorage();
    }
    return updatedCase;
};

export const caseService = {
    getUserCases,
    getCaseById,
    updateCase,
};