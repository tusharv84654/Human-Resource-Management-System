'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const features = [
    {
      icon: <svg style={{ width: '28px', height: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      title: 'Time & Attendance',
      desc: 'Real-time attendance tracking with biometric integration, geo-fencing, and automated reports.',
      color: '#8b5cf6'
    },
    {
      icon: <svg style={{ width: '28px', height: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      title: 'Leave Management',
      desc: 'Streamlined leave requests with automated approval workflows and balance tracking.',
      color: '#14b8a6'
    },
    {
      icon: <svg style={{ width: '28px', height: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      title: 'Payroll Processing',
      desc: 'Automated salary calculations with tax compliance, deductions, and pay slip generation.',
      color: '#3b82f6'
    },
    {
      icon: <svg style={{ width: '28px', height: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      title: 'HR Analytics',
      desc: 'Powerful insights with dashboards, workforce analytics, and custom reporting.',
      color: '#ec4899'
    },
  ];

  const stats = [
    { value: '99.9%', label: 'System Uptime', sublabel: 'Enterprise reliability' },
    { value: '50k+', label: 'Active Users', sublabel: 'Trusted worldwide' },
    { value: '4.9/5', label: 'User Rating', sublabel: 'On G2 & Capterra' },
    { value: '24/7', label: 'Support', sublabel: 'Always available' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)', overflow: 'hidden' }}>
              <Image src="/logo.png" alt="Dayflow" width={32} height={32} style={{ objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937' }}>Dayflow</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#features" style={{ color: '#6b7280', fontWeight: 500, fontSize: '15px' }}>Features</a>
            <a href="#pricing" style={{ color: '#6b7280', fontWeight: 500, fontSize: '15px' }}>Pricing</a>
            <a href="#about" style={{ color: '#6b7280', fontWeight: 500, fontSize: '15px' }}>About</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/login" style={{ padding: '10px 20px', color: '#6b7280', fontWeight: 500, fontSize: '15px' }}>Sign In</Link>
            <Link href="/signup" className="btn btn-primary">Get Started Free</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(180deg, #f8f7ff 0%, #fafafa 100%)', padding: '80px 32px 100px', position: 'relative', overflow: 'hidden' }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(20, 184, 166, 0.08) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div className={mounted ? 'animate-fadeIn' : ''} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', borderRadius: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} />
              <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>Trusted by 5,000+ companies worldwide</span>
            </div>

            <h1 className={mounted ? 'animate-fadeIn' : ''} style={{ fontSize: '56px', fontWeight: 800, color: '#1f2937', lineHeight: 1.15, marginBottom: '24px' }}>
              The Modern Platform for
              <span style={{ display: 'block', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HR Excellence</span>
            </h1>

            <p className={mounted ? 'animate-fadeIn' : ''} style={{ fontSize: '20px', color: '#6b7280', lineHeight: 1.7, marginBottom: '40px' }}>
              Streamline your HR operations with our all-in-one platform. From attendance tracking to payroll processing, empower your team with the tools they deserve.
            </p>

            <div className={mounted ? 'animate-fadeIn' : ''} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '48px' }}>
              <Link href="/signup" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Start Free Trial
                <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <Link href="/login" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '16px' }}>
                View Demo
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', padding: '32px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
              {stats.map((stat, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '32px', fontWeight: 700, color: '#8b5cf6' }}>{stat.value}</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginTop: '4px' }}>{stat.label}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>{stat.sublabel}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 32px', background: 'white' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', background: '#f3e8ff', color: '#7c3aed', fontSize: '13px', fontWeight: 600, borderRadius: '20px', marginBottom: '16px' }}>FEATURES</span>
            <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>Everything You Need</h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>A complete HR management solution designed for modern businesses of all sizes.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {features.map((feature, i) => (
              <div key={i} className="card" style={{ padding: '32px', textAlign: 'center', transition: 'all 0.3s', cursor: 'pointer' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `${feature.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '100px 32px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', opacity: 0.1, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 700, color: 'white', marginBottom: '20px' }}>Ready to Transform Your HR?</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '40px' }}>
            Join thousands of companies already using Dayflow to streamline their workforce management.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Link href="/signup" style={{ padding: '16px 40px', background: 'white', color: '#8b5cf6', fontWeight: 600, borderRadius: '10px', fontSize: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              Start Free Trial
            </Link>
            <Link href="/login" style={{ padding: '16px 40px', background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 500, borderRadius: '10px', fontSize: '16px', border: '1px solid rgba(255,255,255,0.3)' }}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '64px 32px 32px', background: '#1f2937' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <Image src="/logo.png" alt="Dayflow" width={28} height={28} style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ fontSize: '20px', fontWeight: 600, color: 'white' }}>Dayflow</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.7, maxWidth: '280px' }}>
                The modern HR platform that helps you manage your workforce efficiently and effectively.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
            ].map((section, i) => (
              <div key={i}>
                <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '16px' }}>{section.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {section.links.map((link, j) => (
                    <a key={j} href="#" style={{ color: '#9ca3af', fontSize: '14px' }}>{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #374151', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>© 2026 Dayflow. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {['twitter', 'linkedin', 'github'].map((social, i) => (
                <a key={i} href="#" style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  <svg style={{ width: '18px', height: '18px' }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
