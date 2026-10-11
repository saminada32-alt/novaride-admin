'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { NAV_GROUPS } from '@/lib/nav';
import { pendingCounts, useOpsDashboard } from '@/hooks/useOpsDashboard';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { t, isAr } = useI18n();
    const { theme } = useTheme();
    const compact = theme.sidebarSize === 'compact';
    const { data } = useOpsDashboard();
    const counts = pendingCounts(data);

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
        '/passengers': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4" /><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /></svg>,
        '/wallet': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4z" /></svg>,
        '/promotions': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
        '/analytics': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
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
            background: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--border)',
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: compact ? '22px 16px' : '22px 20px',
                borderBottom: '1px solid var(--border)',
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
                {!compact && (
                    <div>
                        <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-1)', lineHeight: 1.2 }}>
                            NovaRide
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-4)' }}>{t.adminConsole}</p>
                    </div>
                )}
            </div>

            <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
                {NAV_GROUPS.map((group) => (
                    <div key={group.id} style={{ marginBottom: '18px' }}>
                        {!compact && (
                            <p style={{
                                fontSize: '11px', fontWeight: '700', color: 'var(--text-4)',
                                padding: '0 10px', marginBottom: '6px',
                            }}>
                                {isAr ? group.ar : group.en}
                            </p>
                        )}
                        {group.items.map((item) => {
                            const active = pathname === item.href || pathname.startsWith(item.href + '/');
                            const label = isAr ? item.ar : item.en;
                            const count = item.badge ? counts[item.badge] : 0;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={isAr ? item.descAr : item.descEn}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div
                                        style={{
                                            position: 'relative',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: compact ? 'center' : 'flex-start',
                                            gap: '10px',
                                            padding: compact ? '10px' : '8px 10px',
                                            borderRadius: '9px', marginBottom: '2px',
                                            background: active ? 'var(--accent-glow)' : 'transparent',
                                            border: `1px solid ${active ? 'var(--accent)' : 'transparent'}`,
                                            color: active ? 'var(--accent-2)' : 'var(--text-2)',
                                            fontSize: '13px', fontWeight: active ? 600 : 400,
                                            cursor: 'pointer', transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                    >
                                        <span style={{ flexShrink: 0, display: 'flex' }}>
                                            {icons[item.href] ?? <span style={{ width: 15, display: 'inline-block' }}>•</span>}
                                        </span>
                                        {!compact && <span style={{ flex: 1 }}>{label}</span>}
                                        {count > 0 && (
                                            <span style={compact ? {
                                                position: 'absolute', top: 5, right: 7,
                                                width: 8, height: 8, borderRadius: '50%', background: '#f59e0b',
                                            } : {
                                                minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10,
                                                background: '#f59e0b', color: '#1c1917',
                                                fontSize: 11, fontWeight: 700,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {compact ? '' : count > 99 ? '99+' : count}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                {!compact && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px',
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--border)',
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
                            <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.email ?? 'Admin'}
                            </p>
                            <p style={{ fontSize: '10px', color: 'var(--text-4)' }}>{user?.role}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => { auth.clear(); router.replace('/login'); }}
                    title={t.signOut}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: compact ? 'center' : 'flex-start', gap: '8px',
                        width: '100%', padding: '8px 10px',
                        background: 'none', border: 'none', borderRadius: '8px',
                        cursor: 'pointer', color: 'var(--text-3)', fontSize: '13px', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {!compact && t.signOut}
                </button>
            </div>
        </aside>
    );
}
