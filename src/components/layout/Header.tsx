'use client';

import { LangToggle } from '@/components/ui/LangToggle';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { MarketSelector } from '@/components/layout/MarketSelector';
import { useI18n } from '@/lib/i18n';
import { useRealtime } from '@/lib/realtime';

interface HeaderProps { title?: string; subtitle?: string; }

export function Header({ title, subtitle }: HeaderProps) {
    const { isAr } = useI18n();
    const { connected } = useRealtime();

    return (
        <header style={{
            height: '58px',
            position: 'sticky', top: 0, zIndex: 30,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            background: 'rgba(10,10,15,0.9)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h1 style={{
                    fontSize: '15px', fontWeight: '600',
                    color: '#e4e4e7', letterSpacing: '-0.2px',
                }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{ fontSize: '11px', color: '#71717a' }}>{subtitle}</p>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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