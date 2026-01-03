'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user, token, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    useEffect(() => {
        const checkAttendance = async () => {
            if (!token) return;
            try {
                const res = await fetch('/api/attendance?limit=1', { headers: { Authorization: `Bearer ${token}` } });
                const json = await res.json();
                if (json.success && json.data.length > 0) {
                    const today = new Date().toDateString();
                    const record = json.data[0];
                    setIsCheckedIn(new Date(record.date).toDateString() === today && record.checkIn && !record.checkOut);
                }
            } catch (e) { console.error(e); }
        };
        checkAttendance();
    }, [token]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <header className="header">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="btn-secondary" style={{ padding: '8px', display: 'none' }}>
                    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold text-gray-800">{getGreeting()}, {user?.firstName}!</h1>
                        <svg style={{ width: '24px', height: '24px', color: '#f59e0b' }} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <svg style={{ width: '18px', height: '18px', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Search..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '160px', fontSize: '14px' }} />
                </div>

                {/* Notifications */}
                <button style={{ position: 'relative', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                    <svg style={{ width: '20px', height: '20px', color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="notification-badge">3</span>
                </button>

                {/* User Menu */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowDropdown(!showDropdown)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px 6px 6px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
                        <div style={{ position: 'relative' }}>
                            <div className="avatar avatar-md">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</div>
                            <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white', background: isCheckedIn ? '#22c55e' : '#94a3b8' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div className="text-sm font-medium text-gray-800">{user?.firstName}</div>
                            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                        </div>
                        <svg style={{ width: '16px', height: '16px', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {showDropdown && (
                        <>
                            <div style={{ position: 'fixed', inset: 0, zIndex: 140 }} onClick={() => setShowDropdown(false)} />
                            <div className="dropdown">
                                <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                                    <div className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</div>
                                    <div className="text-xs text-gray-500">{user?.email}</div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`status-dot ${isCheckedIn ? 'status-online' : 'status-offline'}`} />
                                        <span className="text-xs text-gray-500">{isCheckedIn ? 'Working' : 'Not checked in'}</span>
                                    </div>
                                </div>
                                <Link href="/profile" onClick={() => setShowDropdown(false)} className="dropdown-item">
                                    <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    My Profile
                                </Link>
                                <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                                <button onClick={() => { setShowDropdown(false); logout(); }} className="dropdown-item" style={{ width: '100%', color: '#dc2626' }}>
                                    <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
