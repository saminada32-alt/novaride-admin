'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import {
    privacyDsrApi,
    type PrivacyDsrRequest,
    type PrivacyDsrStats,
    type PrivacyDsrStatus,
    type PrivacyDsrType,
} from '@/lib/api';
import { useI18n } from '@/lib/i18n';

const OPEN_STATUSES: PrivacyDsrStatus[] = ['submitted', 'identity_verified', 'in_progress'];

function isOverdue(row: PrivacyDsrRequest): boolean {
    return OPEN_STATUSES.includes(row.status) && new Date(row.dueAt) < new Date();
}

function downloadJson(data: unknown, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function PrivacyDsrPage() {
    const { isAr } = useI18n();
    const [rows, setRows] = useState<PrivacyDsrRequest[]>([]);
    const [stats, setStats] = useState<PrivacyDsrStats | null>(null);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [selected, setSelected] = useState<PrivacyDsrRequest | null>(null);
    const [adminNote, setAdminNote] = useState('');
    const [newStatus, setNewStatus] = useState<PrivacyDsrStatus>('in_progress');
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);

    const typeLabel: Record<PrivacyDsrType, { ar: string; en: string }> = {
        access: { ar: 'اطلاع', en: 'Access' },
        erasure: { ar: 'حذف / إخفاء', en: 'Erasure' },
        rectification: { ar: 'تصحيح', en: 'Rectification' },
        portability: { ar: 'نقل البيانات', en: 'Portability' },
        restriction: { ar: 'تقييد', en: 'Restriction' },
        objection: { ar: 'اعتراض', en: 'Objection' },
    };

    const statusStyle: Record<string, { bg: string; color: string }> = {
        submitted: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
        identity_verified: { bg: 'rgba(14,165,233,0.12)', color: '#38bdf8' },
        in_progress: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
        completed: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80' },
        rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
        cancelled: { bg: 'rgba(113,113,122,0.12)', color: '#a1a1aa' },
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params: {
                status?: PrivacyDsrStatus;
                type?: PrivacyDsrType;
                page?: number;
                limit?: number;
            } = { page: 1, limit: 50 };
            if (statusFilter !== 'all') params.status = statusFilter as PrivacyDsrStatus;
            if (typeFilter !== 'all') params.type = typeFilter as PrivacyDsrType;

            const [listRes, statsRes] = await Promise.all([
                privacyDsrApi.list(params),
                privacyDsrApi.getStats(),
            ]);
            setRows(listRes.data?.data ?? []);
            setTotal(listRes.data?.total ?? 0);
            setStats(statsRes.data);
        } catch {
            toast.error(isAr ? 'فشل تحميل طلبات الخصوصية' : 'Failed to load privacy requests');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, typeFilter, isAr]);

    useEffect(() => { load(); }, [load]);

    const openDetail = (row: PrivacyDsrRequest) => {
        setSelected(row);
        setAdminNote(row.adminNote ?? '');
        setNewStatus(
            row.status === 'submitted' ? 'identity_verified' : row.status,
        );
    };

    const refreshSelected = async (id: number) => {
        const res = await privacyDsrApi.list({ page: 1, limit: 50 });
        const updated = (res.data?.data ?? []).find((r) => r.id === id);
        if (updated) setSelected(updated);
        load();
    };

    const saveStatus = async () => {
        if (!selected) return;
        setActing(true);
        try {
            await privacyDsrApi.update(selected.id, {
                status: newStatus,
                adminNote: adminNote.trim() || undefined,
            });
            toast.success(isAr ? 'تم تحديث الطلب' : 'Request updated');
            await refreshSelected(selected.id);
        } catch {
            toast.error(isAr ? 'فشل التحديث' : 'Update failed');
        } finally {
            setActing(false);
        }
    };

    const fulfill = async (
        action: 'erasure' | 'access' | 'rectification',
    ) => {
        if (!selected) return;
        setActing(true);
        try {
            if (action === 'erasure') {
                await privacyDsrApi.fulfillErasure(selected.id);
                toast.success(isAr ? 'تم إخفاء هوية الحساب' : 'Account anonymized');
            } else if (action === 'access') {
                await privacyDsrApi.fulfillAccess(selected.id);
                toast.success(isAr ? 'تم توليد التصدير' : 'Export generated');
            } else {
                await privacyDsrApi.fulfillRectification(selected.id);
                toast.success(isAr ? 'تم تطبيق التصحيح' : 'Rectification applied');
            }
            await refreshSelected(selected.id);
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? (isAr ? 'فشل التنفيذ' : 'Fulfillment failed'));
        } finally {
            setActing(false);
        }
    };

    const statusFilters = [
        'all', 'submitted', 'identity_verified', 'in_progress', 'completed', 'rejected', 'cancelled',
    ];
    const typeFilters = [
        'all', 'access', 'erasure', 'rectification', 'portability', 'restriction', 'objection',
    ];

    const openCount = stats
        ? (stats.byStatus.submitted ?? 0)
            + (stats.byStatus.identity_verified ?? 0)
            + (stats.byStatus.in_progress ?? 0)
        : 0;

    return (
        <>
            <Header title={isAr ? 'طلبات الخصوصية (DSR)' : 'Privacy Requests (DSR)'} />
            <div style={{ padding: '28px 32px' }}>
                {stats && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: 12,
                        marginBottom: 16,
                    }}>
                        {[
                            {
                                label: isAr ? 'مفتوحة' : 'Open',
                                value: openCount,
                                color: '#818cf8',
                            },
                            {
                                label: isAr ? 'متأخرة' : 'Overdue',
                                value: stats.overdue,
                                color: stats.overdue > 0 ? '#f87171' : '#4ade80',
                            },
                            {
                                label: isAr ? 'مكتملة' : 'Completed',
                                value: stats.byStatus.completed ?? 0,
                                color: '#4ade80',
                            },
                            {
                                label: isAr ? 'SLA (أيام)' : 'SLA (days)',
                                value: stats.slaDays,
                                color: '#a1a1aa',
                            },
                        ].map((s) => (
                            <div key={s.label} style={{
                                padding: 16, borderRadius: 14,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.07)',
                            }}>
                                <p style={{ fontSize: 11, color: '#71717a', margin: 0 }}>{s.label}</p>
                                <p style={{
                                    fontSize: 24, fontWeight: 800, color: s.color, margin: '4px 0 0',
                                }}>
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#52525b', alignSelf: 'center' }}>
                        {isAr ? 'الحالة:' : 'Status:'}
                    </span>
                    {statusFilters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            style={{
                                padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                                border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                                background: statusFilter === f ? '#6366f1' : 'rgba(255,255,255,0.04)',
                                color: statusFilter === f ? '#fff' : '#a1a1aa',
                            }}
                        >
                            {f === 'all' ? (isAr ? 'الكل' : 'All') : f.replaceAll('_', ' ')}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#52525b', alignSelf: 'center' }}>
                        {isAr ? 'النوع:' : 'Type:'}
                    </span>
                    {typeFilters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setTypeFilter(f)}
                            style={{
                                padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                                border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                                background: typeFilter === f ? '#8b5cf6' : 'rgba(255,255,255,0.04)',
                                color: typeFilter === f ? '#fff' : '#a1a1aa',
                            }}
                        >
                            {f === 'all'
                                ? (isAr ? 'الكل' : 'All')
                                : (isAr ? typeLabel[f as PrivacyDsrType]?.ar : typeLabel[f as PrivacyDsrType]?.en) ?? f}
                        </button>
                    ))}
                </div>

                <p style={{ fontSize: 12, color: '#71717a', marginBottom: 12 }}>
                    {isAr ? `الإجمالي: ${total} طلب` : `Total: ${total} requests`}
                </p>

                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 16, overflow: 'hidden',
                }}>
                    {loading ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#71717a' }}>
                            {isAr ? 'جاري التحميل...' : 'Loading...'}
                        </div>
                    ) : rows.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#71717a' }}>
                            {isAr ? 'لا توجد طلبات' : 'No requests'}
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                                    fontSize: 11, color: '#71717a',
                                }}>
                                    {(isAr
                                        ? ['#', 'النوع', 'المستخدم', 'التفاصيل', 'الحالة', 'الموعد النهائي', 'إجراء']
                                        : ['#', 'Type', 'User', 'Details', 'Status', 'Due', 'Action']
                                    ).map((h) => (
                                        <th key={h} style={{ textAlign: 'left', padding: '12px 16px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => {
                                    const st = statusStyle[row.status] ?? statusStyle.cancelled;
                                    const overdue = isOverdue(row);
                                    const tl = typeLabel[row.type];
                                    return (
                                        <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{
                                                padding: '12px 16px', fontFamily: 'monospace',
                                                fontSize: 12, color: '#71717a',
                                            }}>
                                                #{row.id}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#e4e4e7' }}>
                                                {isAr ? tl?.ar : tl?.en}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>
                                                    {row.userRole} #{row.userId}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px', maxWidth: 200 }}>
                                                <p style={{
                                                    fontSize: 12, color: '#a1a1aa', margin: 0,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    {row.details ?? '—'}
                                                </p>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                                    background: st.bg, color: st.color,
                                                }}>
                                                    {row.status.replaceAll('_', ' ')}
                                                </span>
                                                {overdue && (
                                                    <span style={{
                                                        marginLeft: 6, fontSize: 10, color: '#f87171', fontWeight: 700,
                                                    }}>
                                                        {isAr ? 'متأخر' : 'OVERDUE'}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 12, color: '#71717a' }}>
                                                {new Date(row.dueAt).toLocaleDateString(isAr ? 'ar-SY' : 'en-US')}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <button
                                                    onClick={() => openDetail(row)}
                                                    style={{
                                                        padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                                                        background: '#6366f1', border: 'none', color: '#fff', cursor: 'pointer',
                                                    }}
                                                >
                                                    {isAr ? 'معالجة' : 'Handle'}
                                                </button>
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
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 50, padding: 16,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
                            padding: 24, borderRadius: 16,
                            background: 'rgba(15,15,20,0.98)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                            {isAr ? `طلب DSR #${selected.id}` : `DSR Request #${selected.id}`}
                        </h2>
                        <p style={{ fontSize: 12, color: '#71717a', margin: '0 0 16px' }}>
                            {selected.userRole} #{selected.userId}
                            {' · '}
                            {isAr ? typeLabel[selected.type].ar : typeLabel[selected.type].en}
                            {' · '}
                            {selected.status.replaceAll('_', ' ')}
                        </p>

                        {isOverdue(selected) && (
                            <div style={{
                                padding: 10, borderRadius: 10, marginBottom: 12,
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                                color: '#f87171', fontSize: 12, fontWeight: 600,
                            }}>
                                {isAr
                                    ? '⚠️ تجاوز موعد الاستجابة (30 يوم)'
                                    : '⚠️ Past SLA deadline (30 days)'}
                            </div>
                        )}

                        {selected.details && (
                            <p style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 12 }}>
                                {selected.details}
                            </p>
                        )}

                        {selected.rectificationPayload && Object.keys(selected.rectificationPayload).length > 0 && (
                            <pre style={{
                                fontSize: 11, color: '#a1a1aa', background: 'rgba(0,0,0,0.3)',
                                padding: 12, borderRadius: 8, overflow: 'auto', marginBottom: 12,
                            }}>
                                {JSON.stringify(selected.rectificationPayload, null, 2)}
                            </pre>
                        )}

                        <label style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 6 }}>
                            {isAr ? 'تحديث الحالة' : 'Update status'}
                        </label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as PrivacyDsrStatus)}
                            style={{
                                width: '100%', padding: 10, borderRadius: 8, marginBottom: 12,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                color: '#e4e4e7', fontSize: 13,
                            }}
                        >
                            {['submitted', 'identity_verified', 'in_progress', 'completed', 'rejected', 'cancelled'].map((s) => (
                                <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
                            ))}
                        </select>

                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={3}
                            placeholder={isAr ? 'ملاحظة إدارية...' : 'Admin note...'}
                            style={{
                                width: '100%', padding: 12, borderRadius: 10, marginBottom: 12,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                color: '#e4e4e7', fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box',
                            }}
                        />

                        {selected.status !== 'completed' && selected.status !== 'cancelled' && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                {(selected.type === 'erasure') && (
                                    <button
                                        disabled={acting}
                                        onClick={() => fulfill('erasure')}
                                        style={{
                                            padding: '10px 14px', borderRadius: 10, border: 'none',
                                            background: '#ef4444', color: '#fff', fontWeight: 700,
                                            fontSize: 12, cursor: 'pointer',
                                        }}
                                    >
                                        {isAr ? 'تنفيذ الإخفاء (Anonymize)' : 'Fulfill erasure (anonymize)'}
                                    </button>
                                )}
                                {(selected.type === 'access' || selected.type === 'portability') && (
                                    <button
                                        disabled={acting}
                                        onClick={() => fulfill('access')}
                                        style={{
                                            padding: '10px 14px', borderRadius: 10, border: 'none',
                                            background: '#22c55e', color: '#000', fontWeight: 700,
                                            fontSize: 12, cursor: 'pointer',
                                        }}
                                    >
                                        {isAr ? 'توليد التصدير' : 'Generate export'}
                                    </button>
                                )}
                                {selected.type === 'rectification' && (
                                    <button
                                        disabled={acting}
                                        onClick={() => fulfill('rectification')}
                                        style={{
                                            padding: '10px 14px', borderRadius: 10, border: 'none',
                                            background: '#0ea5e9', color: '#fff', fontWeight: 700,
                                            fontSize: 12, cursor: 'pointer',
                                        }}
                                    >
                                        {isAr ? 'تطبيق التصحيح' : 'Apply rectification'}
                                    </button>
                                )}
                            </div>
                        )}

                        {selected.exportPayload && (
                            <button
                                onClick={() => downloadJson(
                                    selected.exportPayload,
                                    `dsr-${selected.id}-export.json`,
                                )}
                                style={{
                                    width: '100%', padding: 10, borderRadius: 10, marginBottom: 12,
                                    border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)',
                                    color: '#4ade80', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                                }}
                            >
                                {isAr ? '⬇ تحميل JSON' : '⬇ Download export JSON'}
                            </button>
                        )}

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => setSelected(null)}
                                style={{
                                    flex: 1, padding: 12, borderRadius: 10,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'transparent', color: '#e4e4e7', fontWeight: 700, cursor: 'pointer',
                                }}
                            >
                                {isAr ? 'إغلاق' : 'Close'}
                            </button>
                            <button
                                disabled={acting}
                                onClick={saveStatus}
                                style={{
                                    flex: 1, padding: 12, borderRadius: 10, border: 'none',
                                    background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer',
                                }}
                            >
                                {isAr ? 'حفظ الحالة' : 'Save status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
