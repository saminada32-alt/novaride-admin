'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { documentsApi } from '@/lib/api';
import { approveDriverFull } from '@/lib/approve-driver';
import { formatRelativeTime } from '@/lib/utils';
import type { DriverDocument } from '@/lib/types';

import { AdminMediaImage, adminMediaSrc } from '@/components/ui/AdminMediaImage';
import { panel } from '@/lib/panel-styles';

export default function DocumentsPage() {
    const router = useRouter();
    const { t, isAr } = useI18n();
    const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
    const [docs, setDocs] = useState<DriverDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoad, setActionLoad] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<DriverDocument | null>(null);
    const [rejectField, setRejectField] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    async function load() {
        setLoading(true);
        try {
            const res = await documentsApi.getAll(filter);
            const rows = Array.isArray(res.data) ? res.data : (res.data as any)?.data ?? [];
            setDocs(rows);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? 'Failed';
            toast.error(isAr ? `تعذّر تحميل الوثائق: ${msg}` : `Failed to load documents: ${msg}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [filter]);

    async function handleApproveDriver(doc: DriverDocument) {
        setActionLoad(true);
        try {
            await approveDriverFull(doc.driver.id);
            toast.success(isAr ? 'تم قبول السائق بالكامل' : 'Driver fully approved');
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? 'Failed');
        } finally {
            setActionLoad(false);
        }
    }

    async function handleApprove(doc: DriverDocument) {
        setActionLoad(true);
        try {
            await documentsApi.approve(doc.driver.id);
            toast.success(isAr ? 'تم الاعتماد' : 'Approved');
            load();
        } catch { toast.error('Failed'); }
        finally { setActionLoad(false); }
    }

    async function handleReject() {
        if (!rejectTarget) return;
        setActionLoad(true);
        try {
            if (rejectField) {
                await documentsApi.rejectFields(rejectTarget.driver.id, {
                    fields: [rejectField],
                    reason: rejectReason || undefined,
                });
                toast.success(isAr ? 'تم طلب إعادة رفع الوثيقة' : 'Resubmit requested');
            } else {
                await documentsApi.reject(rejectTarget.driver.id, rejectReason);
                toast.success(isAr ? 'تم الرفض' : 'Rejected');
            }
            setRejectModal(false);
            setRejectField(null);
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.message ?? 'Failed');
        } finally {
            setActionLoad(false);
        }
    }

    function openRejectField(doc: DriverDocument, field: string) {
        setRejectTarget(doc);
        setRejectField(field);
        setRejectReason(doc.rejectedFields?.[field] ?? '');
        setRejectModal(true);
    }

    function openRejectAll(doc: DriverDocument) {
        setRejectTarget(doc);
        setRejectField(null);
        setRejectReason('');
        setRejectModal(true);
    }

    const hasResubmit = (doc: DriverDocument) =>
        doc.rejectedFields && Object.keys(doc.rejectedFields).length > 0;

    const reviewStyle: Record<string, { bg: string; color: string }> = {
        PENDING: { bg: 'rgba(245,158,11,0.1)', color: '#fbbf24' },
        APPROVED: { bg: 'rgba(34,197,94,0.1)', color: '#4ade80' },
        REJECTED: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
    };

    const filterTabs = [
        { key: 'all' as const, label: isAr ? 'الكل' : 'All' },
        { key: 'PENDING' as const, label: t.pending },
        { key: 'APPROVED' as const, label: t.approved },
        { key: 'REJECTED' as const, label: t.rejected },
    ];

    const docFields = [
        { key: 'idFront', label: t.idFront },
        { key: 'idBack', label: t.idBack },
        { key: 'licenseFront', label: t.licFront },
        { key: 'licenseBack', label: t.licBack },
        { key: 'vehicleFront', label: t.carFront },
        { key: 'vehicleBack', label: t.carBack },
        { key: 'driverPhoto', label: t.photo },
    ];

    return (
        <>
            <Header title={t.documents} />
            <div style={panel.page}>

                <div style={{ marginBottom: '24px' }}>
                    <h2 style={panel.title}>
                        {t.documentReview}
                    </h2>
                    <p style={panel.subtitle}>
                        {docs.length} {filter === 'PENDING' ? t.pendingReviewDesc : (isAr ? 'وثائق' : 'documents')}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {filterTabs.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            style={panel.tab(filter === f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', ...panel.textMuted }}>...</div>
                ) : docs.length === 0 ? (
                    <div style={{ ...panel.card, padding: '60px', textAlign: 'center' }}>
                        <div style={{
                            width: '48px', height: '48px',
                            background: 'rgba(34,197,94,0.1)',
                            border: '1px solid rgba(34,197,94,0.2)',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: '600', ...panel.text, marginBottom: '6px' }}>
                            {t.allCaughtUp}
                        </p>
                        <p style={{ fontSize: '13px', ...panel.textMuted }}>{t.noDocsPending}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {docs.map(doc => (
                            <div key={doc.id} style={{ ...panel.card, padding: '20px 24px' }}>
                                {/* Top */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                        onClick={() => router.push(`/drivers/${doc.driver.id}`)}
                                    >
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '9px',
                                            background: 'rgba(99,102,241,0.15)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '13px', fontWeight: '700', color: '#818cf8',
                                        }}>
                                            {(doc.driver.firstName?.[0] ?? doc.driver.phone[1]).toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: '600', ...panel.text }}>
                                                {doc.driver.firstName && doc.driver.lastName
                                                    ? `${doc.driver.firstName} ${doc.driver.lastName}`
                                                    : doc.driver.phone}
                                            </p>
                                            <p style={{ fontSize: '11px', ...panel.textMuted, fontFamily: 'monospace' }}>
                                                {doc.driver.phone} · {formatRelativeTime(doc.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
                                            background: hasResubmit(doc)
                                                ? 'rgba(245,158,11,0.15)'
                                                : reviewStyle[doc.reviewStatus]?.bg ?? reviewStyle.PENDING.bg,
                                            color: hasResubmit(doc)
                                                ? '#fbbf24'
                                                : reviewStyle[doc.reviewStatus]?.color ?? reviewStyle.PENDING.color,
                                        }}>
                                            {hasResubmit(doc)
                                                ? (isAr ? 'بانتظار إعادة الرفع' : 'Awaiting resubmit')
                                                : doc.reviewStatus === 'PENDING' ? t.pending
                                                    : doc.reviewStatus === 'APPROVED' ? t.approved
                                                        : t.rejected}
                                        </span>
                                        {!doc.driver.isApproved && (
                                            <button
                                                onClick={() => handleApproveDriver(doc)}
                                                disabled={actionLoad || !!hasResubmit(doc)}
                                                style={{
                                                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                                                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                                    color: '#a5b4fc', cursor: (actionLoad || hasResubmit(doc)) ? 'not-allowed' : 'pointer',
                                                    opacity: hasResubmit(doc) ? 0.5 : 1,
                                                }}
                                            >
                                                {isAr ? 'قبول السائق' : 'Approve driver'}
                                            </button>
                                        )}
                                        <button onClick={() => router.push(`/drivers/${doc.driver.id}`)} style={{
                                            padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                                            background: 'var(--bg-hover)', border: '1px solid var(--border)',
                                            color: 'var(--text-2)', cursor: 'pointer',
                                        }}>
                                            {t.view}
                                        </button>
                                        {doc.reviewStatus === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleApprove(doc)} disabled={actionLoad || !!hasResubmit(doc)} style={{
                                                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
                                                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                                                    color: '#4ade80', cursor: (actionLoad || hasResubmit(doc)) ? 'not-allowed' : 'pointer',
                                                    opacity: hasResubmit(doc) ? 0.5 : 1,
                                                }}>
                                                    {t.approve}
                                                </button>
                                                <button onClick={() => openRejectAll(doc)} style={{
                                                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
                                                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                                                    color: '#f87171', cursor: 'pointer',
                                                }}>
                                                    {t.reject}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Docs */}
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {docFields.map(({ key, label }) => {
                                        const url = (doc as any)[key];
                                        const fieldRejected = doc.rejectedFields?.[key];
                                        const isValidUrl = (u: any) => u && u !== 'undefined' && u !== 'null';
                                        return (
                                            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                                {isValidUrl(url) ? (
                                                    <div style={{ position: 'relative' }}>
                                                        <a href={adminMediaSrc(url) ?? '#'} target="_blank" rel="noreferrer">
                                                            <div style={{
                                                                width: '72px',
                                                                height: '56px',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                border: fieldRejected
                                                                    ? '2px solid #ef4444'
                                                                    : '1px solid var(--border)',
                                                                position: 'relative',
                                                            }}>
                                                                <AdminMediaImage
                                                                    path={url}
                                                                    alt={label}
                                                                    width="100%"
                                                                    height="100%"
                                                                />
                                                            </div>
                                                        </a>
                                                        {doc.reviewStatus === 'PENDING' && (
                                                            <button
                                                                title={isAr ? 'رفض هذه الوثيقة' : 'Reject this document'}
                                                                onClick={() => openRejectField(doc, key)}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: -6,
                                                                    right: -6,
                                                                    width: 20,
                                                                    height: 20,
                                                                    borderRadius: '50%',
                                                                    border: 'none',
                                                                    background: '#ef4444',
                                                                    color: '#fff',
                                                                    fontSize: 12,
                                                                    cursor: 'pointer',
                                                                    lineHeight: '20px',
                                                                }}
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : fieldRejected ? (
                                                    <div style={{
                                                        width: '72px', height: '56px', borderRadius: '8px',
                                                        background: 'rgba(239,68,68,0.08)',
                                                        border: '2px dashed #ef4444',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        padding: 4,
                                                    }}>
                                                        <span style={{ fontSize: 9, color: '#f87171', textAlign: 'center' }}>
                                                            {isAr ? 'بانتظار إعادة الرفع' : 'Resubmit'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        width: '72px', height: '56px', borderRadius: '8px',
                                                        background: 'var(--bg-hover)',
                                                        border: '1px solid var(--border)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                            <polyline points="14 2 14 8 20 8" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <span style={{
                                                    fontSize: '10px',
                                                    color: fieldRejected ? '#f87171' : url ? '#71717a' : '#3f3f46',
                                                    textAlign: 'center',
                                                    maxWidth: '72px',
                                                }}>
                                                    {label}
                                                    {fieldRejected && (
                                                        <span style={{ display: 'block', marginTop: 2 }}>
                                                            {fieldRejected}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => { setRejectModal(false); setRejectField(null); }}>
                    <div style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', ...panel.text, marginBottom: '8px' }}>
                            {rejectField
                                ? (isAr ? 'رفض وثيقة واحدة' : 'Reject single document')
                                : t.rejectDocs}
                        </h3>
                        <p style={{ fontSize: '13px', ...panel.textMuted, marginBottom: '20px', fontFamily: 'monospace' }}>
                            {rejectTarget?.driver.phone}
                            {rejectField && ` · ${rejectField}`}
                        </p>
                        {rejectField && (
                            <p style={{ fontSize: '12px', color: '#fbbf24', marginBottom: '12px' }}>
                                {isAr
                                    ? 'السائق يبقى معلّقاً وسيصله إشعار لإعادة رفع هذه الوثيقة فقط.'
                                    : 'Driver stays pending and gets notified to re-upload this document only.'}
                            </p>
                        )}
                        <label style={{ fontSize: '11px', fontWeight: '600', ...panel.textMuted, letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                            {t.reason.toUpperCase()}
                        </label>
                        <textarea
                            value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                            placeholder={t.reasonPlaceholder} rows={3}
                            style={{ width: '100%', padding: '12px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-1)', fontSize: '13px', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                            <button onClick={() => { setRejectModal(false); setRejectField(null); }} style={{ flex: 1, height: '40px', borderRadius: '10px', background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '13px', cursor: 'pointer' }}>
                                {t.cancel}
                            </button>
                            <button onClick={handleReject} disabled={actionLoad} style={{ flex: 1, height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                {actionLoad ? '...' : rejectField ? (isAr ? 'طلب إعادة الرفع' : 'Request resubmit') : t.reject}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}