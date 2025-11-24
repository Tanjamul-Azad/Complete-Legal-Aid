import React, { createContext, ReactNode } from 'react';
import { useAppLogic } from '../hooks/useAppLogic';

// Create a context with a default value.
// The `| null` is important to allow an initial undefined state before the provider is mounted.
export const AppContext = createContext<ReturnType<typeof useAppLogic> | null>(null);

// Create a provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const appLogic = useAppLogic();

    return (
        <AppContext.Provider value={appLogic}>
            {children}
        </AppContext.Provider>
    );
};
