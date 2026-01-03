'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import { UserType, LeaveType } from '@/types';

interface DashboardStats {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    pendingLeaves: number;
    totalPayroll: number;
}

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({ totalEmployees: 0, presentToday: 0, absentToday: 0, pendingLeaves: 0, totalPayroll: 0 });
    const [employees, setEmployees] = useState<UserType[]>([]);
    const [pendingLeaves, setPendingLeaves] = useState<LeaveType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empRes, dashRes, leavesRes] = await Promise.all([
                    fetch('/api/employees?limit=5', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/leaves?status=pending&limit=5', { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                const [empData, dashData, leavesData] = await Promise.all([empRes.json(), dashRes.json(), leavesRes.json()]);

                if (empData.success) setEmployees(empData.data);
                if (dashData.success) setStats(dashData.data);
                if (leavesData.success) setPendingLeaves(leavesData.data);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };

        if (token) fetchData();
    }, [token]);

    const statCards = [
        { label: 'Total Employees', value: stats.totalEmployees, icon: <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, color: 'purple' },
        { label: 'Present Today', value: stats.presentToday, icon: <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'teal' },
        { label: 'Absent Today', value: stats.absentToday, icon: <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>, color: 'pink' },
        { label: 'Pending Leaves', value: stats.pendingLeaves, icon: <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'orange' },
    ];

    const quickActions = [
        { label: 'Add Employee', href: '/admin/employees', icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>, color: '#8b5cf6' },
        { label: 'View Attendance', href: '/admin/attendance', icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>, color: '#14b8a6' },
        { label: 'Manage Leaves', href: '/admin/leaves', icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, color: '#3b82f6' },
        { label: 'Process Payroll', href: '/admin/payroll', icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, color: '#ec4899' },
    ];

    if (isLoading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                    <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-4">
                    {statCards.map((stat, idx) => (
                        <div key={idx} className={`card card-gradient ${stat.color} p-5`}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ opacity: 0.8, fontSize: '14px' }}>{stat.label}</p>
                                    <p style={{ fontSize: '36px', fontWeight: 700, marginTop: '4px' }}>{stat.value}</p>
                                </div>
                                <div style={{ opacity: 0.5 }}>{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Recent Employees */}
                    <div className="card">
                        <div className="p-5" style={{ borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 className="font-semibold text-gray-800 text-lg">Recent Employees</h3>
                                <p className="text-sm text-gray-500">Latest team members</p>
                            </div>
                            <Link href="/admin/employees" className="btn btn-secondary" style={{ fontSize: '14px' }}>View All</Link>
                        </div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.slice(0, 5).map((emp) => (
                                    <tr key={emp._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar avatar-md">{emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}</div>
                                                <div>
                                                    <div className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</div>
                                                    <div className="text-xs text-gray-500">{emp.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-gray-600">{emp.department || '—'}</td>
                                        <td><span className={`badge ${emp.role === 'admin' ? 'badge-purple' : emp.role === 'hr' ? 'badge-info' : 'badge-success'} capitalize`}>{emp.role}</span></td>
                                        <td className="text-gray-500">{emp.createdAt ? format(new Date(emp.createdAt), 'MMM d') : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {employees.length === 0 && <div className="p-6 text-center text-gray-500">No employees yet</div>}
                    </div>

                    {/* Quick Actions */}
                    <div className="card p-5">
                        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            {quickActions.map((action, idx) => (
                                <Link key={idx} href={action.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '10px', background: '#f8fafc', transition: 'all 0.2s' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color }}>
                                        {action.icon}
                                    </div>
                                    <span className="font-medium text-gray-700">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pending Leave Requests */}
                <div className="card">
                    <div className="p-5" style={{ borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-lg">Pending Leave Requests</h3>
                            <p className="text-sm text-gray-500">Requests awaiting your approval</p>
                        </div>
                        <Link href="/admin/leaves" className="btn btn-primary" style={{ fontSize: '14px' }}>Manage All</Link>
                    </div>
                    {pendingLeaves.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Type</th>
                                    <th>Duration</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingLeaves.map((leave) => (
                                    <tr key={leave._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar avatar-sm">{(leave.userId as any)?.firstName?.charAt(0) || 'U'}{(leave.userId as any)?.lastName?.charAt(0) || ''}</div>
                                                <div>
                                                    <div className="font-medium text-gray-800">{(leave.userId as any)?.firstName} {(leave.userId as any)?.lastName}</div>
                                                    <div className="text-xs text-gray-500">{(leave.userId as any)?.department || '—'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-purple capitalize">{leave.leaveType}</span></td>
                                        <td>
                                            <div className="font-medium text-gray-800">{leave.totalDays} day(s)</div>
                                            <div className="text-xs text-gray-500">{format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d')}</div>
                                        </td>
                                        <td className="text-gray-600" style={{ maxWidth: '180px' }}><div className="truncate">{leave.reason}</div></td>
                                        <td><span className="badge badge-warning capitalize">{leave.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <svg style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p>No pending leave requests</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
