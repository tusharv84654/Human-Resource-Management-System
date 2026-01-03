'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { UserType } from '@/types';
import Link from 'next/link';

interface EmployeeWithStatus extends UserType {
    attendanceStatus: 'present' | 'leave' | 'absent';
}

export default function EmployeeStatusPage() {
    const { token } = useAuth();
    const [employees, setEmployees] = useState<EmployeeWithStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'present' | 'leave' | 'absent'>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = format(new Date(), 'yyyy-MM-dd');

                // Fetch employees, attendance, and leaves
                const [empRes, attRes, leaveRes] = await Promise.all([
                    fetch('/api/employees', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`/api/attendance?date=${today}`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/leaves?status=approved', { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                const [empData, attData, leaveData] = await Promise.all([
                    empRes.json(),
                    attRes.json(),
                    leaveRes.json(),
                ]);

                if (empData.success) {
                    const attendanceMap = new Map();
                    const leaveMap = new Map();

                    // Map attendance records
                    if (attData.success && attData.data) {
                        attData.data.forEach((att: any) => {
                            const userId = att.userId?._id || att.userId;
                            if (att.status === 'present' || att.status === 'half-day') {
                                attendanceMap.set(userId, 'present');
                            }
                        });
                    }

                    // Map approved leaves for today
                    if (leaveData.success && leaveData.data) {
                        const todayDate = new Date();
                        leaveData.data.forEach((leave: any) => {
                            const userId = leave.userId?._id || leave.userId;
                            const start = new Date(leave.startDate);
                            const end = new Date(leave.endDate);
                            if (todayDate >= start && todayDate <= end) {
                                leaveMap.set(userId, 'leave');
                            }
                        });
                    }

                    // Assign status to each employee
                    const employeesWithStatus = empData.data.map((emp: UserType) => {
                        let status: 'present' | 'leave' | 'absent' = 'absent';
                        if (attendanceMap.has(emp._id)) {
                            status = 'present';
                        } else if (leaveMap.has(emp._id)) {
                            status = 'leave';
                        }
                        return { ...emp, attendanceStatus: status };
                    });

                    setEmployees(employeesWithStatus);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchData();
    }, [token]);

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.department}`.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || emp.attendanceStatus === filter;
        return matchesSearch && matchesFilter;
    });

    const statusCounts = {
        present: employees.filter(e => e.attendanceStatus === 'present').length,
        leave: employees.filter(e => e.attendanceStatus === 'leave').length,
        absent: employees.filter(e => e.attendanceStatus === 'absent').length,
    };

    const StatusIndicator = ({ status }: { status: 'present' | 'leave' | 'absent' }) => {
        if (status === 'present') {
            return (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)' }} title="Present">
                    <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />
                </div>
            );
        }
        if (status === 'leave') {
            return (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' }} title="On Leave">
                    <svg style={{ width: '14px', height: '14px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </div>
            );
        }
        return (
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px rgba(234, 179, 8, 0.5)' }} title="Absent">
                <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />
            </div>
        );
    };

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
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Employee Status</h1>
                        <p className="text-gray-500 mt-1">Real-time attendance overview for today</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                </div>

                {/* Status Summary Cards */}
                <div className="grid grid-3">
                    <div className="card p-5" style={{ borderLeft: '4px solid #22c55e' }}>
                        <div className="flex items-center gap-4">
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '16px', height: '16px', background: '#22c55e', borderRadius: '50%' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '28px', fontWeight: 700, color: '#166534' }}>{statusCounts.present}</p>
                                <p style={{ fontSize: '13px', color: '#4ade80' }}>Present Today</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-5" style={{ borderLeft: '4px solid #3b82f6' }}>
                        <div className="flex items-center gap-4">
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg style={{ width: '24px', height: '24px', color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                            <div>
                                <p style={{ fontSize: '28px', fontWeight: 700, color: '#1e40af' }}>{statusCounts.leave}</p>
                                <p style={{ fontSize: '13px', color: '#60a5fa' }}>On Leave</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-5" style={{ borderLeft: '4px solid #eab308' }}>
                        <div className="flex items-center gap-4">
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '16px', height: '16px', background: '#eab308', borderRadius: '50%' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '28px', fontWeight: 700, color: '#a16207' }}>{statusCounts.absent}</p>
                                <p style={{ fontSize: '13px', color: '#facc15' }}>Absent</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-4">
                    <div className="flex items-center gap-4">
                        <div style={{ flex: 1, maxWidth: '320px', position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input"
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                        <div className="flex gap-2">
                            {[
                                { key: 'all', label: 'All', color: '#6b7280' },
                                { key: 'present', label: 'Present', color: '#22c55e' },
                                { key: 'leave', label: 'On Leave', color: '#3b82f6' },
                                { key: 'absent', label: 'Absent', color: '#eab308' },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key as any)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: filter === f.key ? f.color : '#f3f4f6',
                                        color: filter === f.key ? 'white' : '#6b7280',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <span className="text-sm text-gray-500" style={{ marginLeft: 'auto' }}>
                            {filteredEmployees.length} employees
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-6" style={{ padding: '12px 16px', background: 'white', borderRadius: '10px' }}>
                    <div className="flex items-center gap-2">
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: '13px', color: '#374151' }}>Present in office</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg style={{ width: '8px', height: '8px', color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                        <span style={{ fontSize: '13px', color: '#374151' }}>On approved leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }} />
                        <span style={{ fontSize: '13px', color: '#374151' }}>Absent (no time off applied)</span>
                    </div>
                </div>

                {/* Employee Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                    {filteredEmployees.map((emp) => (
                        <Link
                            key={emp._id}
                            href={`/admin/employees?id=${emp._id}`}
                            className="card"
                            style={{ padding: '20px', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            {/* Status Indicator */}
                            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                <StatusIndicator status={emp.attendanceStatus} />
                            </div>

                            {/* Profile */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div className="avatar avatar-xl" style={{ marginBottom: '12px', fontSize: '18px' }}>
                                    {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                                </div>
                                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>
                                    {emp.firstName} {emp.lastName}
                                </h3>
                                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                    {emp.designation || emp.role}
                                </p>
                                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                    {emp.department || 'No Department'}
                                </p>
                            </div>

                            {/* Quick Info */}
                            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '12px', fontWeight: 600, color: emp.attendanceStatus === 'present' ? '#22c55e' : emp.attendanceStatus === 'leave' ? '#3b82f6' : '#eab308' }}>
                                        {emp.attendanceStatus === 'present' ? 'Present' : emp.attendanceStatus === 'leave' ? 'On Leave' : 'Absent'}
                                    </p>
                                    <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Status</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredEmployees.length === 0 && (
                    <div className="card p-12" style={{ textAlign: 'center' }}>
                        <svg style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-500">No employees found</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
