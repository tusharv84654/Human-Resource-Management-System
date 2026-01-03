'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { AttendanceType, UserType } from '@/types';

export default function AdminAttendancePage() {
    const { token } = useAuth();
    const [attendance, setAttendance] = useState<AttendanceType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        const fetchAttendance = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/attendance?limit=100&startDate=${dateFilter}&endDate=${dateFilter}`, { headers: { Authorization: `Bearer ${token}` } });
                const json = await res.json();
                if (json.success) setAttendance(json.data);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };
        if (token) fetchAttendance();
    }, [token, dateFilter]);

    const stats = [
        { label: 'Present', value: attendance.filter(a => a.status === 'present').length, color: 'green' },
        { label: 'Absent', value: attendance.filter(a => a.status === 'absent').length, color: 'red' },
        { label: 'Half-Day', value: attendance.filter(a => a.status === 'half-day').length, color: 'orange' },
        { label: 'On Leave', value: attendance.filter(a => a.status === 'leave').length, color: 'blue' },
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
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
                        <p className="text-gray-500 mt-1">{format(new Date(dateFilter), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                    <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input" style={{ width: '180px' }} />
                </div>

                {/* Stats */}
                <div className="grid grid-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`card card-gradient ${stat.color} p-4`}>
                            <p style={{ fontSize: '28px', fontWeight: 700 }}>{stat.value}</p>
                            <p style={{ opacity: 0.8, fontSize: '13px', marginTop: '4px' }}>{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Work Hours</th>
                                <th>Extra Hrs</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((record) => {
                                const emp = record.userId as UserType;
                                const extra = (record.workHours || 0) - 8;
                                return (
                                    <tr key={record._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div style={{ position: 'relative' }}>
                                                    <div className="avatar avatar-md">{emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}</div>
                                                    <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid white', background: record.checkIn && !record.checkOut ? '#22c55e' : '#94a3b8' }} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</div>
                                                    <div className="text-xs text-gray-500">{emp.designation || 'Employee'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-gray-600">{emp.department || '—'}</td>
                                        <td className="text-gray-600 time-display">{record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : '—'}</td>
                                        <td className="text-gray-600 time-display">{record.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : '—'}</td>
                                        <td className="font-medium text-gray-800">{record.workHours ? `${record.workHours.toFixed(1)}h` : '—'}</td>
                                        <td>{record.workHours ? <span className={extra >= 0 ? 'text-green-600' : 'text-red-600'}>{extra >= 0 ? '+' : ''}{extra.toFixed(1)}h</span> : '—'}</td>
                                        <td><span className={`badge ${record.status === 'present' ? 'badge-success' : record.status === 'absent' ? 'badge-danger' : record.status === 'half-day' ? 'badge-warning' : 'badge-info'} capitalize`}>{record.status}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {attendance.length === 0 && <div className="p-6 text-center text-gray-500">No attendance records found</div>}
                </div>
            </div>
        </DashboardLayout>
    );
}
