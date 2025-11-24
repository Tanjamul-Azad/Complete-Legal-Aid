
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { CitizenOverview } from './citizen/CitizenOverview';
import { LawyerOverview } from './lawyer/LawyerOverview';
import { AdminOverview } from './admin/AdminOverview';

export const DashboardOverview: React.FC = () => {
    const context = useContext(AppContext);
    if (!context || !context.user) return null;

    switch (context.user.role) {
        case 'lawyer':
            return <LawyerOverview />;
        case 'admin':
            return <AdminOverview />;
        case 'citizen':
        default:
            return <CitizenOverview />;
    }
};
