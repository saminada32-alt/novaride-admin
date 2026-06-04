'use client';

import { useI18n } from '@/lib/i18n';

export function LangToggle() {
    const { lang, setLang } = useI18n();

    return (
        <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                color: '#a1a1aa',
                transition: 'all 0.2s',
                letterSpacing: '0.02em',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)';
                (e.currentTarget as HTMLElement).style.color = '#818cf8';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLElement).style.color = '#a1a1aa';
            }}
        >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {lang === 'en' ? 'العربية' : 'English'}
        </button>
    );
}