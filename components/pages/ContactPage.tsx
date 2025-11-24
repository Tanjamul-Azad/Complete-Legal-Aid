
import React from 'react';
import type { Page } from '../../types';
import { BackButton } from '../BackButton';

export const ContactPage: React.FC<{ setCurrentPage: (page: Page) => void; }> = ({ setCurrentPage }) => (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
        <BackButton setCurrentPage={setCurrentPage} targetPage="home" />
        <h1 className="text-4xl font-bold text-cla-text dark:text-cla-text-dark mb-4">Contact Us</h1>
        <p className="text-lg text-cla-text-muted dark:text-cla-text-muted-dark mb-8">Have a question? We're here to help.</p>
        <form className="max-w-xl space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Name</label>
                <input type="text" id="name" className="mt-1 block w-full p-2 border-cla-border dark:border-cla-border-dark rounded-md bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Email</label>
                <input type="email" id="email" className="mt-1 block w-full p-2 border-cla-border dark:border-cla-border-dark rounded-md bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark" />
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-cla-text dark:text-cla-text-dark">Message</label>
                <textarea id="message" rows={4} className="mt-1 block w-full p-2 border-cla-border dark:border-cla-border-dark rounded-md bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark"></textarea>
            </div>
            <button type="submit" className="px-6 py-2 bg-cla-gold text-cla-text font-semibold rounded-lg hover:bg-cla-gold-darker">Send Message</button>
        </form>
    </div>
);