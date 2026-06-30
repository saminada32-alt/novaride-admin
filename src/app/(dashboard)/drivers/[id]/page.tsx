'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { driversApi, documentsApi } from '@/lib/api';
import type { Driver, DriverDocument } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const toUrl = (p?: string | null) =>
    !p || p === 'undefined' || p === 'null'
        ? null
        : p.startsWith('http')
            ? p
            : `${BASE}${p}`;

const Card = ({ title, icon, children }: any) => (
    <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 16,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
    }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            color: '#c4b5fd',
            fontSize: 13,
            fontWeight: 800
        }}>
            <span>{icon}</span>
            {title}
        </div>
        {children}
    </div>
);

const Row = ({ label, value }: any) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '7px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        fontSize: 13
    }}>
        <span style={{ color: '#a1a1aa' }}>{label}</span>
        <span style={{ color: '#fff', fontWeight: 600 }}>{value || '—'}</span>
    </div>
);

const Status = ({ driver }: { driver: Driver }) => {
    const s = driver.isApproved
        ? { t: 'مقبول', c: '#22c55e', g: 'rgba(34,197,94,0.25)' }
        : driver.isRejected
            ? { t: 'مرفوض', c: '#ef4444', g: 'rgba(239,68,68,0.25)' }
            : { t: 'قيد المراجعة', c: '#f59e0b', g: 'rgba(245,158,11,0.25)' };

    return (
        <div style={{
            padding: '10px 14px',
            borderRadius: 14,
            border: `1px solid ${s.c}`,
            color: s.c,
            fontWeight: 900,
            background: 'rgba(255,255,255,0.04)',
            boxShadow: `0 0 18px ${s.g}`
        }}>
            {s.t}
        </div>
    );
};

const Doc = ({ src, label }: any) => {
    const [open, setOpen] = useState(false);
    const url = toUrl(src);

    return (
        <>
            <div onClick={() => url && setOpen(true)} style={{
                cursor: 'pointer',
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                background: '#111'
            }}>
                <img
                    src={url || '/placeholder.png'}
                    style={{ width: '100%', height: 90, objectFit: 'cover' }}
                />
                <div style={{
                    padding: 6,
                    fontSize: 11,
                    textAlign: 'center',
                    color: '#a1a1aa'
                }}>
                    {label}
                </div>
            </div>

            {open && (
                <div onClick={() => setOpen(false)} style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50
                }}>
                    <img src={url || '/placeholder.png'} style={{ maxWidth: '85%', maxHeight: '85%' }} />
                </div>
            )}
        </>
    );
};

export default function DriverDetailPage() {
    const { id } = useParams();
    const { isAr } = useI18n();

    const [driver, setDriver] = useState<Driver | null>(null);
    const [doc, setDoc] = useState<DriverDocument | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [d, docRes] = await Promise.all([
                    driversApi.getOne(Number(id)),
                    documentsApi.getByDriver(Number(id)),
                ]);
                setDriver(d.data);
                setDoc(docRes.data);
            } catch {
                toast.error('error loading');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <div style={{ color: '#fff' }}>Loading...</div>;
    if (!driver) return null;

    const docData = doc || (driver as any).documents;
    const vehicle = (driver as any).vehicles?.[0];
    const loc = (driver as any).locationHistory?.[0];

    const name = `${driver.firstName || ''} ${driver.lastName || ''}`.trim();

    const docCount = [
        docData?.driverPhoto,
        docData?.idFront,
        docData?.idBack,
        docData?.licenseFront,
        docData?.licenseBack,
        docData?.vehicleFront,
        docData?.vehicleBack,
    ].filter(Boolean).length;

    const registrationType = (driver as any).registrationType || 'فرد';
    const companyName = (driver as any).companyName || null;

    /* =========================
       🔥 EXTRA FIELDS ADDED
    ========================= */

    const createdAt = (driver as any).createdAt;
    const approvedAt = (driver as any).approvedAt;
    const workHours = (driver as any).workHours || '—';
    const rides = (driver as any).rides || [];
    const notes = (driver as any).notes || [];
    const rejectionReason = (driver as any).rejectionReason;
    const suspendedAt = (driver as any).suspendedAt as string | undefined;
    const suspendReason = (driver as any).suspendReason as string | undefined;

    async function suspendDriver() {
        const reason = prompt(isAr ? 'سبب التعليق' : 'Suspend reason') ?? '';
        try {
            await driversApi.suspend(Number(id), reason || 'Suspended by admin');
            toast.success(isAr ? 'تم تعليق السائق' : 'Driver suspended');
            const d = await driversApi.getOne(Number(id));
            setDriver(d.data);
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    async function unsuspendDriver() {
        try {
            await driversApi.unsuspend(Number(id));
            toast.success(isAr ? 'تم إلغاء التعليق' : 'Driver unsuspended');
            const d = await driversApi.getOne(Number(id));
            setDriver(d.data);
        } catch (e: any) {
            toast.error(e.response?.data?.message ?? 'Failed');
        }
    }

    const approvedDays =
        approvedAt
            ? Math.floor((Date.now() - new Date(approvedAt).getTime()) / (1000 * 60 * 60 * 24))
            : null;

    const completion =
        Math.round((docCount / 7) * 100);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top, #1a1033, #0b0b10)',
            padding: 22,
            color: '#fff'
        }}>
            <Header />

            {/* ================= HERO (UPDATED) ================= */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
                padding: 18,
                borderRadius: 18,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
            }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <img
                        src={toUrl(docData?.driverPhoto) || '/placeholder.png'}
                        style={{
                            width: 70,
                            height: 70,
                            borderRadius: 14,
                            border: '2px solid #a78bfa'
                        }}
                    />

                    <div>
                        <div style={{ fontSize: 20, fontWeight: 900 }}>{name}</div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>
                            {driver.phone || '—'} | {driver.email || '—'}
                        </div>


                        <div style={{ marginTop: 6, fontSize: 11, color: '#a1a1aa' }}>
                            {registrationType} {companyName && `• ${companyName}`}
                        </div>

                        {rejectionReason && (
                            <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                                سبب الرفض: {rejectionReason}
                            </div>
                        )}
                        {suspendedAt && (
                            <div style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>
                                {isAr ? 'معلّق' : 'Suspended'}: {suspendReason ?? '—'}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <Status driver={driver} />
                    {suspendedAt ? (
                        <button
                            onClick={unsuspendDriver}
                            style={{
                                background: 'rgba(34,197,94,0.15)',
                                border: 'none',
                                color: '#4ade80',
                                padding: '6px 12px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 12,
                            }}
                        >
                            {isAr ? 'إلغاء التعليق' : 'Unsuspend'}
                        </button>
                    ) : (
                        <button
                            onClick={suspendDriver}
                            style={{
                                background: 'rgba(239,68,68,0.15)',
                                border: 'none',
                                color: '#f87171',
                                padding: '6px 12px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 12,
                            }}
                        >
                            {isAr ? 'تعليق السائق' : 'Suspend driver'}
                        </button>
                    )}
                </div>
            </div>

            {/* 📊 COMPLETION */}
            <Card title="📊 اكتمال الملف" icon="📊">
                <Row label="النسبة" value={`${completion}%`} />
            </Card>

            {/* 📅 DATES */}
            <Card title="📅 التواريخ" icon="📅">
                <Row label="تاريخ الانضمام" value={createdAt && new Date(createdAt).toLocaleDateString()} />
                <Row label="تاريخ القبول" value={approvedAt && new Date(approvedAt).toLocaleDateString()} />
                {approvedDays !== null && (
                    <Row label="منذ القبول" value={`${approvedDays} يوم`} />
                )}
            </Card>

            {/* ⏰ WORK HOURS */}
            <Card title="⏰ ساعات العمل" icon="⏰">
                <Row label="الساعات" value={workHours} />
            </Card>

            {/* 🟣 TIMELINE */}
            <Card title="🟣 حياة السائق" icon="🟣">
                <div style={{ fontSize: 13, color: '#aaa' }}>
                    • إنشاء الحساب<br />
                    • رفع الوثائق<br />
                    • مراجعة الإدارة<br />
                    {approvedAt && '• تم القبول'}
                </div>
            </Card>

            {/* 🚗 RIDES */}
            {driver.isApproved && (
                <Card title="🚗 الرحلات" icon="🚗">
                    {rides.length === 0 ? (
                        <div style={{ color: '#888' }}>لا يوجد رحلات</div>
                    ) : (
                        rides.map((r: any, i: number) => (
                            <Row key={i} label={r.date} value={r.status} />
                        ))
                    )}
                </Card>
            )}

            {/* 🟡 NOTES */}
            <Card title="🟡 ملاحظات الإدارة" icon="🟡">
                {notes.length === 0 ? (
                    <div style={{ color: '#888' }}>لا توجد ملاحظات</div>
                ) : (
                    notes.map((n: any, i: number) => (
                        <div key={i} style={{
                            padding: 8,
                            marginBottom: 6,
                            background: '#1a1a1a',
                            borderRadius: 8
                        }}>
                            {n.text}
                        </div>
                    ))
                )}

                <button style={{
                    marginTop: 10,
                    padding: '8px 12px',
                    background: '#a78bfa',
                    border: 0,
                    borderRadius: 8,
                    color: '#000',
                    fontWeight: 700
                }}>
                    + إضافة ملاحظة
                </button>
            </Card>

            {/* GRID (UNCHANGED - FULL ORIGINAL KEPT) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 12
            }}>
                <Card title="👤 المعلومات الشخصية" icon="👤">
                    <Row label="الاسم" value={name} />
                    <Row label="الهاتف" value={driver.phone} />
                    <Row label="الإيميل" value={driver.email} />
                    <Row label="الهوية" value={(driver as any).nationalId} />
                </Card>

                <Card title="🧾 التسجيل" icon="🧾">
                    <Row label="نوع التسجيل" value={registrationType} />
                    <Row label="اسم المكتب" value={companyName} />
                </Card>

                <Card title="🚗 السيارة" icon="🚘">
                    {vehicle ? (
                        <>
                            <Row label="الماركة" value={vehicle.brand} />
                            <Row label="الموديل" value={vehicle.model} />
                            <Row label="النوع" value={vehicle.type} />
                            <Row label="سنة الصنع" value={vehicle.manufactureYear} />
                            <Row label="عدد الركاب" value={vehicle.passengerCount} />
                            <Row label="اللوحة" value={vehicle.plateNumber} />
                            <Row label="اللون" value={vehicle.color} />
                        </>
                    ) : <div style={{ color: '#888' }}>لا يوجد سيارة</div>}
                </Card>

                <Card title="📍 العمل" icon="📍">
                    <Row label="المدينة" value={loc?.city} />
                    <Row label="المنطقة" value={loc?.workArea} />
                    <Row label="العنوان" value={loc?.address} />
                </Card>

                <Card title="📄 الوثائق" icon="📄">
                    <Row label="عدد الوثائق" value={`${docCount} / 7`} />

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 8,
                        marginTop: 10
                    }}>
                        <Doc src={docData?.driverPhoto} label="صورة" />
                        <Doc src={docData?.idFront} label="هوية" />
                        <Doc src={docData?.licenseFront} label="رخصة" />
                        <Doc src={docData?.vehicleFront} label="السيارة" />
                        <Doc src={docData?.vehicleBack} label="خلف السيارة" />
                    </div>
                </Card>
            </div>
        </div>
    );
}