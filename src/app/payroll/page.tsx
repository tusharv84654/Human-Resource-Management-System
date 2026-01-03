'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { PayrollType } from '@/types';

export default function PayrollPage() {
    const { token } = useAuth();
    const [payroll, setPayroll] = useState<PayrollType[]>([]);
    const [selected, setSelected] = useState<PayrollType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPayroll = async () => {
            try {
                const res = await fetch('/api/payroll', { headers: { Authorization: `Bearer ${token}` } });
                const json = await res.json();
                if (json.success) { setPayroll(json.data); if (json.data.length > 0) setSelected(json.data[0]); }
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };
        if (token) fetchPayroll();
    }, [token]);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                    <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
            </DashboardLayout>
        );
    }

    if (!selected) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-gray-800">Payroll</h1>
                    <div className="card p-12 text-center text-gray-500">No payroll records found</div>
                </div>
            </DashboardLayout>
        );
    }

    const totalAllowances = Object.values(selected.allowances).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(selected.deductions).reduce((a, b) => a + b, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Payroll</h1>
                        <p className="text-gray-500 mt-1">View your salary details</p>
                    </div>
                    <select value={selected._id} onChange={(e) => setSelected(payroll.find(p => p._id === e.target.value) || null)} className="input" style={{ width: '180px' }}>
                        {payroll.map((p) => <option key={p._id} value={p._id}>{format(new Date(p.year, p.month - 1), 'MMM yyyy')}</option>)}
                    </select>
                </div>

                {/* Net Salary Card */}
                <div className="card card-gradient purple p-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <p style={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Net Salary - {format(new Date(selected.year, selected.month - 1), 'MMMM yyyy')}
                            </p>
                            <p style={{ fontSize: '48px', fontWeight: 700, marginTop: '8px' }}>₹{selected.netSalary.toLocaleString()}</p>
                        </div>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg style={{ width: '40px', height: '40px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Earnings */}
                        <div className="card">
                            <div className="p-4 border-b" style={{ background: '#f0fdf4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg style={{ width: '20px', height: '20px', color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                                <h3 className="font-semibold text-green-700">Earnings</h3>
                            </div>
                            <div className="divide-y">
                                {[
                                    { label: 'Basic Salary', value: selected.basicSalary },
                                    { label: 'HRA', value: selected.allowances.hra },
                                    { label: 'Transport', value: selected.allowances.transport },
                                    { label: 'Medical', value: selected.allowances.medical },
                                ].map((item, i) => (
                                    <div key={i} className="px-4 py-3 flex justify-between">
                                        <span className="text-gray-600">{item.label}</span>
                                        <span className="font-medium text-green-600">+₹{item.value.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="px-4 py-4 flex justify-between" style={{ background: '#dcfce7' }}>
                                    <span className="font-semibold text-green-700">Total Earnings</span>
                                    <span className="font-bold text-green-700">₹{(selected.basicSalary + totalAllowances).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="card">
                            <div className="p-4 border-b" style={{ background: '#fef2f2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg style={{ width: '20px', height: '20px', color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" /></svg>
                                <h3 className="font-semibold text-red-700">Deductions</h3>
                            </div>
                            <div className="divide-y">
                                {[
                                    { label: 'Income Tax', value: selected.deductions.tax },
                                    { label: 'Provident Fund', value: selected.deductions.pf },
                                    { label: 'Insurance', value: selected.deductions.insurance },
                                ].map((item, i) => (
                                    <div key={i} className="px-4 py-3 flex justify-between">
                                        <span className="text-gray-600">{item.label}</span>
                                        <span className="font-medium text-red-600">-₹{item.value.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="px-4 py-4 flex justify-between" style={{ background: '#fee2e2' }}>
                                    <span className="font-semibold text-red-700">Total Deductions</span>
                                    <span className="font-bold text-red-700">-₹{totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="card">
                        <div className="p-4 border-b" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg style={{ width: '20px', height: '20px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h3 className="font-semibold text-gray-800">Payment History</h3>
                        </div>
                        <div className="divide-y" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                            {payroll.map((p) => (
                                <button key={p._id} onClick={() => setSelected(p)} style={{ width: '100%', padding: '16px', textAlign: 'left', background: selected._id === p._id ? '#f5f3ff' : 'white', borderLeft: selected._id === p._id ? '4px solid #8b5cf6' : '4px solid transparent' }}>
                                    <div className="font-medium text-gray-800">{format(new Date(p.year, p.month - 1), 'MMMM yyyy')}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-sm text-gray-500">₹{p.netSalary.toLocaleString()}</span>
                                        <span className={`badge text-xs ${p.status === 'paid' ? 'badge-success' : p.status === 'processed' ? 'badge-info' : 'badge-warning'} capitalize`}>{p.status}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
