'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { auditApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function AuditPage() {
    const { isAr } = useI18n();
    const [tab, setTab] = useState<'platform' | 'admin'>('platform');
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = tab === 'platform'
                ? await auditApi.getPlatform({ limit: 100 })
                : await auditApi.getAdmin({ limit: 100 });
            setRows(Array.isArray(res.data) ? res.data : res.data?.items ?? []);
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    return (
        <>
            <Header title={isAr ? 'سجل التدقيق' : 'Audit Logs'} />
            <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {(['platform', 'admin'] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            background: tab === t ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                            color: tab === t ? '#818cf8' : '#71717a', fontSize: 13,
                        }}>
                            {t === 'platform' ? 'Platform' : 'Admin'}
                        </button>
                    ))}
                </div>

                {loading ? <p style={{ color: '#71717a' }}>Loading...</p> : (
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: '#71717a' }}>
                                <th style={{ padding: 8, textAlign: 'left' }}>Time</th>
                                <th style={{ padding: 8, textAlign: 'left' }}>Action</th>
                                <th style={{ padding: 8, textAlign: 'left' }}>Actor</th>
                                <th style={{ padding: 8, textAlign: 'left' }}>Resource</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r: any) => (
                                <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                    <td style={{ padding: 8, color: '#71717a' }}>
                                        {new Date(r.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: 8, color: '#d4d4d8' }}>{r.action}</td>
                                    <td style={{ padding: 8, color: '#a1a1aa' }}>
                                        {r.actorId ?? r.adminId ?? r.actorType}
                                    </td>
                                    <td style={{ padding: 8, color: '#818cf8' }}>
                                        {r.resource ?? r.category} {r.resourceId ? `#${r.resourceId}` : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
