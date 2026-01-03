'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { PayrollType, UserType } from '@/types';

export default function AdminPayrollPage() {
    const { token } = useAuth();
    const [payroll, setPayroll] = useState<PayrollType[]>([]);
    const [employees, setEmployees] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<PayrollType | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ userId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), basicSalary: 50000, allowances: { hra: 12500, transport: 3000, medical: 2000, other: 0 }, deductions: { tax: 5000, pf: 6000, insurance: 500, other: 0 }, status: 'pending' });

    const fetchData = async () => {
        try {
            const [payrollRes, empRes] = await Promise.all([fetch('/api/payroll?limit=100', { headers: { Authorization: `Bearer ${token}` } }), fetch('/api/employees?limit=100', { headers: { Authorization: `Bearer ${token}` } })]);
            const payrollData = await payrollRes.json();
            const empData = await empRes.json();
            if (payrollData.success) setPayroll(payrollData.data);
            if (empData.success) setEmployees(empData.data);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { if (token) fetchData(); }, [token]);

    const calculateNet = () => {
        const gross = formData.basicSalary + Object.values(formData.allowances).reduce((a, b) => a + b, 0);
        return gross - Object.values(formData.deductions).reduce((a, b) => a + b, 0);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const body = isEditing ? { id: selectedPayroll?._id, ...formData, netSalary: calculateNet() } : { ...formData, netSalary: calculateNet() };
            const res = await fetch('/api/payroll', { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
            const json = await res.json();
            if (json.success) { toast.success(isEditing ? 'Updated' : 'Created'); setShowModal(false); fetchData(); }
            else toast.error(json.error);
        } catch (e) { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const openCreate = () => { setIsEditing(false); setFormData({ userId: employees[0]?._id || '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), basicSalary: 50000, allowances: { hra: 12500, transport: 3000, medical: 2000, other: 0 }, deductions: { tax: 5000, pf: 6000, insurance: 500, other: 0 }, status: 'pending' }); setShowModal(true); };

    const openEdit = (p: PayrollType) => { setIsEditing(true); setSelectedPayroll(p); setFormData({ userId: (p.userId as UserType)._id, month: p.month, year: p.year, basicSalary: p.basicSalary, allowances: p.allowances, deductions: p.deductions, status: p.status }); setShowModal(true); };

    const totalPayroll = payroll.reduce((s, p) => s + (p.netSalary || 0), 0);

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
                        <h1 className="text-2xl font-bold text-gray-800">Payroll</h1>
                        <p className="text-gray-500 mt-1">Manage employee salaries</p>
                    </div>
                    <button onClick={openCreate} className="btn btn-primary">+ Create Payroll</button>
                </div>

                {/* Stats */}
                <div className="grid grid-3">
                    <div className="card card-gradient purple p-4">
                        <p style={{ opacity: 0.8, fontSize: '14px' }}>Total Payroll</p>
                        <p style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>₹{totalPayroll.toLocaleString()}</p>
                    </div>
                    <div className="card card-gradient orange p-4">
                        <p style={{ fontSize: '28px', fontWeight: 700 }}>{payroll.filter(p => p.status === 'pending').length}</p>
                        <p style={{ opacity: 0.8, fontSize: '13px', marginTop: '4px' }}>Pending</p>
                    </div>
                    <div className="card card-gradient green p-4">
                        <p style={{ fontSize: '28px', fontWeight: 700 }}>{payroll.filter(p => p.status === 'paid').length}</p>
                        <p style={{ opacity: 0.8, fontSize: '13px', marginTop: '4px' }}>Paid</p>
                    </div>
                </div>

                {/* Table */}
                <div className="card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Period</th>
                                <th>Basic</th>
                                <th>Allowances</th>
                                <th>Deductions</th>
                                <th>Net Salary</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payroll.map((p) => {
                                const emp = p.userId as UserType;
                                const totalAll = Object.values(p.allowances).reduce((a, b) => a + b, 0);
                                const totalDed = Object.values(p.deductions).reduce((a, b) => a + b, 0);
                                return (
                                    <tr key={p._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar avatar-md">{emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}</div>
                                                <div>
                                                    <div className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</div>
                                                    <div className="text-xs text-gray-500">{emp.designation || 'Employee'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-gray-600">{format(new Date(p.year, p.month - 1), 'MMM yyyy')}</td>
                                        <td className="text-gray-600">₹{p.basicSalary.toLocaleString()}</td>
                                        <td className="text-green-600">+₹{totalAll.toLocaleString()}</td>
                                        <td className="text-red-600">-₹{totalDed.toLocaleString()}</td>
                                        <td className="font-semibold text-gray-800">₹{p.netSalary.toLocaleString()}</td>
                                        <td><span className={`badge ${p.status === 'paid' ? 'badge-success' : p.status === 'processed' ? 'badge-info' : 'badge-warning'} capitalize`}>{p.status}</span></td>
                                        <td>
                                            <button onClick={() => openEdit(p)} className="btn-secondary" style={{ padding: '6px' }}>
                                                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {payroll.length === 0 && <div className="p-6 text-center text-gray-500">No payroll records found</div>}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="p-5 border-b">
                                <h3 className="text-lg font-semibold text-gray-800">{isEditing ? 'Edit' : 'Create'} Payroll</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Employee</label>
                                        <select className="input" value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} disabled={isEditing}>
                                            {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Month</label>
                                        <select className="input" value={formData.month} onChange={(e) => setFormData({ ...formData, month: +e.target.value })}>
                                            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{format(new Date(2024, i), 'MMMM')}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Year</label>
                                        <select className="input" value={formData.year} onChange={(e) => setFormData({ ...formData, year: +e.target.value })}>
                                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Basic Salary</label>
                                    <input type="number" className="input" value={formData.basicSalary} onChange={(e) => setFormData({ ...formData, basicSalary: +e.target.value })} />
                                </div>
                                <div style={{ padding: '16px', background: '#f3e8ff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="font-medium" style={{ color: '#7c3aed' }}>Net Salary</span>
                                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#7c3aed' }}>₹{calculateNet().toLocaleString()}</span>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Status</label>
                                    <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="pending">Pending</option>
                                        <option value="processed">Processed</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                            </div>
                            <div className="p-5 border-t flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
