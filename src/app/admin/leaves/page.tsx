'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { LeaveType, UserType } from '@/types';

export default function AdminLeavesPage() {
    const { token } = useAuth();
    const [leaves, setLeaves] = useState<LeaveType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');

    const fetchLeaves = async () => {
        setIsLoading(true);
        try {
            let url = '/api/leaves?limit=100';
            if (statusFilter) url += `&status=${statusFilter}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            if (json.success) setLeaves(json.data);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { if (token) fetchLeaves(); }, [token, statusFilter]);

    const handleAction = async (leave: LeaveType, status: 'approved' | 'rejected') => {
        try {
            const res = await fetch('/api/leaves', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: leave._id, status }) });
            const json = await res.json();
            if (json.success) { toast.success(`Leave ${status}`); fetchLeaves(); }
            else toast.error(json.error);
        } catch (e) { toast.error('Failed'); }
    };

    const stats = [
        { label: 'Pending', value: leaves.filter(l => l.status === 'pending').length, color: 'orange' },
        { label: 'Approved', value: leaves.filter(l => l.status === 'approved').length, color: 'green' },
        { label: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length, color: 'red' },
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
                        <h1 className="text-2xl font-bold text-gray-800">Leave Requests</h1>
                        <p className="text-gray-500 mt-1">Manage employee time-off</p>
                    </div>
                    <div className="flex gap-2">
                        {['pending', 'approved', 'rejected', ''].map((status) => (
                            <button key={status || 'all'} onClick={() => setStatusFilter(status)} className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px' }}>
                                {status || 'All'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-3">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`card card-gradient ${stat.color} p-4`}>
                            <p style={{ fontSize: '28px', fontWeight: 700 }}>{stat.value}</p>
                            <p style={{ opacity: 0.8, fontSize: '13px', marginTop: '4px' }}>{stat.label} Requests</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map((leave) => {
                                const emp = leave.userId as UserType;
                                return (
                                    <tr key={leave._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar avatar-md">{emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}</div>
                                                <div>
                                                    <div className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</div>
                                                    <div className="text-xs text-gray-500">{emp.department || 'Employee'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-purple capitalize">{leave.leaveType}</span></td>
                                        <td>
                                            <div className="font-medium text-gray-800">{leave.totalDays} day(s)</div>
                                            <div className="text-xs text-gray-500">{format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d')}</div>
                                        </td>
                                        <td className="text-gray-600" style={{ maxWidth: '200px' }}><div className="truncate">{leave.reason}</div></td>
                                        <td><span className={`badge ${leave.status === 'approved' ? 'badge-success' : leave.status === 'rejected' ? 'badge-danger' : 'badge-warning'} capitalize`}>{leave.status}</span></td>
                                        <td>
                                            {leave.status === 'pending' && (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleAction(leave, 'approved')} className="btn-success" style={{ padding: '6px' }}>
                                                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    </button>
                                                    <button onClick={() => handleAction(leave, 'rejected')} className="btn-danger" style={{ padding: '6px' }}>
                                                        <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {leaves.length === 0 && <div className="p-6 text-center text-gray-500">No leave requests found</div>}
                </div>
            </div>
        </DashboardLayout>
    );
}
