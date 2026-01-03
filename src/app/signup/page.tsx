'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [generatedId, setGeneratedId] = useState('');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { signup, isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && user) {
            router.push(user.role === 'employee' ? '/dashboard' : '/admin');
        }
    }, [isAuthenticated, user, router]);

    // Auto-generate Login ID based on name
    useEffect(() => {
        if (formData.firstName && formData.lastName) {
            const year = new Date().getFullYear();
            const firstInitials = formData.firstName.substring(0, 2).toUpperCase();
            const lastInitials = formData.lastName.substring(0, 2).toUpperCase();
            const serial = Math.floor(Math.random() * 9000) + 1000;
            setGeneratedId(`${firstInitials}${lastInitials}${year}${serial}`);
        } else {
            setGeneratedId('');
        }
    }, [formData.firstName, formData.lastName]);

    // Password strength calculation
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(formData.password);
    const strengthColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Logo must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
                toast.success('Logo uploaded successfully!');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { firstName, lastName, email, password, confirmPassword } = formData;

        if (!firstName || !lastName || !email || !password) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        const result = await signup({
            employeeId: generatedId,
            firstName,
            lastName,
            email,
            password,
            role: 'employee',
        });
        setIsLoading(false);

        if (result.success) {
            toast.success('Account created! Please login.');
            router.push('/login');
        } else {
            toast.error(result.error || 'Registration failed');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left - Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'white', overflowY: 'auto' }}>
                <div style={{ width: '100%', maxWidth: '440px' }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)', overflow: 'hidden' }}>
                            <Image src="/logo.png" alt="Dayflow" width={40} height={40} style={{ objectFit: 'contain' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937' }}>Dayflow</h1>
                            <p style={{ fontSize: '13px', color: '#6b7280' }}>HR Management System</p>
                        </div>
                    </Link>

                    {/* Title */}
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>Create Account</h2>
                        <p style={{ color: '#6b7280', marginTop: '8px' }}>Fill in your details to get started</p>
                    </div>

                    {/* Info Box */}
                    <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fcd34d' }}>
                        <p style={{ fontSize: '13px', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <svg style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '2px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span><strong>Note:</strong> Login ID will be auto-generated based on your name and joining year.</span>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {/* Company Name with Logo Upload */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                Company Name
                            </label>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Your company name"
                                    className="input"
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    style={{ display: 'none' }}
                                />
                                {logoPreview ? (
                                    <div style={{ position: 'relative' }}>
                                        <img src={logoPreview} alt="Logo" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #8b5cf6' }} />
                                        <button
                                            type="button"
                                            onClick={() => setLogoPreview(null)}
                                            style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ padding: '10px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#6b7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                                    >
                                        <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Upload Logo
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Name Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                    <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    First Name *
                                </label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className="input" />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                    Last Name *
                                </label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className="input" />
                            </div>
                        </div>

                        {/* Generated Login ID */}
                        {generatedId && (
                            <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #86efac' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: '#166534' }}>Your Login ID (Auto-generated)</span>
                                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#15803d', fontFamily: 'monospace' }}>{generatedId}</span>
                                </div>
                                <p style={{ fontSize: '11px', color: '#4ade80', marginTop: '6px' }}>Format: First 2 letters of name + Year + Serial</p>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                Email Address *
                            </label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="input" />
                        </div>

                        {/* Phone */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                Phone Number
                            </label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="input" />
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Password *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="input"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: showPassword ? '#8b5cf6' : '#9ca3af', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }}
                                >
                                    {showPassword ? (
                                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                style={{
                                                    flex: 1,
                                                    height: '4px',
                                                    borderRadius: '2px',
                                                    background: passwordStrength >= level ? strengthColors[passwordStrength - 1] : '#e5e7eb',
                                                    transition: 'background 0.3s',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: strengthColors[passwordStrength - 1] || '#9ca3af', fontWeight: 500 }}>
                                            {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Enter password'}
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#6b7280' }}>
                                            <span style={{ color: formData.password.length >= 8 ? '#22c55e' : '#9ca3af' }}>8+ chars</span>
                                            <span style={{ color: /[A-Z]/.test(formData.password) ? '#22c55e' : '#9ca3af' }}>A-Z</span>
                                            <span style={{ color: /[0-9]/.test(formData.password) ? '#22c55e' : '#9ca3af' }}>0-9</span>
                                            <span style={{ color: /[!@#$%^&*]/.test(formData.password) ? '#22c55e' : '#9ca3af' }}>!@#</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                <svg style={{ width: '16px', height: '16px', color: '#8b5cf6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                Confirm Password *
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="input"
                                    style={{ paddingRight: '44px', borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword ? '#ef4444' : undefined }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: showConfirmPassword ? '#8b5cf6' : '#9ca3af', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }}
                                >
                                    {showConfirmPassword ? (
                                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Passwords do not match
                                </p>
                            )}
                            {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                <p style={{ fontSize: '12px', color: '#22c55e', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Passwords match
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ padding: '14px', marginTop: '8px' }}>
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p style={{ marginTop: '28px', textAlign: 'center', color: '#6b7280' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: '#8b5cf6', fontWeight: 600 }}>Sign In</Link>
                    </p>
                </div>
            </div>

            {/* Right - Illustration */}
            <div style={{ flex: 1, background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '40px', left: '40px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '60px', right: '60px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(80px)' }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', padding: '48px', maxWidth: '500px' }}>
                    <div style={{ width: '88px', height: '88px', borderRadius: '24px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', overflow: 'hidden' }}>
                        <Image src="/logo.png" alt="Dayflow" width={60} height={60} style={{ objectFit: 'contain' }} />
                    </div>
                    <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>Join Dayflow Today</h2>
                    <p style={{ opacity: 0.85, fontSize: '16px', lineHeight: 1.7, marginBottom: '40px' }}>
                        Create your account and start managing your HR operations with our comprehensive platform.
                    </p>

                    {/* Features */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {[
                            { icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Track Attendance' },
                            { icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, label: 'Manage Leaves' },
                            { icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, label: 'View Payroll' },
                            { icon: <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, label: 'Update Profile' },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                                {item.icon}
                                {item.label}
                            </div>
                        ))}
                    </div>

                    {/* ID Format Info */}
                    <div style={{ marginTop: '40px', padding: '16px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', textAlign: 'left', fontSize: '13px' }}>
                        <p style={{ fontWeight: 600, marginBottom: '8px' }}>Login ID Format:</p>
                        <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
                            <code style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>XX</code> - First 2 letters of employee name<br />
                            <code style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>YYYY</code> - Year of joining<br />
                            <code style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>NNNN</code> - Serial number
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
