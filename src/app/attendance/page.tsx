'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { AttendanceType } from '@/types';

export default function AttendancePage() {
    const { token } = useAuth();
    const [attendance, setAttendance] = useState<AttendanceType[]>([]);
    const [todayAttendance, setTodayAttendance] = useState<AttendanceType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);

    const fetchAttendance = async () => {
        try {
            const res = await fetch('/api/attendance?limit=30', { headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            if (json.success) {
                setAttendance(json.data);
                const today = new Date().toDateString();
                setTodayAttendance(json.data.find((a: AttendanceType) => new Date(a.date).toDateString() === today) || null);
            }
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { if (token) fetchAttendance(); }, [token]);

    const handleAttendance = async (action: 'checkin' | 'checkout') => {
        setCheckingIn(true);
        try {
            const res = await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action }) });
            const json = await res.json();
            if (json.success) { toast.success(json.message); fetchAttendance(); }
            else toast.error(json.error);
        } catch (e) { toast.error('Failed'); }
        finally { setCheckingIn(false); }
    };

    const stats = [
        { label: 'Present', value: attendance.filter(a => a.status === 'present').length, color: 'green' },
        { label: 'Absent', value: attendance.filter(a => a.status === 'absent').length, color: 'red' },
        { label: 'Half-Day', value: attendance.filter(a => a.status === 'half-day').length, color: 'orange' },
        { label: 'Total Hours', value: `${attendance.reduce((s, a) => s + (a.workHours || 0), 0).toFixed(0)}h`, color: 'purple' },
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
                        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
                        <p className="text-gray-500 mt-1">Track your work hours</p>
                    </div>
                    <div>
                        {!todayAttendance?.checkIn ? (
                            <button onClick={() => handleAttendance('checkin')} disabled={checkingIn} className="btn btn-success">{checkingIn ? 'Processing...' : '✓ Check In'}</button>
                        ) : !todayAttendance?.checkOut ? (
                            <button onClick={() => handleAttendance('checkout')} disabled={checkingIn} className="btn btn-danger">{checkingIn ? 'Processing...' : '✓ Check Out'}</button>
                        ) : (
                            <span className="text-green-600 font-medium">✓ Day Complete</span>
                        )}
                    </div>
                </div>

                {/* Today's Card */}
                {todayAttendance && (
                    <div className="card card-gradient purple p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p style={{ opacity: 0.7 }}>Today - {format(new Date(), 'EEEE, MMM d')}</p>
                                <div className="flex gap-8 mt-4">
                                    {[
                                        { label: 'Check In', value: todayAttendance.checkIn ? format(new Date(todayAttendance.checkIn), 'hh:mm a') : '--:--' },
                                        { label: 'Check Out', value: todayAttendance.checkOut ? format(new Date(todayAttendance.checkOut), 'hh:mm a') : '--:--' },
                                        { label: 'Work Hours', value: todayAttendance.workHours ? `${todayAttendance.workHours.toFixed(1)}h` : '--' },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <p style={{ opacity: 0.6, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                            <p style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }} className="time-display">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: todayAttendance.checkIn && !todayAttendance.checkOut ? '#4ade80' : 'rgba(255,255,255,0.5)' }} />
                                <span style={{ opacity: 0.8 }}>{todayAttendance.checkIn && !todayAttendance.checkOut ? 'Working' : todayAttendance.checkOut ? 'Complete' : 'Not Started'}</span>
                            </div>
                        </div>
                    </div>
                )}

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
                                <th>Date</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Work Hours</th>
                                <th>Extra Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((record) => {
                                const extra = (record.workHours || 0) - 8;
                                return (
                                    <tr key={record._id}>
                                        <td>
                                            <div className="font-medium text-gray-800">{format(new Date(record.date), 'EEE, MMM d')}</div>
                                            <div className="text-xs text-gray-500">{format(new Date(record.date), 'yyyy')}</div>
                                        </td>
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
