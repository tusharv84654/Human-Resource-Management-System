'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Link from 'next/link';
import { AttendanceType, LeaveType, PayrollType } from '@/types';

export default function EmployeeDashboard() {
    const { user, token } = useAuth();
    const [data, setData] = useState<{ todayAttendance: AttendanceType | null; recentLeaves: LeaveType[]; latestPayroll: PayrollType | null; monthlyPresent: number; totalWorkHours: number }>({ todayAttendance: null, recentLeaves: [], latestPayroll: null, monthlyPresent: 0, totalWorkHours: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);

    const fetchData = async () => {
        try {
            const [attRes, leaveRes, payrollRes] = await Promise.all([
                fetch('/api/attendance?limit=30', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/leaves?limit=5', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/payroll?limit=1', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const [attData, leaveData, payrollData] = await Promise.all([attRes.json(), leaveRes.json(), payrollRes.json()]);
            if (attData.success) {
                const today = new Date().toDateString();
                const todayRecord = attData.data.find((a: AttendanceType) => new Date(a.date).toDateString() === today);
                const monthlyPresent = attData.data.filter((a: AttendanceType) => a.status === 'present').length;
                const totalWorkHours = attData.data.reduce((s: number, a: AttendanceType) => s + (a.workHours || 0), 0);
                setData(prev => ({ ...prev, todayAttendance: todayRecord || null, monthlyPresent, totalWorkHours }));
            }
            if (leaveData.success) setData(prev => ({ ...prev, recentLeaves: leaveData.data }));
            if (payrollData.success && payrollData.data.length > 0) setData(prev => ({ ...prev, latestPayroll: payrollData.data[0] }));
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { if (token) fetchData(); }, [token]);

    const handleAttendance = async (action: 'checkin' | 'checkout') => {
        setCheckingIn(true);
        try {
            const res = await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action }) });
            const json = await res.json();
            if (json.success) { toast.success(json.message); fetchData(); }
            else toast.error(json.error);
        } catch (e) { toast.error('Failed'); }
        finally { setCheckingIn(false); }
    };

    const isCheckedIn = data.todayAttendance?.checkIn && !data.todayAttendance?.checkOut;
    const isDayComplete = data.todayAttendance?.checkIn && data.todayAttendance?.checkOut;

    const quickActions = [
        { label: 'View Attendance', href: '/attendance', color: 'purple', icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { label: 'Apply Leave', href: '/leaves', color: 'teal', icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { label: 'View Payroll', href: '/payroll', color: 'blue', icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { label: 'My Profile', href: '/profile', color: 'pink', icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
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
                    {[
                        { label: 'Days Present', value: data.monthlyPresent, sub: 'This month', color: 'purple', icon: <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                        { label: 'Work Hours', value: `${data.totalWorkHours.toFixed(0)}h`, sub: 'Total this month', color: 'teal', icon: <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                        { label: 'Pending Leaves', value: data.recentLeaves.filter(l => l.status === 'pending').length, sub: 'Awaiting approval', color: 'blue', icon: <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                        { label: 'Net Salary', value: data.latestPayroll ? `₹${(data.latestPayroll.netSalary / 1000).toFixed(0)}k` : '—', sub: data.latestPayroll ? format(new Date(data.latestPayroll.year, data.latestPayroll.month - 1), 'MMMM') : 'No data', color: 'pink', icon: <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
                    ].map((stat, idx) => (
                        <div key={idx} className={`card card-gradient ${stat.color} p-5`}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ opacity: 0.8, fontSize: '14px' }}>{stat.label}</p>
                                    <p style={{ fontSize: '32px', fontWeight: 700, marginTop: '4px' }}>{stat.value}</p>
                                    <p style={{ opacity: 0.7, fontSize: '12px', marginTop: '8px' }}>{stat.sub}</p>
                                </div>
                                <div style={{ opacity: 0.5 }}>{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Today's Attendance */}
                    <div className="card p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-semibold text-gray-800 text-lg">Today&apos;s Attendance</h3>
                                <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isCheckedIn ? '#22c55e' : '#94a3b8' }} />
                                <span className="text-sm text-gray-600">{isCheckedIn ? 'Working' : isDayComplete ? 'Complete' : 'Not Started'}</span>
                            </div>
                        </div>

                        <div className="grid grid-3 mb-6">
                            {[
                                { label: 'Check In', value: data.todayAttendance?.checkIn ? format(new Date(data.todayAttendance.checkIn), 'hh:mm a') : '--:--', color: '#8b5cf6', icon: <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg> },
                                { label: 'Check Out', value: data.todayAttendance?.checkOut ? format(new Date(data.todayAttendance.checkOut), 'hh:mm a') : '--:--', color: '#14b8a6', icon: <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> },
                                { label: 'Work Hours', value: data.todayAttendance?.workHours ? `${data.todayAttendance.workHours.toFixed(1)}h` : '--', color: '#3b82f6', icon: <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                            ].map((item, i) => (
                                <div key={i} style={{ textAlign: 'center', padding: '20px', background: `${item.color}10`, borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                                        <span style={{ color: item.color }}>{item.icon}</span>
                                        <p style={{ fontSize: '11px', color: item.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                    </div>
                                    <p style={{ fontSize: '24px', fontWeight: 700 }} className="time-display text-gray-800">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            {!data.todayAttendance?.checkIn ? (
                                <button onClick={() => handleAttendance('checkin')} disabled={checkingIn} className="btn btn-success" style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {checkingIn ? 'Processing...' : 'Check In'}
                                </button>
                            ) : !data.todayAttendance?.checkOut ? (
                                <button onClick={() => handleAttendance('checkout')} disabled={checkingIn} className="btn btn-danger" style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    {checkingIn ? 'Processing...' : 'Check Out'}
                                </button>
                            ) : (
                                <span className="text-green-600 font-medium flex items-center gap-2">
                                    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Day Complete - Great work!
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card p-5">
                        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            {quickActions.map((action, idx) => (
                                <Link key={idx} href={action.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '10px', background: '#f8fafc', transition: 'all 0.2s' }}>
                                    <div className={`card-gradient ${action.color}`} style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {action.icon}
                                    </div>
                                    <span className="font-medium text-gray-700">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Leaves */}
                <div className="card">
                    <div className="p-5" style={{ borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 className="font-semibold text-gray-800">Recent Leave Requests</h3>
                            <p className="text-sm text-gray-500">Your latest time-off requests</p>
                        </div>
                        <Link href="/leaves" className="btn btn-primary">Apply Leave</Link>
                    </div>
                    {data.recentLeaves.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Duration</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentLeaves.slice(0, 4).map((leave) => (
                                    <tr key={leave._id}>
                                        <td><span className="badge badge-purple capitalize">{leave.leaveType}</span></td>
                                        <td>
                                            <div className="font-medium text-gray-800">{leave.totalDays} day(s)</div>
                                            <div className="text-xs text-gray-500">{format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d')}</div>
                                        </td>
                                        <td className="text-gray-600" style={{ maxWidth: '200px' }}><div className="truncate">{leave.reason}</div></td>
                                        <td><span className={`badge ${leave.status === 'approved' ? 'badge-success' : leave.status === 'rejected' ? 'badge-danger' : 'badge-warning'} capitalize`}>{leave.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-6 text-center text-gray-500">No leave requests yet</div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
