'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { documentsApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { DriverDocument } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function DocumentsPage() {
    const router = useRouter();
    const { t, isAr } = useI18n();
    const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
    const [docs, setDocs] = useState<DriverDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoad, setActionLoad] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<DriverDocument | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    async function load() {
        setLoading(true);
        try {
            const res = await documentsApi.getAll(filter);
            setDocs(res.data);
        } catch { toast.error('Failed'); }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, [filter]);

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
            await documentsApi.reject(rejectTarget.driver.id, rejectReason);
            toast.success(isAr ? 'تم الرفض' : 'Rejected');
            setRejectModal(false);
            load();
        } catch { toast.error('Failed'); }
        finally { setActionLoad(false); }
    }

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
            <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>

                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                        {t.documentReview}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#52525b' }}>
                        {docs.length} {filter === 'PENDING' ? t.pendingReviewDesc : (isAr ? 'وثائق' : 'documents')}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {filterTabs.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            style={{
                                padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                                border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                                background: filter === f.key ? '#6366f1' : 'rgba(255,255,255,0.04)',
                                color: filter === f.key ? '#fff' : '#a1a1aa',
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#52525b' }}>...</div>
                ) : docs.length === 0 ? (
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '16px', padding: '60px',
                        textAlign: 'center',
                    }}>
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
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#e4e4e7', marginBottom: '6px' }}>
                            {t.allCaughtUp}
                        </p>
                        <p style={{ fontSize: '13px', color: '#52525b' }}>{t.noDocsPending}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {docs.map(doc => (
                            <div key={doc.id} style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: '16px', padding: '20px 24px',
                            }}>
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
                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#e4e4e7' }}>
                                                {doc.driver.firstName && doc.driver.lastName
                                                    ? `${doc.driver.firstName} ${doc.driver.lastName}`
                                                    : doc.driver.phone}
                                            </p>
                                            <p style={{ fontSize: '11px', color: '#52525b', fontFamily: 'monospace' }}>
                                                {doc.driver.phone} · {formatRelativeTime(doc.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
                                            background: reviewStyle[doc.reviewStatus]?.bg ?? reviewStyle.PENDING.bg,
                                            color: reviewStyle[doc.reviewStatus]?.color ?? reviewStyle.PENDING.color,
                                        }}>
                                            {doc.reviewStatus === 'PENDING' ? t.pending
                                                : doc.reviewStatus === 'APPROVED' ? t.approved
                                                    : t.rejected}
                                        </span>
                                        <button onClick={() => router.push(`/drivers/${doc.driver.id}`)} style={{
                                            padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                            color: '#a1a1aa', cursor: 'pointer',
                                        }}>
                                            {t.view}
                                        </button>
                                        {doc.reviewStatus === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleApprove(doc)} disabled={actionLoad} style={{
                                                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
                                                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                                                    color: '#4ade80', cursor: 'pointer',
                                                }}>
                                                    {t.approve}
                                                </button>
                                                <button onClick={() => { setRejectTarget(doc); setRejectReason(''); setRejectModal(true); }} style={{
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

                                        const isValidUrl = (url: any) => {
                                            return url && url !== 'undefined' && url !== 'null';
                                        };
                                        return (
                                            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                                {isValidUrl(url) ? (
                                                    <a href={`${API_URL}${url}`} target="_blank" rel="noreferrer">
                                                        <div style={{
                                                            width: '72px',
                                                            height: '56px',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            position: 'relative',
                                                        }}>
                                                            <img
                                                                src={`${API_URL}${url}`}
                                                                alt={label}
                                                                //fill
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                    </a>
                                                ) : (
                                                    <div style={{
                                                        width: '72px', height: '56px', borderRadius: '8px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        border: '1px solid rgba(255,255,255,0.07)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                            <polyline points="14 2 14 8 20 8" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <span style={{ fontSize: '10px', color: url ? '#71717a' : '#3f3f46', textAlign: 'center', maxWidth: '72px' }}>
                                                    {label}
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
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setRejectModal(false)}>
                    <div style={{ width: '100%', maxWidth: '420px', background: '#111114', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{t.rejectDocs}</h3>
                        <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '20px', fontFamily: 'monospace' }}>{rejectTarget?.driver.phone}</p>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#71717a', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                            {t.reason.toUpperCase()}
                        </label>
                        <textarea
                            value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                            placeholder={t.reasonPlaceholder} rows={3}
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#e4e4e7', fontSize: '13px', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                            <button onClick={() => setRejectModal(false)} style={{ flex: 1, height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' }}>
                                {t.cancel}
                            </button>
                            <button onClick={handleReject} disabled={actionLoad} style={{ flex: 1, height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                {actionLoad ? '...' : t.reject}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}