'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { complaintsApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

export default function ComplaintsPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [filter, setFilter] = useState('all');
    const [selected, setSelected] = useState<any>(null);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);
    const { isAr } = useI18n();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [c, s] = await Promise.all([
                complaintsApi.getAll(filter),
                complaintsApi.getStats(),
            ]);
            setComplaints(Array.isArray(c.data) ? c.data : []);
            setStats(s.data);
        } catch {
            toast.error(isAr ? 'فشل تحميل الشكاوى' : 'Failed to load complaints');
        } finally {
            setLoading(false);
        }
    }, [filter, isAr]);

    useEffect(() => { load(); }, [load]);
    useRealtimeUpdates(load);

    const resolve = async (id: number, status: string) => {
        try {
            await complaintsApi.resolve(id, { status, adminNote: note });
            setSelected(null);
            setNote('');
            load();
        } catch {
            toast.error(isAr ? 'فشل المعالجة' : 'Failed to resolve');
        }
    };

    const statusStyle: Record<string, { bg: string; color: string }> = {
        open: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
        in_review: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
        resolved: { bg: 'rgba(34,197,94,0.1)', color: '#4ade80' },
        rejected: { bg: 'rgba(113,113,122,0.1)', color: '#a1a1aa' },
    };

    const typeIcon: Record<string, string> = {
        driver: '🚗', passenger: '👤', technical: '⚙️',
        billing: '💰', safety: '🚨',
    };

    const filters = ['all', 'open', 'in_review', 'resolved', 'rejected'];

    return (
        <>
            <Header title={isAr ? 'الشكاوى' : 'Complaints'} />
            <div style={{ padding: '28px 32px' }}>
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                        {[
                            { label: isAr ? 'مفتوحة' : 'Open', value: stats.open },
                            { label: isAr ? 'قيد المراجعة' : 'In Review', value: stats.inReview },
                            { label: isAr ? 'محلولة' : 'Resolved', value: stats.resolved },
                            { label: isAr ? 'الإجمالي' : 'Total', value: stats.total },
                        ].map((s) => (
                            <div key={s.label} style={{
                                padding: 16, borderRadius: 14,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.07)',
                            }}>
                                <p style={{ fontSize: 11, color: '#71717a', margin: 0 }}>{s.label}</p>
                                <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                                border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                                background: filter === f ? '#6366f1' : 'rgba(255,255,255,0.04)',
                                color: filter === f ? '#fff' : '#a1a1aa',
                            }}
                        >
                            {f.replaceAll('_', ' ')}
                        </button>
                    ))}
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16, overflow: 'hidden',
                }}>
                    {loading ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#71717a' }}>
                            {isAr ? 'جاري التحميل...' : 'Loading...'}
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#71717a' }}>
                                    {(isAr
                                        ? ['#', 'النوع', 'المستخدم', 'الوصف', 'الحالة', 'التاريخ', 'إجراء']
                                        : ['#', 'Type', 'User', 'Description', 'Status', 'Date', 'Action']
                                    ).map((h) => (
                                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((c) => {
                                    const user = c.passenger ?? c.driver;
                                    const st = statusStyle[c.status] ?? statusStyle.rejected;
                                    return (
                                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#71717a' }}>#{c.id}</td>
                                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#e4e4e7' }}>
                                                {typeIcon[c.type] ?? '📝'} {c.type}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>
                                                    {user?.firstName ?? user?.phone ?? '—'}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#71717a' }}>{user?.phone}</div>
                                            </td>
                                            <td style={{ padding: '12px 16px', maxWidth: 240 }}>
                                                <p style={{ fontSize: 13, color: '#a1a1aa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {c.description}
                                                </p>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                                    background: st.bg, color: st.color,
                                                }}>
                                                    {c.status.replaceAll('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 12, color: '#71717a' }}>
                                                {new Date(c.createdAt).toLocaleDateString(isAr ? 'ar-SY' : 'en-US')}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {(c.status === 'open' || c.status === 'in_review') && (
                                                    <button
                                                        onClick={() => setSelected(c)}
                                                        style={{
                                                            padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                                                            background: '#6366f1', border: 'none', color: '#fff', cursor: 'pointer',
                                                        }}
                                                    >
                                                        {isAr ? 'مراجعة' : 'Review'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selected && (
                <div
                    onClick={() => setSelected(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: 480, padding: 24, borderRadius: 16,
                            background: 'rgba(15,15,20,0.98)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                            {isAr ? `مراجعة الشكوى #${selected.id}` : `Review Complaint #${selected.id}`}
                        </h2>
                        <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 16 }}>{selected.description}</p>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            placeholder={isAr ? 'ملاحظة للمستخدم...' : 'Note to user...'}
                            style={{
                                width: '100%', padding: 12, borderRadius: 10, marginBottom: 16,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                color: '#e4e4e7', fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setSelected(null)} style={{
                                flex: 1, padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                                background: 'transparent', color: '#e4e4e7', fontWeight: 700, cursor: 'pointer',
                            }}>
                                {isAr ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button onClick={() => resolve(selected.id, 'rejected')} style={{
                                flex: 1, padding: 12, borderRadius: 10, border: 'none',
                                background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer',
                            }}>
                                {isAr ? 'رفض' : 'Reject'}
                            </button>
                            <button onClick={() => resolve(selected.id, 'resolved')} style={{
                                flex: 1, padding: 12, borderRadius: 10, border: 'none',
                                background: '#22c55e', color: '#000', fontWeight: 700, cursor: 'pointer',
                            }}>
                                {isAr ? 'حل' : 'Resolve'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
