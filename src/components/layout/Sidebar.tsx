'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';

import { useTheme } from '@/lib/theme';


export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { t, isAr } = useI18n();
    const { theme } = useTheme();
    const compact = theme.sidebarSize === 'compact';
    const nav = [
        {
            label: isAr ? 'عام' : 'OVERVIEW',
            items: [
                { href: '/dashboard', label: t.dashboard, icon: '▦' },
            ],
        },
        {
            label: isAr ? 'العمليات' : 'OPERATIONS',
            items: [
                { href: '/live-ops', label: t.liveOps },
                { href: '/sham-cash-queue', label: isAr ? 'طابور شام كاش' : 'Sham Cash' },
                { href: '/safety-sos', label: isAr ? 'مكتب SOS' : 'SOS Desk' },
                { href: '/finance', label: isAr ? 'المالية' : 'Finance' },
                { href: '/payouts', label: isAr ? 'المدفوعات' : 'Payouts' },
                { href: '/kyc', label: isAr ? 'طابور KYC' : 'KYC Queue' },
                { href: '/fraud', label: isAr ? 'الاحتيال' : 'Fraud Desk' },
                { href: '/drivers', label: t.drivers },
                { href: '/documents', label: t.documents },
                { href: '/rides', label: t.rides },
                { href: '/earnings', label: t.earnings },
                { href: '/passengers', label: isAr ? 'الركاب' : 'Passengers' },
                { href: '/subscriptions', label: isAr ? 'الاشتراكات' : 'Subscriptions' },
                { href: '/promotions', label: isAr ? 'العروض' : 'Promotions' },
                { href: '/analytics', label: isAr ? 'التحليلات' : 'Analytics' },
                { href: '/complaints', label: isAr ? 'الشكاوى' : 'Complaints' },
                { href: '/privacy-dsr', label: isAr ? 'خصوصية DSR' : 'Privacy DSR' },
                { href: '/support-chat', label: isAr ? 'دردشة الدعم' : 'Support Chat' },
                { href: '/pricing', label: isAr ? 'التسعير' : 'Pricing' },
            ],
        },
        {
            label: isAr ? 'النظام' : 'SYSTEM',
            items: [
                { href: '/audit', label: isAr ? 'سجل التدقيق' : 'Audit Logs' },
                { href: '/settings', label: t.settings },
            ],
        },
    ];

    const icons: Record<string, React.ReactNode> = {
        '/dashboard': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
        '/live-ops': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" /></svg>,
        '/sham-cash-queue': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
        '/safety-sos': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
        '/finance': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
        '/payouts': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
        '/kyc': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>,
        '/fraud': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
        '/audit': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
        '/drivers': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
        '/documents': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
        '/rides': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v4h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
        '/earnings': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
        // في icons object
        '/passengers': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4" /><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /></svg>,
        '/subscriptions': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
        '/promotions': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
        '/analytics': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,

        // icon:
        '/complaints': <svg width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>,
        '/privacy-dsr': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
        '/support-chat': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
        '/pricing': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    };

    return (

        <aside style={{
            width: compact ? '68px' : '260px',
            transition: 'width 0.3s ease',
            overflow: 'hidden',
            position: 'fixed',
            inset: '0 auto 0 0',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(10,10,15,0.95)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
        }}>

            {/* Logo */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '22px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div style={{
                    width: '36px', height: '36px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
                    flexShrink: 0,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                </div>

                {/*} <div style={{ display: compact ? 'none' : 'block' }}>
                    <p>NovaRide</p>
                    <p>{t.adminConsole}</p>
                </div>*/}
                <div>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', lineHeight: 1.2 }}>
                        NovaRide
                    </p>
                    <p style={{ fontSize: '11px', color: '#52525b' }}>{t.adminConsole}</p>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                {nav.map((group) => (
                    <div key={group.label} style={{ marginBottom: '20px' }}>
                        <p style={{
                            fontSize: '10px', fontWeight: '600', color: '#3f3f46',
                            letterSpacing: '0.08em', padding: '0 10px', marginBottom: '4px',
                        }}>
                            {group.label}
                        </p>
                        {group.items.map(({ href, label }) => {
                            const active = pathname === href || pathname.startsWith(href + '/');
                            return (
                                <Link key={href} href={href} style={{ textDecoration: 'none' }}>


                                    {/*<div style={{
                                        display: 'flex', alignItems: 'center',
                                        gap: compact ? 0 : '10px',
                                        justifyContent: compact ? 'center' : 'flex-start',
                                        padding: compact ? '8px' : '8px 10px',
                                        cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#a1a1aa'; } }}
                                        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#71717a'; } }}
                                    >
                                        <span>{icons[href]}</span>
                                        {!compact && label}
                                    </div>*/}

                                    <div
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '8px 10px', borderRadius: '9px', marginBottom: '1px',
                                            background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                                            border: `1px solid ${active ? 'rgba(99,102,241,0.2)' : 'transparent'}`,
                                            color: active ? '#818cf8' : '#71717a',
                                            fontSize: '13px', fontWeight: active ? '500' : '400',
                                            cursor: 'pointer', transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#a1a1aa'; } }}
                                        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#71717a'; } }}
                                    >
                                        <span style={{ flexShrink: 0 }}>{icons[href] ?? <span style={{ width: 15, display: 'inline-block' }}>•</span>}</span>
                                        {label}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ))}

            </nav>

            {/* User */}
            <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px', marginBottom: '4px',
                }}>
                    <div style={{
                        width: '30px', height: '30px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '8px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0,
                    }}>
                        {user?.email?.[0]?.toUpperCase() ?? 'A'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: '500', color: '#d4d4d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email ?? 'Admin'}
                        </p>
                        <p style={{ fontSize: '10px', color: '#52525b' }}>{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={() => { auth.clear(); router.replace('/login'); }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', padding: '8px 10px',
                        background: 'none', border: 'none', borderRadius: '8px',
                        cursor: 'pointer', color: '#52525b', fontSize: '13px', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#52525b'; }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {t.signOut}
                </button>
            </div>
        </aside >
    );
}