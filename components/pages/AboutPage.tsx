
import React from 'react';
import type { Page } from '../../types';
import { BackButton } from '../BackButton';

export const AboutPage: React.FC<{ setCurrentPage: (page: Page) => void; }> = ({ setCurrentPage }) => (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
        <BackButton setCurrentPage={setCurrentPage} targetPage="home" />
        <div className="text-center">
            <h1 className="text-4xl font-bold text-cla-text dark:text-cla-text-dark mb-4">About Complete Legal Aid (CLA)</h1>
            <p className="text-lg text-cla-text-muted dark:text-cla-text-muted-dark mb-8 max-w-3xl mx-auto">We are dedicated to bridging the gap between citizens and the legal system in Bangladesh, leveraging technology to make justice accessible, transparent, and affordable for all.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-cla-bg dark:bg-cla-surface-dark p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold text-cla-gold mb-2">Our Mission</h3>
                <p className="text-cla-text-muted dark:text-cla-text-muted-dark">To empower every citizen with the legal resources and support they need to navigate the complexities of the judicial system with confidence.</p>
            </div>
            <div className="bg-cla-bg dark:bg-cla-surface-dark p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold text-cla-gold mb-2">Our Vision</h3>
                <p className="text-cla-text-muted dark:text-cla-text-muted-dark">To create a digitally-integrated legal ecosystem in Bangladesh where finding legal help is as simple as a few clicks.</p>
            </div>
            <div className="bg-cla-bg dark:bg-cla-surface-dark p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold text-cla-gold mb-2">Our Values</h3>
                <p className="text-cla-text-muted dark:text-cla-text-muted-dark">Integrity, Accessibility, and Innovation. We believe in a justice system that is fair and open to everyone, regardless of their background.</p>
            </div>
        </div>
    </div>
);