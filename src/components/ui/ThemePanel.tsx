'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme, ColorAccent, PanelMode, FontSize, Radius, Density, SidebarSize } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';

const ACCENT_COLORS: { key: ColorAccent; color: string }[] = [
    { key: 'indigo', color: '#6366f1' },
    { key: 'violet', color: '#8b5cf6' },
    { key: 'cyan', color: '#06b6d4' },
    { key: 'emerald', color: '#10b981' },
    { key: 'rose', color: '#f43f5e' },
    { key: 'amber', color: '#f59e0b' },
];

const MODES: { key: PanelMode; label: string; labelAr: string; icon: string }[] = [
    { key: 'dark', label: 'Dark', labelAr: 'داكن', icon: '🌙' },
    { key: 'midnight', label: 'Midnight', labelAr: 'منتصف الليل', icon: '🌌' },
    { key: 'dim', label: 'Dim', labelAr: 'خافت', icon: '🌫️' },
    { key: 'light', label: 'Light', labelAr: 'فاتح', icon: '☀️' },
];

function ThemeRow({ label, labelAr, isAr, children }: { label: string; labelAr: string; isAr: boolean; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '18px' }}>
            <p style={{
                fontSize: '10px', fontWeight: '700', color: 'var(--text-4)',
                letterSpacing: '0.08em', marginBottom: '8px',
            }}>{isAr ? labelAr : label}</p>
            {children}
        </div>
    );
}

function ThemeOptionBtn({ active, onClick, children, style }: { active: boolean; onClick: () => void; children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accent-glow)' : 'var(--bg-hover)',
                color: active ? 'var(--accent-2)' : 'var(--text-3)',
                fontSize: '11px',
                fontWeight: active ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                transform: active ? 'scale(1.05)' : 'scale(1)',
                boxShadow: active ? `0 0 12px var(--accent-glow)` : 'none',
                ...style,
            }}
        >
            {children}
        </button>
    );
}

function ThemeToggle({ value, onChange, label, labelAr, isAr }: { value: boolean; onChange: (v: boolean) => void; label: string; labelAr: string; isAr: boolean }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0', borderBottom: '1px solid var(--border)',
        }}>
            <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{isAr ? labelAr : label}</span>
            <button
                onClick={() => onChange(!value)}
                style={{
                    width: '40px', height: '22px', borderRadius: '99px',
                    background: value ? 'var(--accent)' : 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer', position: 'relative',
                    transition: 'background var(--transition)',
                }}
            >
                <div style={{
                    position: 'absolute', top: '2px',
                    left: value ? '18px' : '2px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: value ? '#fff' : 'var(--text-4)',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
            </button>
        </div>
    );
}

export function ThemePanelV2() {
    const { theme, update, reset } = useTheme();
    const { isAr } = useI18n();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999 }}>
            {/* Panel */}
            {open && (
                <div style={{
                    position: 'absolute', bottom: 'calc(100% + 12px)', left: 0,
                    width: '280px', background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                    overflow: 'hidden', animation: 'slideUp 0.25s ease',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 18px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'var(--bg-hover)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '24px', height: '24px', borderRadius: '7px',
                                background: 'var(--accent)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '12px', fontWeight: '800', color: '#fff',
                            }}>N</div>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-1)' }}>
                                {isAr ? 'تخصيص المظهر' : 'Customize'}
                            </p>
                        </div>
                        <button onClick={reset} style={{
                            fontSize: '10px', color: 'var(--text-4)',
                            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px',
                            transition: 'all 0.2s',
                        }}> {isAr ? 'إعادة تعيين' : 'Reset'} </button>
                    </div>

                    <div style={{ padding: '16px 18px', maxHeight: '70vh', overflowY: 'auto' }}>
                        {/* Mode */}
                        <ThemeRow label="APPEARANCE" labelAr="المظهر" isAr={isAr}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                {MODES.map(m => (
                                    <ThemeOptionBtn key={m.key} active={theme.mode === m.key} onClick={() => update({ mode: m.key })}>
                                        {m.icon} {isAr ? m.labelAr : m.label}
                                    </ThemeOptionBtn>
                                ))}
                            </div>
                        </ThemeRow>

                        {/* Accent */}
                        <ThemeRow label="ACCENT COLOR" labelAr="لون التمييز" isAr={isAr}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {ACCENT_COLORS.map(({ key, color }) => (
                                    <button key={key} onClick={() => update({ accent: key })} style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: color, border: 'none', cursor: 'pointer',
                                        outline: theme.accent === key ? `3px solid ${color}` : 'none',
                                        transform: theme.accent === key ? 'scale(1.2)' : 'scale(1)',
                                        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                                        boxShadow: theme.accent === key ? `0 0 12px ${color}60` : 'none',
                                    }} />
                                ))}
                            </div>
                        </ThemeRow>

                        {/* Toggles */}
                        <ThemeRow label="EFFECTS" labelAr="التأثيرات" isAr={isAr}>
                            <ThemeToggle value={theme.animations} onChange={(v) => update({ animations: v })} label="Animations" labelAr="الحركات" isAr={isAr} />
                            <ThemeToggle value={theme.blur} onChange={(v) => update({ blur: v })} label="Blur Effects" labelAr="تأثير الضبابية" isAr={isAr} />
                        </ThemeRow>
                    </div>
                </div>
            )}

            {/* FAB */}
            <button onClick={() => setOpen(!open)} style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: open ? 'var(--accent)' : 'var(--bg-card)',
                border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
                boxShadow: open ? '0 8px 24px var(--accent-glow)' : '0 4px 16px rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
                onMouseEnter={e => {
                    if (!open) e.currentTarget.style.boxShadow = '0 10px 28px var(--accent-glow)';
                }}
                onMouseLeave={e => {
                    if (!open) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)';
                }}
            >
                {open ? '✖' : 'N'}
            </button>

            <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
        </div>
    );
}