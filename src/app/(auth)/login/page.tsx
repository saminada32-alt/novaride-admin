'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
    const router = useRouter();
    const { isAr } = useI18n();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [mfaStep, setMfaStep] = useState(false);
    const [totpCode, setTotpCode] = useState('');

    // ─── إذا مسجّل دخول رح مباشرة ────────────────────────────
    useEffect(() => {
        if (auth.isLoggedIn()) router.replace('/dashboard');
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        try {
            const res = await adminApi.login(email, password, mfaStep ? totpCode : undefined);
            if (res.data.mfaRequired) {
                setMfaStep(true);
                toast.message('Enter your authenticator code');
                return;
            }
            auth.setToken(res.data.access_token);
            auth.setUser(res.data.admin);
            toast.success('Welcome back!');
            router.replace('/dashboard');
        } catch (err: any) {
            const code = err.response?.data?.code;
            if (!err.response) {
                toast.error(isAr
                    ? 'تعذّر الاتصال بالسيرفر. تأكد من نشر الأدمن بآخر إصلاح.'
                    : 'Cannot reach API server. Redeploy admin with the latest login fix.');
                return;
            }
            if (code === 'MFA_SETUP_REQUIRED') {
                toast.error('MFA setup required. Contact superadmin or use Settings after login.');
            } else {
                toast.error(err.response?.data?.message ?? 'Invalid credentials');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f11 0%, #13131a 50%, #0f0f11 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>

            {/* Card */}
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '48px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
            }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '52px',
                        height: '52px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                                fill="white" stroke="white" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        color: '#fff',
                        margin: '0 0 6px',
                        letterSpacing: '-0.3px',
                    }}>
                        NovaRide
                    </h1>
                    <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
                        Admin Console
                    </p>
                </div>

                {/* Divider */}
                <div style={{
                    height: '1px',
                    background: 'rgba(255,255,255,0.06)',
                    marginBottom: '32px',
                }} />

                {/* Form */}
                <form onSubmit={handleSubmit}>

                    {/* Email */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#a1a1aa',
                            marginBottom: '8px',
                            letterSpacing: '0.02em',
                        }}>
                            EMAIL ADDRESS
                        </label>
                        <div style={{ position: 'relative' }}>
                            <svg style={{
                                position: 'absolute', left: '14px',
                                top: '50%', transform: 'translateY(-50%)',
                                color: '#52525b', pointerEvents: 'none',
                            }} width="15" height="15" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@novaride.com"
                                required
                                autoFocus
                                style={{
                                    width: '100%',
                                    height: '46px',
                                    paddingLeft: '40px',
                                    paddingRight: '16px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px',
                                    color: '#fafafa',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                }}
                                onFocus={e => {
                                    e.target.style.border = '1px solid rgba(99,102,241,0.5)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.border = '1px solid rgba(255,255,255,0.08)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#a1a1aa',
                            marginBottom: '8px',
                            letterSpacing: '0.02em',
                        }}>
                            PASSWORD
                        </label>
                        <div style={{ position: 'relative' }}>
                            <svg style={{
                                position: 'absolute', left: '14px',
                                top: '50%', transform: 'translateY(-50%)',
                                color: '#52525b', pointerEvents: 'none',
                            }} width="15" height="15" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%',
                                    height: '46px',
                                    paddingLeft: '40px',
                                    paddingRight: '44px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '12px',
                                    color: '#fafafa',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                }}
                                onFocus={e => {
                                    e.target.style.border = '1px solid rgba(99,102,241,0.5)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.border = '1px solid rgba(255,255,255,0.08)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                style={{
                                    position: 'absolute', right: '14px',
                                    top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none',
                                    color: '#52525b', cursor: 'pointer',
                                    padding: '4px', display: 'flex',
                                }}
                            >
                                {showPass ? (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {mfaStep && (
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                                AUTHENTICATOR CODE
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                placeholder="000000"
                                required
                                autoFocus
                                style={{
                                    width: '100%', height: 46, padding: '0 16px',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: 12, color: '#fafafa', fontSize: 18,
                                    letterSpacing: 6, textAlign: 'center', boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    )}

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            height: '46px',
                            background: loading
                                ? 'rgba(99,102,241,0.5)'
                                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.3)',
                            fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => {
                            if (!loading) {
                                (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                                (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)';
                            }
                        }}
                        onMouseLeave={e => {
                            (e.target as HTMLElement).style.transform = 'translateY(0)';
                            (e.target as HTMLElement).style.boxShadow = loading ? 'none' : '0 4px 16px rgba(99,102,241,0.3)';
                        }}
                    >
                        {loading ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2"
                                    style={{ animation: 'spin 1s linear infinite' }}>
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign in
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>

                </form>

                {/* Footer */}
                <p style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#3f3f46',
                    marginTop: '28px',
                    marginBottom: 0,
                }}>
                    Authorized personnel only · NovaRide © 2026
                </p>

            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input::placeholder { color: #3f3f46; }
        * { box-sizing: border-box; }
      `}</style>
        </div>
    );
}