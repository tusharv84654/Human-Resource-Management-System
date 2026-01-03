'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { UserType } from '@/types';

interface EmployeeFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    department: string;
    designation: string;
    role: string;
    dateOfJoining: string;
}

const initialFormData: EmployeeFormData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    designation: '',
    role: 'employee',
    dateOfJoining: format(new Date(), 'yyyy-MM-dd'),
};

export default function AdminEmployeesPage() {
    const { token } = useAuth();
    const [employees, setEmployees] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<UserType | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);

    const departments = ['Engineering', 'Design', 'Sales', 'Marketing', 'HR', 'Data Science', 'Finance', 'Operations'];

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            let url = `/api/employees?search=${search}`;
            if (selectedDept) url += `&department=${selectedDept}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            if (json.success) setEmployees(json.data);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { if (token) fetchEmployees(); }, [token, search, selectedDept]);

    const openAddModal = () => {
        setIsEditing(false);
        setSelectedEmployee(null);
        setFormData(initialFormData);
        setShowModal(true);
    };

    const openEditModal = (emp: UserType) => {
        setIsEditing(true);
        setSelectedEmployee(emp);
        setFormData({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            password: '',
            phone: emp.phone || '',
            department: emp.department || '',
            designation: emp.designation || '',
            role: emp.role,
            dateOfJoining: emp.dateOfJoining ? format(new Date(emp.dateOfJoining), 'yyyy-MM-dd') : '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.firstName || !formData.lastName) {
            toast.error('First name and last name are required');
            return;
        }
        if (!isEditing && (!formData.email || !formData.password)) {
            toast.error('Email and password are required for new employees');
            return;
        }

        setSaving(true);
        try {
            const url = '/api/employees';
            const method = isEditing ? 'PUT' : 'POST';
            const body = isEditing
                ? { id: selectedEmployee?._id, ...formData }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const json = await res.json();

            if (json.success) {
                toast.success(isEditing ? 'Employee updated' : 'Employee added');
                setShowModal(false);
                fetchEmployees();
            } else {
                toast.error(json.error || 'Operation failed');
            }
        } catch (e) {
            toast.error('Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete ${name}? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/employees?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            if (json.success) { toast.success('Employee deleted'); fetchEmployees(); }
            else toast.error(json.error);
        } catch (e) { toast.error('Failed to delete'); }
    };

    const stats = [
        { label: 'Total Employees', value: employees.length, color: 'purple', icon: <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { label: 'Admins', value: employees.filter(e => e.role === 'admin').length, color: 'pink', icon: <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
        { label: 'HR Staff', value: employees.filter(e => e.role === 'hr').length, color: 'blue', icon: <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
        { label: 'Regular Staff', value: employees.filter(e => e.role === 'employee').length, color: 'teal', icon: <svg style={{ width: '22px', height: '22px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    ];

    if (isLoading && employees.length === 0) {
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
                        <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
                        <p className="text-gray-500 mt-1">Manage your team members</p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Employee
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`card card-gradient ${stat.color} p-4`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p style={{ fontSize: '28px', fontWeight: 700 }}>{stat.value}</p>
                                    <p style={{ opacity: 0.8, fontSize: '13px', marginTop: '4px' }}>{stat.label}</p>
                                </div>
                                <div style={{ opacity: 0.5 }}>{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="card p-4">
                    <div className="flex gap-4 items-center">
                        <div style={{ flex: 1, maxWidth: '320px', position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input type="text" placeholder="Search by name, email, ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="input" style={{ width: '180px' }}>
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <span className="text-sm text-gray-500">{employees.length} employees found</span>
                    </div>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="overflow-hidden">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>ID</th>
                                    <th>Department</th>
                                    <th>Designation</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp) => (
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
                                        <td><span className="font-medium text-gray-700">{emp.employeeId}</span></td>
                                        <td className="text-gray-600">{emp.department || '—'}</td>
                                        <td className="text-gray-600">{emp.designation || '—'}</td>
                                        <td>
                                            <span className={`badge ${emp.role === 'admin' ? 'badge-purple' : emp.role === 'hr' ? 'badge-info' : 'badge-success'} capitalize`}>
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="text-gray-500">{emp.dateOfJoining ? format(new Date(emp.dateOfJoining), 'MMM d, yyyy') : emp.createdAt ? format(new Date(emp.createdAt), 'MMM d, yyyy') : '—'}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditModal(emp)} className="btn btn-secondary" style={{ padding: '8px' }} title="Edit">
                                                    <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(emp._id, `${emp.firstName} ${emp.lastName}`)} className="btn btn-secondary" style={{ padding: '8px', color: '#dc2626' }} title="Delete">
                                                    <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {employees.length === 0 && <div className="p-8 text-center text-gray-500">No employees found</div>}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                            <div className="p-5 border-b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="text-lg font-semibold text-gray-800">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
                                <button onClick={() => setShowModal(false)} style={{ padding: '4px', color: '#9ca3af' }}>
                                    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-5 space-y-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                <div className="grid grid-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>First Name *</label>
                                        <input className="input" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Last Name *</label>
                                        <input className="input" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="grid grid-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Email {!isEditing && '*'}</label>
                                        <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@company.com" disabled={isEditing} style={isEditing ? { background: '#f3f4f6' } : {}} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Password {!isEditing && '*'}</label>
                                        <input type="password" className="input" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={isEditing ? '(unchanged)' : 'Password'} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Phone</label>
                                    <input className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                                </div>
                                <div className="grid grid-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Department</label>
                                        <select className="input" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                                            <option value="">Select Department</option>
                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Role</label>
                                        <select className="input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                            <option value="employee">Employee</option>
                                            <option value="hr">HR</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Designation</label>
                                        <input className="input" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} placeholder="Software Engineer" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1" style={{ display: 'block' }}>Date of Joining</label>
                                        <input type="date" className="input" value={formData.dateOfJoining} onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 border-t flex justify-end gap-3" style={{ background: '#f9fafb' }}>
                                <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ minWidth: '120px' }}>
                                    {saving ? 'Saving...' : isEditing ? 'Update' : 'Add Employee'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
