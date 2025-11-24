import React from 'react';
import type { Page } from '../../types';
import { BackButton } from '../BackButton';

export const LegalPage: React.FC<{
  setCurrentPage: (page: Page) => void;
  title: string;
  content: string;
}> = ({ setCurrentPage, title, content }) => (
  <div className="container mx-auto px-4 py-12 animate-fade-in">
    <BackButton setCurrentPage={setCurrentPage} targetPage="home" />
    <div className="prose dark:prose-invert max-w-4xl mx-auto bg-cla-bg dark:bg-cla-surface-dark p-8 rounded-lg shadow-md">
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  </div>
);
