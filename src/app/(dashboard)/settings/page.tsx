'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { adminSettingsApi } from '@/lib/api';

export default function SettingsPage() {
    //const { t } = useI18n();
    const { user } = useAuth();
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [loading, setLoading] = useState(false);
    const { t, isAr } = useI18n();
    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        if (newPass !== confirmPass) { toast.error(isAr ? 'كلمة المرور غير متطابقة' : 'Passwords do not match'); return; }
        if (newPass.length < 8) { toast.error(isAr ? 'كلمة المرور قصيرة' : 'Too short'); return; }
        setLoading(true);
        try {
            await adminSettingsApi.changePassword(currentPass, newPass);
            toast.success(isAr ? 'تم التحديث' : 'Password updated');
            setCurrentPass(''); setNewPass(''); setConfirmPass('');
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Failed');
        } finally { setLoading(false); }
    }

    function Section({ title, children }: any) {
        return (
            <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px', overflow: 'hidden',
                marginBottom: '16px',
            }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: '#52525b', letterSpacing: '0.08em' }}>
                        {title}
                    </p>
                </div>
                <div style={{ padding: '20px 24px' }}>{children}</div>
            </div>
        );
    }

    function Field({ label, type, value, onChange, placeholder }: any) {
        return (
            <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#71717a', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    {label.toUpperCase()}
                </label>
                <input
                    type={type} value={value} onChange={onChange} placeholder={placeholder}
                    style={{
                        width: '100%', height: '40px', padding: '0 14px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px', color: '#e4e4e7',
                        fontSize: '13px', outline: 'none',
                        boxSizing: 'border-box', fontFamily: 'inherit',
                    }}
                />
            </div>
        );
    }

    return (
        <>
            <Header title={t.settings} />
            <div style={{ padding: '28px 32px', maxWidth: '680px' }}>

                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{t.settings}</h2>
                    <p style={{ fontSize: '13px', color: '#52525b' }}>{t.manageAccount}</p>
                </div>

                {/* Profile */}
                <Section title={t.profile}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '48px', height: '48px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            borderRadius: '12px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: '700', color: '#fff',
                        }}>
                            {user?.email?.[0]?.toUpperCase() ?? 'A'}
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#e4e4e7' }}>{user?.email}</p>
                            <span style={{
                                fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                                background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: '500',
                            }}>
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </Section>

                {/* Password */}
                <Section title={t.changePassword}>
                    <form onSubmit={handleChangePassword}>
                        <Field label={t.currentPass} type="password" value={currentPass} onChange={(e: any) => setCurrentPass(e.target.value)} placeholder="••••••••" />
                        <Field label={t.newPass} type="password" value={newPass} onChange={(e: any) => setNewPass(e.target.value)} placeholder="••••••••" />
                        <Field label={t.confirmPass} type="password" value={confirmPass} onChange={(e: any) => setConfirmPass(e.target.value)} placeholder="••••••••" />
                        <button type="submit" disabled={loading} style={{
                            padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                            background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 4px 12px rgba(99,102,241,0.25)',
                            transition: 'all 0.2s',
                        }}>
                            {loading ? '...' : t.updatePassword}
                        </button>
                    </form>
                </Section>

                {/* API Info */}
                <Section title={t.apiConfig}>
                    {[
                        { label: t.backendURL, value: process.env.NEXT_PUBLIC_API_URL },
                        { label: t.version, value: 'v1.0.0' },
                        { label: t.environment, value: t.development },
                    ].map(({ label, value }) => (
                        <div key={label} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}>
                            <span style={{ fontSize: '12px', color: '#71717a' }}>{label}</span>
                            <span style={{ fontSize: '12px', color: '#a1a1aa', fontFamily: 'monospace' }}>{value}</span>
                        </div>
                    ))}
                </Section>

            </div>
        </>
    );
}