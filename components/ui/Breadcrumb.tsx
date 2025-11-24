import React from 'react';
import { ChevronRightIcon } from '../icons';

export interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} className="inline-flex items-center">
                            {index > 0 && <ChevronRightIcon className="w-4 h-4 text-cla-text-muted dark:text-cla-text-muted-dark mx-1" />}
                            {isLast ? (
                                <span className="text-sm font-medium text-cla-text-dark truncate max-w-xs">
                                    {item.label}
                                </span>
                            ) : (
                                <button
                                    onClick={item.onClick}
                                    className="inline-flex items-center text-sm font-medium text-cla-text-muted-dark hover:text-cla-gold"
                                >
                                    {item.label}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
