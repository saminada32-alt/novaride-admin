'use client';

import { LangToggle } from '@/components/ui/LangToggle';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { MarketSelector } from '@/components/layout/MarketSelector';
import { useI18n } from '@/lib/i18n';
import { useRealtime } from '@/lib/realtime';
import { useTheme } from '@/lib/theme';

interface HeaderProps { title?: string; subtitle?: string; }

export function Header({ title, subtitle }: HeaderProps) {
    const { isAr } = useI18n();
    const { connected } = useRealtime();
    const { theme, update } = useTheme();
    const isLight = theme.mode === 'light';

    function toggleTheme() {
        update({ mode: isLight ? 'dark' : 'light' });
    }

    return (
        <header style={{
            height: '58px',
            position: 'sticky', top: 0, zIndex: 30,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            background: 'var(--header-bg, rgba(10,10,15,0.9))',
            borderBottom: '1px solid var(--border, rgba(255,255,255,0.06))',
            backdropFilter: 'blur(20px)',
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h1 style={{
                    fontSize: '15px', fontWeight: '600',
                    color: 'var(--text-1, #e4e4e7)', letterSpacing: '-0.2px',
                }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{ fontSize: '11px', color: 'var(--text-3, #71717a)' }}>{subtitle}</p>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    type="button"
                    onClick={toggleTheme}
                    title={isLight ? (isAr ? 'الوضع الداكن' : 'Dark mode') : (isAr ? 'الوضع الفاتح' : 'Light mode')}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 34, height: 34, borderRadius: 10, cursor: 'pointer',
                        background: 'var(--bg-hover, rgba(255,255,255,0.04))',
                        border: '1px solid var(--border, rgba(255,255,255,0.08))',
                        color: 'var(--text-2, #a1a1aa)',
                    }}
                >
                    {isLight ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    )}
                </button>
                <MarketSelector />
                <LangToggle />
                <NotificationBell />
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '5px 10px',
                    background: connected ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                    border: connected ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(239,68,68,0.15)',
                    borderRadius: '20px',
                    fontSize: '11px', color: connected ? '#4ade80' : '#f87171', fontWeight: '600',
                }}>
                    <div style={{
                        width: '6px', height: '6px',
                        background: connected ? '#22c55e' : '#ef4444',
                        borderRadius: '50%',
                        boxShadow: connected ? '0 0 6px #22c55e' : 'none',
                        animation: connected ? 'pulse 2s infinite' : 'none',
                    }} />
                    {connected ? 'LIVE' : (isAr ? 'غير متصل' : 'OFFLINE')}
                </div>
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        </header>
    );
}