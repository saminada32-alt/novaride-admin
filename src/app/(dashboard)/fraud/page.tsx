'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { fraudApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function FraudPage() {
    const { isAr } = useI18n();
    const [stats, setStats] = useState<any>(null);
    const [rules, setRules] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [s, r, a] = await Promise.all([
                fraudApi.getStats(),
                fraudApi.getRules(),
                fraudApi.getAlerts({ status: 'open', limit: 50 }),
            ]);
            setStats(s.data);
            setRules(Array.isArray(r.data) ? r.data : []);
            setAlerts(Array.isArray(a.data) ? a.data : []);
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function toggleRule(id: number, enabled: boolean) {
        try {
            await fraudApi.updateRule(id, { enabled: !enabled });
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    async function reviewAlert(id: number, status: string) {
        try {
            await fraudApi.review(id, { status, applyEnforcement: status === 'actioned' });
            toast.success('Updated');
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    async function runScan() {
        try {
            const res = await fraudApi.scan();
            toast.success(`Scan: ${res.data?.alertsCreated ?? 0} alerts`);
            load();
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Scan failed');
        }
    }

    return (
        <>
            <Header title={isAr ? 'مكافحة الاحتيال' : 'Fraud Desk'} />
            <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Fraud Desk</h2>
                    <button onClick={runScan} style={{
                        background: 'rgba(99,102,241,0.2)', border: 'none', color: '#818cf8',
                        padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                    }}>{isAr ? 'فحص الآن' : 'Run Scan'}</button>
                </div>

                {loading ? <p style={{ color: '#71717a' }}>Loading...</p> : (
                    <>
                        {stats && (
                            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, flex: 1 }}>
                                    <p style={{ fontSize: 11, color: '#71717a' }}>Open</p>
                                    <p style={{ fontSize: 24, fontWeight: 700, color: '#f87171' }}>{stats.open ?? 0}</p>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, flex: 1 }}>
                                    <p style={{ fontSize: 11, color: '#71717a' }}>Total</p>
                                    <p style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{stats.total ?? 0}</p>
                                </div>
                            </div>
                        )}

                        <h3 style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 8 }}>RULES</h3>
                        <table style={{ width: '100%', marginBottom: 32, fontSize: 13, borderCollapse: 'collapse' }}>
                            <tbody>
                                {rules.map((rule) => (
                                    <tr key={rule.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <td style={{ padding: 10, color: '#fff' }}>{rule.name}</td>
                                        <td style={{ padding: 10, color: '#71717a' }}>{rule.code}</td>
                                        <td style={{ padding: 10, color: rule.enabled ? '#4ade80' : '#71717a' }}>
                                            {rule.enabled ? 'ON' : 'OFF'}
                                        </td>
                                        <td style={{ padding: 10 }}>
                                            <button onClick={() => toggleRule(rule.id, rule.enabled)} style={{
                                                background: 'rgba(255,255,255,0.06)', border: 'none', color: '#d4d4d8',
                                                padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                                            }}>Toggle</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h3 style={{ color: '#a1a1aa', fontSize: 13, marginBottom: 8 }}>OPEN ALERTS</h3>
                        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                            <tbody>
                                {alerts.map((a) => (
                                    <tr key={a.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <td style={{ padding: 10, color: '#fff' }}>#{a.id} {a.type}</td>
                                        <td style={{ padding: 10, color: '#fbbf24' }}>{a.severity}</td>
                                        <td style={{ padding: 10, color: '#a1a1aa' }}>
                                            P:{a.passengerId ?? '—'} D:{a.driverId ?? '—'}
                                        </td>
                                        <td style={{ padding: 10 }}>
                                            <button onClick={() => reviewAlert(a.id, 'dismissed')} style={{ marginRight: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>Dismiss</button>
                                            <button onClick={() => reviewAlert(a.id, 'actioned')} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>Action</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </>
    );
}
