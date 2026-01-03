'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { LeaveType } from '@/types';

const LEAVE_BALANCES = { paid: { total: 24, label: 'Paid Leave' }, sick: { total: 12, label: 'Sick Leave' }, casual: { total: 6, label: 'Casual Leave' }, unpaid: { total: 365, label: 'Unpaid Leave' } };

export default function LeavesPage() {
    const { token } = useAuth();
    const [leaves, setLeaves] = useState<LeaveType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ leaveType: 'paid', startDate: '', endDate: '', reason: '' });

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/leaves', { headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            if (json.success) setLeaves(json.data);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { if (token) fetchLeaves(); }, [token]);

    const getUsedLeaves = (type: string) => leaves.filter(l => l.leaveType === type && l.status === 'approved').reduce((s, l) => s + l.totalDays, 0);
    const getAvailable = (type: string) => { const b = LEAVE_BALANCES[type as keyof typeof LEAVE_BALANCES]; return b ? b.total - getUsedLeaves(type) : 0; };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate || !formData.reason) { toast.error('Please fill all fields'); return; }
        setSubmitting(true);
        try {
            const res = await fetch('/api/leaves', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
            const json = await res.json();
            if (json.success) { toast.success('Leave request submitted'); setShowModal(false); setFormData({ leaveType: 'paid', startDate: '', endDate: '', reason: '' }); fetchLeaves(); }
            else toast.error(json.error);
        } catch (e) { toast.error('Failed'); }
        finally { setSubmitting(false); }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Cancel this request?')) return;
        try {
            const res = await fetch(`/api/leaves?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            if (json.success) { toast.success('Cancelled'); fetchLeaves(); }
            else toast.error(json.error);
        } catch (e) { toast.error('Failed'); }
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
                        <h1 className="text-2xl font-bold text-gray-800">Time Off</h1>
                        <p className="text-gray-500 mt-1">Manage your leave requests</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">+ New Request</button>
                </div>

                {/* Leave Balances */}
                <div className="grid grid-4">
                    {Object.entries(LEAVE_BALANCES).map(([type, balance]) => {
                        const used = getUsedLeaves(type);
                        const available = balance.total - used;
                        const pct = (available / balance.total) * 100;
                        return (
                            <div key={type} className="card p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-medium text-gray-600">{balance.label}</span>
                                    <span className="text-xs text-gray-400">{used}/{balance.total}</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-800 mb-3">{available}</p>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #6366f1)', borderRadius: '4px' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Table */}
                <div className="card">
                    <div className="p-5" style={{ borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="font-semibold text-gray-800">My Requests</h3>
                        <div className="flex gap-2">
                            <span className="badge badge-warning">{leaves.filter(l => l.status === 'pending').length} Pending</span>
                            <span className="badge badge-success">{leaves.filter(l => l.status === 'approved').length} Approved</span>
                        </div>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map((leave) => (
                                <tr key={leave._id}>
                                    <td><span className="badge badge-purple capitalize">{leave.leaveType}</span></td>
                                    <td>
                                        <div className="font-medium text-gray-800">{leave.totalDays} day(s)</div>
                                        <div className="text-xs text-gray-500">{format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d')}</div>
                                    </td>
                                    <td className="text-gray-600" style={{ maxWidth: '200px' }}><div className="truncate">{leave.reason}</div></td>
                                    <td><span className={`badge ${leave.status === 'approved' ? 'badge-success' : leave.status === 'rejected' ? 'badge-danger' : 'badge-warning'} capitalize`}>{leave.status}</span></td>
                                    <td>
                                        {leave.status === 'pending' && (
                                            <button onClick={() => handleCancel(leave._id)} className="btn-danger" style={{ padding: '6px' }}>
                                                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {leaves.length === 0 && <div className="p-6 text-center text-gray-500">No leave requests yet</div>}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="p-5 border-b">
                                <h3 className="text-lg font-semibold text-gray-800">New Leave Request</h3>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Leave Type</label>
                                    <select className="input" value={formData.leaveType} onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}>
                                        {Object.entries(LEAVE_BALANCES).map(([type, balance]) => (
                                            <option key={type} value={type}>{balance.label} ({getAvailable(type)} available)</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ padding: '16px', background: '#f3e8ff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#7c3aed' }}>Available Balance</span>
                                    <span style={{ fontWeight: 700, color: '#7c3aed' }}>{getAvailable(formData.leaveType)} days</span>
                                </div>
                                <div className="grid grid-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Start Date</label>
                                        <input type="date" className="input" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>End Date</label>
                                        <input type="date" className="input" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Reason</label>
                                    <textarea className="input" rows={3} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Describe your reason..." />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                    <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Submitting...' : 'Submit'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
