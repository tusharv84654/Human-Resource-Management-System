'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && user) {
            router.push(user.role === 'employee' ? '/dashboard' : '/admin');
        }
    }, [isAuthenticated, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill in all fields'); return; }
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);
        if (result.success) toast.success('Welcome back!');
        else toast.error(result.error || 'Login failed');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left - Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', background: 'white' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)', overflow: 'hidden' }}>
                            <Image src="/logo.png" alt="Dayflow" width={40} height={40} style={{ objectFit: 'contain' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937' }}>Dayflow</h1>
                            <p style={{ fontSize: '13px', color: '#6b7280' }}>HR Management System</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Welcome back!
                            <svg style={{ width: '28px', height: '28px', color: '#f59e0b' }} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </h2>
                        <p style={{ color: '#6b7280', marginTop: '8px' }}>Sign in to your account to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Email Address
                            </label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" style={{ paddingRight: '44px' }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                                    <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ padding: '14px', marginTop: '8px' }}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div style={{ marginTop: '32px', padding: '20px', background: '#f5f3ff', borderRadius: '12px', border: '1px solid #ede9fe' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#7c3aed', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Demo Credentials
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                            {[
                                { role: 'Admin', email: 'admin@hrms.com', pass: 'Admin@123' },
                                { role: 'HR', email: 'hr@hrms.com', pass: 'Admin@123' },
                                { role: 'Employee', email: 'amit@hrms.com', pass: 'Employee@123' },
                            ].map((cred, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: '8px' }}>
                                    <span className="badge badge-purple">{cred.role}</span>
                                    <span style={{ color: '#6b7280' }}>{cred.email} / {cred.pass}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sign up link */}
                    <p style={{ marginTop: '32px', textAlign: 'center', color: '#6b7280' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" style={{ color: '#8b5cf6', fontWeight: 600 }}>Sign up</Link>
                    </p>
                </div>
            </div>

            {/* Right - Illustration */}
            <div style={{ flex: 1, background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '40px', left: '40px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '60px', right: '60px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(80px)' }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', padding: '48px' }}>
                    <div style={{ width: '88px', height: '88px', borderRadius: '24px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', overflow: 'hidden' }}>
                        <Image src="/logo.png" alt="Dayflow" width={60} height={60} style={{ objectFit: 'contain' }} />
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>Streamline Your HR Operations</h2>
                    <p style={{ opacity: 0.8, maxWidth: '400px', fontSize: '16px', lineHeight: 1.6 }}>
                        Manage attendance, track leaves, process payroll, and empower your team with our modern HR platform.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '40px' }}>
                        {[
                            { icon: <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Attendance' },
                            { icon: <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, label: 'Leaves' },
                            { icon: <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, label: 'Payroll' },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {item.icon}
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
