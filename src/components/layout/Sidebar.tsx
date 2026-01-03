'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = {
    employee: [
        { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
        { icon: 'profile', label: 'My Profile', href: '/profile' },
        { icon: 'attendance', label: 'Attendance', href: '/attendance' },
        { icon: 'leave', label: 'Time Off', href: '/leaves' },
        { icon: 'payroll', label: 'Payroll', href: '/payroll' },
    ],
    admin: [
        { icon: 'dashboard', label: 'Dashboard', href: '/admin' },
        { icon: 'status', label: 'Employee Status', href: '/admin/status' },
        { icon: 'employees', label: 'Employees', href: '/admin/employees' },
        { icon: 'attendance', label: 'Attendance', href: '/admin/attendance' },
        { icon: 'leave', label: 'Leave Requests', href: '/admin/leaves' },
        { icon: 'payroll', label: 'Payroll', href: '/admin/payroll' },
    ],
};

const icons: Record<string, React.ReactNode> = {
    dashboard: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    status: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    profile: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    employees: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    attendance: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    leave: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    payroll: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuth();
    const items = user?.role === 'employee' ? navItems.employee : navItems.admin;

    return (
        <>
            {isOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={onClose} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <Image src="/logo.png" alt="Dayflow" width={36} height={36} style={{ objectFit: 'contain' }} />
                    </div>
                    <div>
                        <div style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>Dayflow</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>HR Management</div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ padding: '16px 0' }}>
                    <div style={{ padding: '0 16px 8px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Menu
                    </div>
                    {items.map((item) => (
                        <Link key={item.href} href={item.href} onClick={onClose} className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}>
                            {icons[item.icon]}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
                        <div className="avatar avatar-md">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: 'white', fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.firstName} {user?.lastName}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'capitalize' }}>{user?.role}</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
