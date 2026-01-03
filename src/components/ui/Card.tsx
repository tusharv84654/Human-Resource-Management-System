'use client';

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
}

export default function Card({ children, className = '', hover = false, gradient = false }: CardProps) {
    return (
        <div
            className={`
        bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700
        ${hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' : ''}
        ${gradient ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-700 ${className}`}>
            {children}
        </div>
    );
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return <div className={`p-6 ${className}`}>{children}</div>;
}

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`px-6 py-4 border-t border-slate-100 dark:border-slate-700 ${className}`}>
            {children}
        </div>
    );
}
