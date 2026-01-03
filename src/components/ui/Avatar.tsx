'use client';

import React from 'react';

interface AvatarProps {
    src?: string | null;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function Avatar({ src, name = '', size = 'md', className = '' }: AvatarProps) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const colors = [
        'bg-gradient-to-br from-indigo-400 to-purple-500',
        'bg-gradient-to-br from-emerald-400 to-teal-500',
        'bg-gradient-to-br from-amber-400 to-orange-500',
        'bg-gradient-to-br from-rose-400 to-pink-500',
        'bg-gradient-to-br from-cyan-400 to-blue-500',
    ];

    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-800 ${className}`}
            />
        );
    }

    return (
        <div
            className={`
        ${sizes[size]} ${colors[colorIndex]}
        rounded-full flex items-center justify-center font-semibold text-white
        ring-2 ring-white dark:ring-slate-800 shadow-lg
        ${className}
      `}
        >
            {getInitials(name)}
        </div>
    );
}
