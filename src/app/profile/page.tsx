'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { UserType, PayrollType } from '@/types';

export default function ProfilePage() {
    const { token, refreshUser, user: authUser } = useAuth();
    const [user, setUser] = useState<UserType | null>(null);
    const [payroll, setPayroll] = useState<PayrollType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'about' | 'private' | 'salary'>('about');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({ phone: '', address: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [userRes, payrollRes] = await Promise.all([
                    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/payroll?limit=1', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const userData = await userRes.json();
                const payrollData = await payrollRes.json();
                if (userData.success) { setUser(userData.data); setEditData({ phone: userData.data.phone || '', address: userData.data.address || '' }); }
                if (payrollData.success && payrollData.data.length > 0) setPayroll(payrollData.data[0]);
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };
        if (token) fetchProfile();
    }, [token]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/employees', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: user?._id, ...editData }) });
            const json = await res.json();
            if (json.success) { toast.success('Updated'); setUser(json.data); setIsEditing(false); refreshUser(); }
            else toast.error(json.error);
        } catch (e) { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const isAdmin = authUser?.role === 'admin' || authUser?.role === 'hr';

    if (isLoading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                    <div style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return <DashboardLayout><div className="card p-12 text-center text-gray-500">Profile not found</div></DashboardLayout>;
    }

    const tabIcons = {
        about: <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        private: <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
        salary: <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '900px', margin: '0 auto' }} className="space-y-6">
                {/* Profile Header */}
                <div className="card overflow-hidden">
                    <div style={{ height: '140px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)', position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                    </div>
                    <div style={{ padding: '0 32px 32px', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginTop: '-56px' }}>
                            <div className="avatar" style={{ width: '112px', height: '112px', fontSize: '36px', border: '4px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                            <div style={{ flex: 1, paddingBottom: '12px' }}>
                                <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1f2937' }}>{user.firstName} {user.lastName}</h1>
                                <p style={{ color: '#6b7280', marginTop: '4px' }}>{user.designation || 'Employee'} • {user.department || 'No Department'}</p>
                            </div>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-4">
                    {[
                        { label: 'Employee ID', value: user.employeeId, icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>, color: 'purple' },
                        { label: 'Department', value: user.department || 'N/A', icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, color: 'teal' },
                        { label: 'Role', value: user.role, icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, color: 'blue' },
                        { label: 'Status', value: 'Active', icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'green' },
                    ].map((stat, idx) => (
                        <div key={idx} className={`card card-gradient ${stat.color} p-4`}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ opacity: 0.8, fontSize: '12px' }}>{stat.label}</p>
                                    <p className="font-semibold capitalize mt-1">{stat.value}</p>
                                </div>
                                <div style={{ opacity: 0.6 }}>{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="card" style={{ padding: '6px', display: 'flex', gap: '6px' }}>
                    {(['about', 'private', ...(isAdmin ? ['salary'] : [])] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            style={{
                                flex: 1,
                                padding: '14px 20px',
                                borderRadius: '8px',
                                fontWeight: 500,
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                background: activeTab === tab ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
                                color: activeTab === tab ? 'white' : '#6b7280',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tabIcons[tab]}
                            {tab === 'salary' ? 'Salary Info' : tab === 'private' ? 'Private Info' : 'About'}
                        </button>
                    ))}
                    
                </div>

                {/* Tab Content */}
                {activeTab === 'about' && (
                    <div className="card p-6">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                            <svg style={{ width: '20px', height: '20px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h3 className="font-semibold text-gray-800">General Information</h3>
                        </div>
                        <div className="grid grid-3">
                            {[
                                { label: 'Full Name', value: `${user.firstName} ${user.lastName}`, icon: <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
                                { label: 'Email', value: user.email, icon: <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                                { label: 'Phone', value: user.phone || 'Not provided', icon: <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> },
                                { label: 'Department', value: user.department || 'Not assigned', icon: <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg> },
                                { label: 'Designation', value: user.designation || 'Not assigned', icon: <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                                { label: 'Company', value: 'Dayflow Inc.', icon: <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
                            ].map((item, idx) => (
                                <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                        {item.icon}
                                        <p style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                    </div>
                                    <p className="font-medium text-gray-800">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'private' && (
                    <div className="card p-6">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                            <svg style={{ width: '20px', height: '20px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            <h3 className="font-semibold text-gray-800">Private Information</h3>
                        </div>
                        {isEditing ? (
                            <div className="space-y-4" style={{ maxWidth: '450px' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                        <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        Phone Number
                                    </label>
                                    <input className="input" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} placeholder="+91 98765 43210" />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                        <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        Address
                                    </label>
                                    <textarea className="input" rows={3} value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} placeholder="Enter your address..." />
                                </div>
                                <div className="flex gap-3" style={{ paddingTop: '8px' }}>
                                    <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
                                    <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-2">
                                {[
                                    { label: 'Phone', value: user.phone || 'Not provided', icon: <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> },
                                    { label: 'Address', value: user.address || 'Not provided', icon: <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                                    { label: 'Date of Birth', value: user.dateOfBirth ? format(new Date(user.dateOfBirth), 'MMM d, yyyy') : 'Not provided', icon: <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg> },
                                    { label: 'Date of Joining', value: user.dateOfJoining ? format(new Date(user.dateOfJoining), 'MMM d, yyyy') : 'Not provided', icon: <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                                ].map((item, idx) => (
                                    <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                            {item.icon}
                                            <p style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                        </div>
                                        <p className="font-medium text-gray-800">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'salary' && isAdmin && payroll && (
                    <div className="card p-6">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <svg style={{ width: '20px', height: '20px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                <h3 className="font-semibold text-gray-800">Salary Structure</h3>
                            </div>
                            <span className="badge badge-purple">Admin Only</span>
                        </div>
                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Component</th>
                                        <th style={{ textAlign: 'right' }}>Monthly (₹)</th>
                                        <th style={{ textAlign: 'right' }}>Yearly (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>Basic Salary</td><td style={{ textAlign: 'right' }} className="font-medium">{payroll.basicSalary.toLocaleString()}</td><td style={{ textAlign: 'right' }} className="font-medium">{(payroll.basicSalary * 12).toLocaleString()}</td></tr>
                                    <tr><td>HRA</td><td style={{ textAlign: 'right' }} className="text-green-600">+{payroll.allowances.hra.toLocaleString()}</td><td style={{ textAlign: 'right' }} className="text-green-600">+{(payroll.allowances.hra * 12).toLocaleString()}</td></tr>
                                    <tr><td>Tax</td><td style={{ textAlign: 'right' }} className="text-red-600">-{payroll.deductions.tax.toLocaleString()}</td><td style={{ textAlign: 'right' }} className="text-red-600">-{(payroll.deductions.tax * 12).toLocaleString()}</td></tr>
                                    <tr><td>PF</td><td style={{ textAlign: 'right' }} className="text-red-600">-{payroll.deductions.pf.toLocaleString()}</td><td style={{ textAlign: 'right' }} className="text-red-600">-{(payroll.deductions.pf * 12).toLocaleString()}</td></tr>
                                    <tr style={{ background: '#f3e8ff' }}><td className="font-bold" style={{ color: '#7c3aed' }}>Net Salary</td><td style={{ textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>₹{payroll.netSalary.toLocaleString()}</td><td style={{ textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>₹{(payroll.netSalary * 12).toLocaleString()}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
